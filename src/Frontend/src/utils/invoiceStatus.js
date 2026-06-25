export const normalizeInvoiceStatus = (status) => {
  if (status === 'unpaid') return 'pending';
  return status || 'pending';
};

export const invoiceStatusLabels = {
  pending: 'Chưa thanh toán',
  payment_submitted: 'Chờ chủ trọ xác nhận',
  paid: 'Đã thanh toán',
  overdue: 'Quá hạn',
  cancelled: 'Đã hủy'
};

export const invoiceStatusStyles = {
  pending: 'border-yellow-300 bg-yellow-100 text-yellow-700',
  payment_submitted: 'border-blue-300 bg-blue-100 text-blue-700',
  paid: 'border-green-300 bg-green-100 text-green-700',
  overdue: 'border-red-300 bg-red-100 text-red-700',
  cancelled: 'border-gray-300 bg-gray-100 text-gray-700'
};

export const getInvoiceStatusLabel = (status) => {
  const normalized = normalizeInvoiceStatus(status);
  return invoiceStatusLabels[normalized] || invoiceStatusLabels.pending;
};

export const getInvoiceStatusClassName = (status) => {
  const normalized = normalizeInvoiceStatus(status);
  return invoiceStatusStyles[normalized] || invoiceStatusStyles.pending;
};
