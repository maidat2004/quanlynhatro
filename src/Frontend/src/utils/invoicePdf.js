import { getInvoiceStatusLabel } from './invoiceStatus';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(Number(amount || 0));

const formatDate = (date) => {
  const value = date ? new Date(date) : null;
  return value && !Number.isNaN(value.getTime()) ? value.toLocaleDateString('vi-VN') : 'Chưa có';
};

const getServiceName = (service) => service?.service?.name || service?.name || 'Dịch vụ khác';
const getServiceUnit = (service) => service?.service?.unit || service?.unit || 'lần';

export const printInvoicePdf = (invoice) => {
  if (!invoice) return;

  const services = invoice.services || [];
  const rows = [
    {
      name: 'Tiền phòng',
      detail: `Phòng ${invoice.room?.roomNumber || 'N/A'}`,
      amount: Number(invoice.roomRent || 0)
    },
    ...services.map((service) => ({
      name: getServiceName(service),
      detail: `${Number(service.quantity || 0)} ${getServiceUnit(service)} x ${formatCurrency(service.unitPrice || 0)}`,
      amount: Number(service.amount || 0)
    }))
  ];

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Hoa-don-${escapeHtml(invoice.invoiceNumber || `${invoice.month}-${invoice.year}`)}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #111827; background: #f3f4f6; }
          .invoice { max-width: 820px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb; }
          .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 3px solid #2563eb; padding-bottom: 18px; margin-bottom: 24px; }
          h1 { margin: 0; color: #1d4ed8; font-size: 28px; }
          .muted { color: #6b7280; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 28px; margin: 20px 0; }
          .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; }
          .label { color: #6b7280; font-size: 13px; margin-bottom: 4px; }
          .value { font-weight: 700; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; border: 1px solid #e5e7eb; }
          th { background: #eff6ff; color: #1e3a8a; text-align: left; }
          th, td { padding: 13px; border-bottom: 1px solid #e5e7eb; }
          td:last-child, th:last-child { text-align: right; }
          .total { margin-top: 22px; background: #2563eb; color: white; border-radius: 12px; padding: 18px; display: flex; justify-content: space-between; align-items: center; font-size: 22px; font-weight: 700; }
          .note { margin-top: 22px; padding: 14px; border-radius: 10px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
          .footer { margin-top: 28px; color: #6b7280; font-size: 12px; text-align: center; }
          @media print {
            body { background: white; padding: 0; }
            .invoice { border: none; border-radius: 0; max-width: none; }
          }
        </style>
      </head>
      <body>
        <main class="invoice">
          <section class="header">
            <div>
              <h1>Hóa đơn nhà trọ</h1>
              <p class="muted">Nhà trọ Trang Thông</p>
            </div>
            <div>
              <p><strong>Mã hóa đơn:</strong> ${escapeHtml(invoice.invoiceNumber || 'N/A')}</p>
              <p><strong>Tháng:</strong> ${escapeHtml(invoice.month || 'N/A')}/${escapeHtml(invoice.year || new Date().getFullYear())}</p>
            </div>
          </section>

          <section class="grid">
            <div class="box">
              <div class="label">Người thuê</div>
              <div class="value">${escapeHtml(invoice.tenant?.fullName || 'N/A')}</div>
            </div>
            <div class="box">
              <div class="label">Phòng</div>
              <div class="value">${escapeHtml(invoice.room?.roomNumber || 'N/A')}</div>
            </div>
            <div class="box">
              <div class="label">Hạn thanh toán</div>
              <div class="value">${formatDate(invoice.dueDate)}</div>
            </div>
            <div class="box">
              <div class="label">Trạng thái</div>
              <div class="value">${escapeHtml(getInvoiceStatusLabel(invoice.status))}</div>
            </div>
            ${invoice.paidDate ? `
              <div class="box">
                <div class="label">Ngày thanh toán</div>
                <div class="value">${formatDate(invoice.paidDate)}</div>
              </div>
            ` : ''}
          </section>

          <table>
            <thead>
              <tr>
                <th>Khoản thu</th>
                <th>Chi tiết</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) => `
                <tr>
                  <td>${escapeHtml(row.name)}</td>
                  <td>${escapeHtml(row.detail)}</td>
                  <td>${formatCurrency(row.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <section class="total">
            <span>Tổng cộng</span>
            <span>${formatCurrency(invoice.totalAmount)}</span>
          </section>

          <section class="note">
            Hóa đơn thể hiện các khoản phát sinh trong tháng gồm tiền phòng, điện, nước và các dịch vụ được tính thêm nếu có.
          </section>

          <p class="footer">Xuất từ hệ thống quản lý Nhà trọ Trang Thông - ${formatDate(new Date())}</p>
        </main>
        <script>
          window.onload = function () {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
