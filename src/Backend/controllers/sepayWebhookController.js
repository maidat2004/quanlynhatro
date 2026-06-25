import crypto from 'crypto';
import Invoice from '../models/Invoice.js';
import PaymentTransaction from '../models/PaymentTransaction.js';

const ok = (res) => res.status(200).json({ success: true });

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const verifyApiKey = (req) => {
  const expected = process.env.SEPAY_API_KEY;
  if (!expected) return true;

  const auth = req.get('authorization') || '';
  return safeCompare(auth, `Apikey ${expected}`);
};

const verifyHmac = (req, rawBody) => {
  const secret = process.env.SEPAY_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = req.get('x-sepay-signature') || '';
  const timestamp = req.get('x-sepay-timestamp') || '';
  const timestampNumber = Number(timestamp);

  if (!signature || !timestampNumber) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > 300) return false;

  const expected = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')}`;

  return safeCompare(expected, signature);
};

const parseRawPayload = (req) => {
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body.toString('utf8')
    : JSON.stringify(req.body || {});

  return {
    rawBody,
    payload: rawBody ? JSON.parse(rawBody) : {}
  };
};

const extractInvoiceNumber = (payload) => {
  // 1. Search for HD pattern in content, description, code, subAccount first
  const fields = [
    payload.content,
    payload.description,
    payload.code,
    payload.subAccount
  ];
  
  for (const field of fields) {
    if (field) {
      const text = String(field).toUpperCase();
      const match = text.match(/HD[0-9A-Z_-]{4,}/);
      if (match) {
        return match[0];
      }
    }
  }

  // 2. Fallback to direct code if no HD pattern is found anywhere
  const directCode = String(payload.code || payload.subAccount || '').trim().toUpperCase();
  return directCode;
};

const parseTransactionDate = (value) => {
  if (!value) return undefined;
  const normalized = String(value).replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const createLog = async (payload, invoiceNumber) => {
  return PaymentTransaction.create({
    sepayTransactionId: payload.id,
    invoiceNumber,
    gateway: payload.gateway,
    accountNumber: payload.accountNumber,
    subAccount: payload.subAccount,
    code: payload.code,
    content: payload.content,
    description: payload.description,
    transferType: payload.transferType,
    transferAmount: Number(payload.transferAmount || 0),
    accumulated: Number(payload.accumulated || 0),
    referenceCode: payload.referenceCode,
    transactionDate: parseTransactionDate(payload.transactionDate),
    payload
  });
};

export const receiveSepayWebhook = async (req, res) => {
  let transactionLog;

  try {
    const { rawBody, payload } = parseRawPayload(req);

    if (!verifyApiKey(req) || !verifyHmac(req, rawBody)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!payload.id) {
      return res.status(400).json({ success: false, message: 'Missing SePay transaction id' });
    }

    const invoiceNumber = extractInvoiceNumber(payload);

    try {
      transactionLog = await createLog(payload, invoiceNumber);
    } catch (error) {
      if (error?.code === 11000) {
        return ok(res);
      }
      throw error;
    }

    if (payload.transferType !== 'in') {
      transactionLog.status = 'ignored';
      transactionLog.reason = 'Khong phai giao dich tien vao';
      await transactionLog.save();
      return ok(res);
    }

    if (!invoiceNumber) {
      transactionLog.status = 'unmatched';
      transactionLog.reason = 'Khong tim thay ma hoa don trong noi dung chuyen khoan';
      await transactionLog.save();
      return ok(res);
    }

    const transferAmount = Number(payload.transferAmount || 0);
    const invoice = await Invoice.findOneAndUpdate(
      {
        invoiceNumber,
        status: { $in: ['pending', 'overdue', 'payment_submitted'] },
        totalAmount: { $lte: transferAmount }
      },
      {
        $set: {
          status: 'paid',
          paidDate: new Date(),
          paymentMethod: 'sepay',
          notes: `Thanh toan tu dong qua SePay. Ma GD: ${payload.id}`
        }
      },
      {
        new: true
      }
    );

    if (!invoice) {
      const existingInvoice = await Invoice.findOne({ invoiceNumber });
      transactionLog.status = 'unmatched';
      transactionLog.invoice = existingInvoice?._id;
      transactionLog.reason = existingInvoice
        ? 'Hoa don da thanh toan, da huy hoac so tien chuyen chua du'
        : 'Khong tim thay hoa don theo ma thanh toan';
      await transactionLog.save();
      return ok(res);
    }

    transactionLog.status = 'matched';
    transactionLog.invoice = invoice._id;
    transactionLog.reason = 'Da tu dong xac nhan hoa don thanh toan';
    await transactionLog.save();

    return ok(res);
  } catch (error) {
    console.error('SePay webhook error:', error);

    if (transactionLog) {
      transactionLog.status = 'failed';
      transactionLog.reason = error.message;
      await transactionLog.save().catch(() => {});
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};
