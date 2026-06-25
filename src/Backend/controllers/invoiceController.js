import Invoice from '../models/Invoice.js';
import Contract from '../models/Contract.js';
import Tenant from '../models/Tenant.js';
import Service from '../models/Service.js';
import { sendInvoiceEmail } from '../utils/mailer.js';

const normalizeStatus = (status) => {
  if (status === 'unpaid') return 'pending';
  return status || 'pending';
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const buildDefaultDueDate = async (tenantId, month, year) => {
  const [tenant, paidInvoice] = await Promise.all([
    Tenant.findById(tenantId).select('moveInDate'),
    Invoice.findOne({ tenant: tenantId, status: 'paid' }).select('_id')
  ]);

  const moveIn = tenant?.moveInDate ? new Date(tenant.moveInDate) : null;
  if (
    !paidInvoice &&
    moveIn &&
    !Number.isNaN(moveIn.getTime()) &&
    moveIn.getFullYear() === year &&
    moveIn.getMonth() + 1 === month &&
    moveIn.getDate() > 5
  ) {
    return moveIn;
  }

  const dueDay = Math.min(5, getDaysInMonth(year, month));
  return new Date(year, month - 1, dueDay);
};

const buildInvoicePayload = async (body) => {
  const payload = { ...body };

  if (payload.month !== undefined) {
    if (typeof payload.month === 'string' && payload.month.includes('-')) {
      const [year, month] = payload.month.split('-').map((value) => parseInt(value, 10));
      payload.year = year;
      payload.month = month;
    } else {
      payload.month = parseInt(payload.month, 10);
    }
  }

  if (payload.year !== undefined) {
    payload.year = parseInt(payload.year, 10);
  }

  if (payload.status !== undefined) {
    payload.status = normalizeStatus(payload.status);
  }

  if (!payload.paymentMethod) {
    payload.paymentMethod = 'transfer';
  }

  const hasRoomRentInput = payload.roomRent !== undefined || payload.roomPrice !== undefined;
  if (hasRoomRentInput) {
    payload.roomRent = Number(payload.roomRent ?? payload.roomPrice ?? 0);
  }

  const services = [];
  const hasUtilityInput =
    payload.electricUsage !== undefined ||
    payload.electricPrice !== undefined ||
    payload.waterUsage !== undefined ||
    payload.waterPrice !== undefined ||
    payload.additionalServices !== undefined;

  const electricUsage = Number(payload.electricUsage || 0);
  const electricPrice = Number(payload.electricPrice || 0);
  const waterUsage = Number(payload.waterUsage || 0);
  const waterPrice = Number(payload.waterPrice || 0);

  if (electricUsage > 0 || electricPrice > 0) {
    const electricService = await Service.findOne({ type: 'electricity' });
    services.push({
      service: electricService?._id,
      name: electricService?.name || 'Tiền điện',
      quantity: electricUsage,
      unitPrice: electricPrice,
      amount: electricUsage * electricPrice
    });
  }

  if (waterUsage > 0 || waterPrice > 0) {
    const waterService = await Service.findOne({ type: 'water' });
    services.push({
      service: waterService?._id,
      name: waterService?.name || 'Tiền nước',
      quantity: waterUsage,
      unitPrice: waterPrice,
      amount: waterUsage * waterPrice
    });
  }

  if (Array.isArray(payload.additionalServices)) {
    payload.additionalServices.forEach((service) => {
      const amount = Number(service.amount ?? service.cost ?? 0);
      if (amount > 0) {
        services.push({
          name: service.name || 'Dịch vụ khác',
          quantity: Number(service.quantity || 1),
          unitPrice: Number(service.unitPrice ?? amount),
          amount
        });
      }
    });
  }

  if (hasUtilityInput && (!Array.isArray(payload.services) || payload.services.length === 0)) {
    payload.services = services;
  }

  const serviceTotal = (payload.services || []).reduce((sum, service) => {
    return sum + Number(service.amount || 0);
  }, 0);

  if (payload.totalAmount !== undefined) {
    payload.totalAmount = Number(payload.totalAmount);
  } else if (hasRoomRentInput || hasUtilityInput) {
    payload.totalAmount = Number(payload.roomRent || 0) + serviceTotal;
  }

  if (!payload.dueDate && payload.tenant && payload.month && payload.year) {
    payload.dueDate = await buildDefaultDueDate(payload.tenant, payload.month, payload.year);
  }

  if (!payload.invoiceNumber && payload.room && payload.tenant && payload.month) {
    const monthText = String(payload.month || new Date().getMonth() + 1).padStart(2, '0');
    payload.invoiceNumber = `HD${payload.year || new Date().getFullYear()}${monthText}${Date.now().toString().slice(-6)}`;
  }

  delete payload.roomPrice;
  delete payload.electricUsage;
  delete payload.electricPrice;
  delete payload.waterUsage;
  delete payload.waterPrice;
  delete payload.additionalServices;

  return payload;
};

const populateInvoiceForEmail = (invoiceId) => {
  return Invoice.findById(invoiceId)
    .populate('room', 'roomNumber floor')
    .populate({
      path: 'tenant',
      select: 'fullName phone email user',
      populate: {
        path: 'user',
        select: 'email name'
      }
    })
    .populate('services.service', 'name unitPrice unit type');
};

const collectInvoiceEmails = (invoice) => {
  return [
    invoice?.tenant?.email,
    invoice?.tenant?.user?.email
  ].filter(Boolean).filter((email, index, list) => list.indexOf(email) === index);
};

const sendInvoiceEmailAndMark = async (invoice) => {
  const recipients = collectInvoiceEmails(invoice);
  if (!recipients.length) {
    return { success: false, error: 'Nguoi thue khong co email de gui hoa don' };
  }

  const emailResult = await sendInvoiceEmail(
    recipients,
    invoice.tenant.fullName,
    {
      invoiceNumber: invoice.invoiceNumber,
      room: invoice.room,
      month: invoice.month,
      year: invoice.year,
      roomRent: invoice.roomRent,
      services: invoice.services,
      totalAmount: invoice.totalAmount,
      dueDate: invoice.dueDate
    }
  );

  if (emailResult.success) {
    invoice.emailSent = true;
    invoice.emailSentDate = new Date();
    await invoice.save();
  }

  return emailResult;
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private/Admin
export const getInvoices = async (req, res) => {
  try {
    const { status, room, tenant, month, year } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (room) query.room = room;
    if (tenant) query.tenant = tenant;
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const invoices = await Invoice.find(query)
      .populate('room', 'roomNumber floor')
      .populate('tenant', 'fullName phone email')
      .populate('services.service', 'name unitPrice unit');

    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('room')
      .populate('tenant')
      .populate('contract')
      .populate('services.service');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private/Admin
export const createInvoice = async (req, res) => {
  try {
    const payload = await buildInvoicePayload(req.body);
    const createdInvoice = await Invoice.create(payload);
    const invoice = await populateInvoiceForEmail(createdInvoice._id);
    const emailResult = await sendInvoiceEmailAndMark(invoice);

    res.status(201).json({
      success: true,
      emailSent: Boolean(emailResult.success),
      emailError: emailResult.success ? undefined : emailResult.error,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create bulk draft invoices for all tenants
// @route   POST /api/invoices/bulk-draft
// @access  Private/Admin
export const createBulkDraftInvoices = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Get all active tenants (without populate first to avoid cast errors)
    const allTenants = await Tenant.find({
      room: { $exists: true, $ne: null }
    });
    
    // Filter out tenants with invalid room values
    const validTenantIds = allTenants
      .filter(t => t.room && t.room !== 'none' && t.room !== '' && t.room.toString().length === 24)
      .map(t => t._id);
    
    if (validTenantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có người thuê nào đang có phòng'
      });
    }

    // Now get tenants with populated room
    const tenants = await Tenant.find({
      _id: { $in: validTenantIds }
    }).populate('room', 'roomNumber floor price');

    // Get electricity and water services
    const electricService = await Service.findOne({ name: /điện/i });
    const waterService = await Service.findOne({ name: /nước/i });

    const draftInvoices = [];
    const errors = [];

    for (const tenant of tenants) {
      try {
        // Double check room exists
        if (!tenant.room || !tenant.room._id) {
          errors.push({
            tenant: tenant.fullName,
            room: 'N/A',
            reason: 'Không có thông tin phòng'
          });
          continue;
        }

        // Check if invoice already exists for this month
        const existingInvoice = await Invoice.findOne({
          tenant: tenant._id,
          month,
          year
        });

        if (existingInvoice) {
          errors.push({
            tenant: tenant.fullName,
            room: tenant.room?.roomNumber,
            reason: 'Đã có hóa đơn tháng này'
          });
          continue;
        }

        // Calculate room price based on days
        let roomPrice = tenant.room?.price || 0;
        let daysInfo = '';

        // Get previous paid invoices
        const previousInvoices = await Invoice.find({
          tenant: tenant._id,
          status: 'paid',
          paidDate: { $exists: true }
        }).sort({ paidDate: -1 }).limit(1);

        const today = new Date();
        let startDate;

        if (previousInvoices.length > 0) {
          // Calculate from last paid date
          startDate = new Date(previousInvoices[0].paidDate);
          daysInfo = 'Từ ngày thanh toán HĐ trước';
        } else if (tenant.moveInDate) {
          // First invoice - calculate from move-in date
          startDate = new Date(tenant.moveInDate);
          daysInfo = 'Tháng đầu - từ ngày vào';
        } else {
          // Default: full month
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          daysInfo = 'Tính tháng đầy đủ';
        }

        // Calculate days and prorated price
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const pricePerDay = roomPrice / 30;
        const calculatedRoomPrice = Math.round(pricePerDay * diffDays);

        // Generate invoice number
        const invoiceCount = await Invoice.countDocuments();
        const invoiceNumber = `HD${year}${String(month).padStart(2, '0')}${String(invoiceCount + draftInvoices.length + 1).padStart(4, '0')}`;

        // Create draft invoice
        const invoiceData = {
          invoiceNumber,
          room: tenant.room._id,
          tenant: tenant._id,
          month,
          year,
          roomRent: calculatedRoomPrice,
          services: [],
          totalAmount: calculatedRoomPrice,
          status: 'pending',
          dueDate: new Date(year, month - 1, 5),
          notes: `Tự động tạo - ${daysInfo} (${diffDays} ngày)`,
          isDraft: true // Mark as draft
        };

        const invoice = await Invoice.create(invoiceData);
        draftInvoices.push({
          invoice,
          tenant: tenant.fullName,
          room: tenant.room?.roomNumber,
          days: diffDays,
          info: daysInfo
        });
      } catch (error) {
        errors.push({
          tenant: tenant.fullName,
          room: tenant.room?.roomNumber || 'N/A',
          reason: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Đã tạo ${draftInvoices.length} hóa đơn draft`,
      data: {
        created: draftInvoices,
        errors,
        summary: {
          total: tenants.length,
          success: draftInvoices.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private/Admin
export const updateInvoice = async (req, res) => {
  try {
    const payload = await buildInvoicePayload(req.body);

    const existingInvoice = await Invoice.findById(req.params.id);

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: 'KhÃ´ng tÃ¬m tháº¥y hÃ³a Ä‘Æ¡n'
      });
    }

    if (existingInvoice.status === 'paid' && payload.status && payload.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Hoa don da thanh toan nen khong the chuyen lai chua thanh toan'
      });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true
      }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    await invoice.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa hóa đơn thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get invoices by tenant
// @route   GET /api/invoices/tenant/:tenantId
// @access  Private
export const getInvoicesByTenant = async (req, res) => {
  try {
    const invoices = await Invoice.find({ tenant: req.params.tenantId })
      .populate('room', 'roomNumber floor')
      .populate('tenant', 'fullName phone email')
      .populate('services.service', 'name unitPrice unit')
      .sort('-year -month');

    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Pay invoice
// @route   PUT /api/invoices/:id/pay
// @access  Private/Admin
export const payInvoice = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    if (invoice.status === 'paid') {
      return res.json({
        success: true,
        message: 'Hoa don da duoc xac nhan thanh toan truoc do',
        data: invoice
      });
    }

    invoice.status = 'paid';
    invoice.paidDate = new Date();
    invoice.paymentMethod = paymentMethod || 'transfer';
    invoice.paymentRejectionReason = undefined;
    invoice.paymentRejectedAt = undefined;

    await invoice.save();

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Tenant confirms they have transferred money
// @route   PUT /api/invoices/:id/submit-payment
// @access  Private
export const submitInvoicePayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay hoa don'
      });
    }

    const tenant = await Tenant.findOne({ user: req.user._id }).select('_id');
    const isAdmin = req.user.role === 'admin';
    const isOwner = tenant && invoice.tenant.toString() === tenant._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Ban khong co quyen xac nhan hoa don nay'
      });
    }

    if (invoice.status === 'paid') {
      return res.json({
        success: true,
        message: 'Hoa don da duoc chu tro xac nhan thanh toan',
        data: invoice
      });
    }

    invoice.status = 'payment_submitted';
    invoice.paymentSubmittedAt = new Date();
    invoice.paymentRejectedAt = undefined;
    invoice.paymentRejectionReason = undefined;
    invoice.paymentMethod = 'transfer';

    await invoice.save();

    res.json({
      success: true,
      message: 'Da ghi nhan chuyen khoan, vui long cho chu tro xac nhan',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Admin rejects a submitted transfer confirmation
// @route   PUT /api/invoices/:id/reject-payment
// @access  Private/Admin
export const rejectInvoicePayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay hoa don'
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Hoa don da thanh toan nen khong the tu choi'
      });
    }

    invoice.status = 'pending';
    invoice.paymentRejectedAt = new Date();
    invoice.paymentRejectionReason = reason || 'Chu tro chua xac nhan duoc giao dich';

    await invoice.save();

    res.json({
      success: true,
      message: 'Da tu choi xac nhan chuyen khoan',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send invoice via email
// @route   POST /api/invoices/:id/send
// @access  Private/Admin
export const sendInvoice = async (req, res) => {
  try {
    const invoice = await populateInvoiceForEmail(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    const recipients = collectInvoiceEmails(invoice);

    if (!invoice.tenant || !recipients.length) {
      return res.status(400).json({
        success: false,
        message: 'Người thuê không có email để gửi hóa đơn'
      });
    }

    // Gửi email hóa đơn
    const emailResult = await sendInvoiceEmail(
      recipients,
      invoice.tenant.fullName,
      {
        invoiceNumber: invoice.invoiceNumber,
        room: invoice.room,
        month: invoice.month,
        year: invoice.year,
        roomRent: invoice.roomRent,
        services: invoice.services,
        totalAmount: invoice.totalAmount,
        dueDate: invoice.dueDate
      }
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email hóa đơn',
        error: emailResult.error
      });
    }

    // Cập nhật trạng thái đã gửi email
    invoice.emailSent = true;
    invoice.emailSentDate = new Date();
    await invoice.save();

    res.json({
      success: true,
      message: 'Đã gửi hóa đơn qua email thành công',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
