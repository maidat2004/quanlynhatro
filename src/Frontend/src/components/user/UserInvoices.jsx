import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle, Clock, Copy, CreditCard, DollarSign, Droplet, MessageCircle, Printer, QrCode, Receipt, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { invoiceService } from '../../services/invoiceService';
import { tenantService } from '../../services/tenantService';
import { buildTransferContent, buildVietQrUrl, paymentInfo } from '../../constants/paymentInfo';
import { printInvoicePdf } from '../../utils/invoicePdf';
import { getInvoiceStatusClassName, getInvoiceStatusLabel, normalizeInvoiceStatus } from '../../utils/invoiceStatus';
import { toast } from 'sonner';

export default function UserInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const tenant = await tenantService.getTenantByUser(user._id || user.id);
      if (!tenant) {
        setInvoices([]);
        return;
      }

      const data = await invoiceService.getInvoicesByTenant(tenant._id);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Không thể tải danh sách hóa đơn');
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return 'Chưa có';
    const value = new Date(date);
    return Number.isNaN(value.getTime()) ? 'Chưa có' : value.toLocaleDateString('vi-VN');
  };

  const isUnpaidInvoice = (invoice) => ['pending', 'unpaid', 'overdue'].includes(invoice?.status);
  const isAwaitingConfirmation = (invoice) => invoice?.status === 'payment_submitted';

  const getStatusBadge = (status) => {
    const normalized = normalizeInvoiceStatus(status);
    const iconMap = {
      paid: CheckCircle,
      pending: Clock,
      payment_submitted: Clock,
      overdue: AlertCircle,
      cancelled: AlertCircle
    };
    const Icon = iconMap[normalized] || Clock;

    return (
      <Badge className={`${getInvoiceStatusClassName(normalized)} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {getInvoiceStatusLabel(normalized)}
      </Badge>
    );
  };
  const getServiceLine = (invoice, type, keyword) => {
    return invoice?.services?.find((service) => {
      const serviceType = service.service?.type;
      const serviceName = `${service.service?.name || service.name || ''}`.toLowerCase();
      return serviceType === type || serviceName.includes(keyword);
    });
  };

  const getOtherServices = (invoice) => {
    return (invoice?.services || []).filter((service) => {
      const serviceType = service.service?.type;
      const serviceName = `${service.service?.name || service.name || ''}`.toLowerCase();
      return serviceType !== 'electricity' &&
        serviceType !== 'water' &&
        !serviceName.includes('điện') &&
        !serviceName.includes('nước');
    });
  };

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Đã copy ${label}`);
    } catch (error) {
      toast.error('Không thể copy, vui lòng sao chép thủ công');
      console.error('Copy failed:', error);
    }
  };

  const handleSubmitPayment = async (invoiceId) => {
    try {
      const updatedInvoice = await invoiceService.submitPayment(invoiceId);
      toast.success('Đã ghi nhận chuyển khoản. Vui lòng chờ chủ trọ xác nhận trong vài giờ.');
      setSelectedInvoice(updatedInvoice);
      await loadInvoices();
    } catch (error) {
      toast.error(error.message || 'Không thể ghi nhận chuyển khoản');
      console.error('Submit payment failed:', error);
    }
  };

  const stats = useMemo(() => {
    const unpaidInvoices = invoices.filter((invoice) => isUnpaidInvoice(invoice) || isAwaitingConfirmation(invoice));
    return {
      total: invoices.length,
      paid: invoices.filter((invoice) => invoice.status === 'paid').length,
      unpaid: unpaidInvoices.length,
      unpaidAmount: unpaidInvoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0)
    };
  }, [invoices]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-3xl font-bold text-gray-800">Hóa đơn của tôi</h2>
        <p className="text-gray-600">Quản lý và theo dõi các hóa đơn thanh toán</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Receipt} label="Tổng hóa đơn" value={stats.total} className="from-blue-500 to-blue-600" />
        <SummaryCard icon={CheckCircle} label="Đã thanh toán" value={stats.paid} className="from-green-500 to-emerald-600" />
        <SummaryCard icon={Clock} label="Chưa thanh toán" value={stats.unpaid} className="from-yellow-500 to-orange-600" />
        <SummaryCard icon={DollarSign} label="Cần thanh toán" value={formatCurrency(stats.unpaidAmount)} className="from-purple-500 to-pink-600" compact />
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-gray-600">Đang tải...</p>
          </CardContent>
        </Card>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Chưa có hóa đơn nào</h3>
            <p className="text-gray-600">Các hóa đơn của bạn sẽ hiển thị ở đây</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const electricLine = getServiceLine(invoice, 'electricity', 'điện');
            const waterLine = getServiceLine(invoice, 'water', 'nước');

            return (
              <Card key={invoice._id} className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <Receipt className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Hóa đơn tháng {invoice.month}</h3>
                            <p className="text-sm text-gray-600">Phòng {invoice.room?.roomNumber || 'N/A'}</p>
                          </div>
                        </div>
                        {getStatusBadge(invoice.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <InfoCell icon={Calendar} label="Hạn thanh toán" value={formatDate(invoice.dueDate)} />
                        <InfoCell icon={Zap} label="Điện" value={`${electricLine?.quantity || 0} kWh`} />
                        <InfoCell icon={Droplet} label="Nước" value={`${waterLine?.quantity || 0} m³`} />
                        <InfoCell icon={DollarSign} label="Tổng tiền" value={formatCurrency(invoice.totalAmount)} highlight />
                      </div>
                    </div>

                    <Button variant="outline" onClick={() => handleViewDetail(invoice)}>
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[min(94vw,760px)] max-h-[86vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
            <DialogDescription>Thông tin chi tiết về hóa đơn thanh toán</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <InvoiceDetailModern
              invoice={selectedInvoice}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              getServiceLine={getServiceLine}
              getOtherServices={getOtherServices}
              isUnpaidInvoice={isUnpaidInvoice}
              isAwaitingConfirmation={isAwaitingConfirmation}
              copyText={copyText}
              onSubmitPayment={handleSubmitPayment}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, className, compact = false }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${className}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCell({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gray-400" />
      <div>
        <p className="text-gray-600">{label}</p>
        <p className={highlight ? 'font-semibold text-blue-600' : 'text-gray-900'}>{value}</p>
      </div>
    </div>
  );
}

function InvoiceDetail({
  invoice,
  formatCurrency,
  formatDate,
  getStatusBadge,
  getServiceLine,
  getOtherServices,
  isUnpaidInvoice,
  isAwaitingConfirmation,
  copyText,
  onSubmitPayment,
  onClose
}) {
  const electricLine = getServiceLine(invoice, 'electricity', 'điện');
  const waterLine = getServiceLine(invoice, 'water', 'nước');
  const otherServices = getOtherServices(invoice);
  const qrUrl = buildVietQrUrl(invoice);
  const transferContent = buildTransferContent(invoice);

  const openZalo = () => {
    const message = encodeURIComponent(
      `Em đã chuyển khoản hóa đơn ${transferContent} - số tiền ${formatCurrency(invoice.totalAmount)}. Em gửi biên lai để anh xác nhận giúp em.`
    );
    window.open(`https://zalo.me/${paymentInfo.zaloPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-5 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hóa đơn tháng {invoice.month}</h3>
          <p className="text-sm text-gray-600">Phòng {invoice.room?.roomNumber || 'N/A'}</p>
        </div>
        <div className="shrink-0 [&>*]:px-3 [&>*]:py-1.5 [&>*]:text-sm">
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-gray-50 p-4">
        <LineItem label="Tiền phòng" value={formatCurrency(invoice.roomRent || 0)} />
        <LineItem
          label={`Tiền điện (${electricLine?.quantity || 0} kWh)`}
          value={formatCurrency(electricLine?.amount || 0)}
        />
        <LineItem
          label={`Tiền nước (${waterLine?.quantity || 0} m³)`}
          value={formatCurrency(waterLine?.amount || 0)}
        />
        {otherServices.map((service, index) => (
          <LineItem key={`${service.name || service.service?._id || index}`} label={service.service?.name || service.name || 'Dịch vụ khác'} value={formatCurrency(service.amount || 0)} />
        ))}
      </div>

      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <span className="text-lg">Tổng cộng:</span>
          <span className="text-2xl font-bold">{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-gray-50 p-4">
        <LineItem label="Hạn thanh toán" value={formatDate(invoice.dueDate)} />
        {invoice.paidDate && <LineItem label="Ngày thanh toán" value={formatDate(invoice.paidDate)} />}
        {invoice.paidDate && invoice.paymentMethod && (
          <LineItem 
            label="Phương thức" 
            value={
              invoice.paymentMethod === 'sepay' ? 'Chuyển khoản tự động (SePay)' :
              invoice.paymentMethod === 'momo' ? 'Momo' :
              invoice.paymentMethod === 'vnpay' ? 'VNPAY' :
              invoice.paymentMethod === 'cash' ? 'Tiền mặt' :
              invoice.paymentMethod === 'transfer' ? 'Chuyển khoản thủ công' : invoice.paymentMethod
            } 
          />
        )}
        {invoice.paidDate && invoice.notes && <LineItem label="Ghi chú" value={invoice.notes} />}
      </div>

      {isUnpaidInvoice(invoice) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-700" />
            <h4 className="font-semibold text-blue-900">Thanh toán chuyển khoản</h4>
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-[168px,1fr]">
            <div className="mx-auto flex h-40 w-40 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white p-2 lg:mx-0">
              {qrUrl ? (
                <img src={qrUrl} alt="QR chuyển khoản" className="h-36 w-36 object-contain" />
              ) : (
                <div className="text-center text-xs text-gray-500">
                  <QrCode className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                  Chưa cấu hình mã ngân hàng
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <PaymentBox label="Người nhận" value={paymentInfo.accountName} />
                <PaymentBox label="Ngân hàng" value={paymentInfo.bankName} />
              </div>

              <CopyBox label="Số tài khoản" value={paymentInfo.accountNumber} onCopy={() => copyText(paymentInfo.accountNumber, 'số tài khoản')} />
              <CopyBox label="Nội dung chuyển khoản" value={transferContent} onCopy={() => copyText(transferContent, 'nội dung chuyển khoản')} />

              <p className="text-sm text-blue-800">
                Sau khi chuyển khoản, vui lòng nhắn Zalo kèm ảnh biên lai để quản lý xác nhận thanh toán.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
        <Button variant="outline" onClick={onClose}>Đóng</Button>
        {isUnpaidInvoice(invoice) && (
          <Button className="bg-green-600 text-white hover:bg-green-700" onClick={openZalo}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Gửi biên lai qua Zalo
          </Button>
        )}
      </div>
    </div>
  );
}

function InvoiceDetailModern({
  invoice,
  formatCurrency,
  formatDate,
  getStatusBadge,
  getServiceLine,
  getOtherServices,
  isUnpaidInvoice,
  isAwaitingConfirmation,
  copyText,
  onSubmitPayment,
  onClose
}) {
  const electricLine = getServiceLine(invoice, 'electricity', 'điện');
  const waterLine = getServiceLine(invoice, 'water', 'nước');
  const otherServices = getOtherServices(invoice);
  const qrUrl = buildVietQrUrl(invoice);
  const transferContent = buildTransferContent(invoice);

  const openZalo = () => {
    const message = encodeURIComponent(
      `Em đã chuyển khoản hóa đơn ${transferContent} - số tiền ${formatCurrency(invoice.totalAmount)}. Em gửi biên lai để anh xác nhận giúp em.`
    );
    window.open(`https://zalo.me/${paymentInfo.zaloPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-5 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hóa đơn tháng {invoice.month}</h3>
          <p className="text-sm text-gray-600">Phòng {invoice.room?.roomNumber || 'N/A'}</p>
        </div>
        <div className="shrink-0 [&>*]:px-3 [&>*]:py-1.5 [&>*]:text-sm">
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4">
        <LineItem label="Tiền phòng" value={formatCurrency(invoice.roomRent || 0)} />
        <LineItem label={`Tiền điện (${electricLine?.quantity || 0} kWh)`} value={formatCurrency(electricLine?.amount || 0)} />
        <LineItem label={`Tiền nước (${waterLine?.quantity || 0} m³)`} value={formatCurrency(waterLine?.amount || 0)} />
        {otherServices.map((service, index) => (
          <LineItem
            key={`${service.name || service.service?._id || index}`}
            label={service.service?.name || service.name || 'Dịch vụ khác'}
            value={formatCurrency(service.amount || 0)}
          />
        ))}
      </div>

      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">Tổng cộng cần thanh toán</p>
            <p className="mt-1 text-sm text-white/75">Hóa đơn tháng {invoice.month} - Phòng {invoice.room?.roomNumber || 'N/A'}</p>
          </div>
          <span className="text-3xl font-bold leading-none sm:text-4xl">{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>

      {invoice.paymentRejectionReason && invoice.status !== 'paid' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Chủ trọ chưa thể xác nhận giao dịch</p>
          <p className="mt-1">Lý do: {invoice.paymentRejectionReason}</p>
          <p className="mt-2 text-red-600">Vui lòng kiểm tra lại số tiền, nội dung chuyển khoản hoặc liên hệ chủ trọ để được hỗ trợ.</p>
        </div>
      )}

      {isUnpaidInvoice(invoice) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-950">Thanh toán chuyển khoản</h4>
              <p className="text-sm text-blue-700">Quét QR hoặc copy thông tin bên dưới.</p>
            </div>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[240px,1fr]">
            <div className="mx-auto flex h-56 w-56 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white p-3 shadow-sm lg:mx-0">
              {qrUrl ? (
                <img src={qrUrl} alt="QR chuyển khoản" className="h-52 w-52 object-contain" />
              ) : (
                <div className="text-center text-xs text-gray-500">
                  <QrCode className="mx-auto mb-2 h-10 w-10 text-blue-500" />
                  Chưa cấu hình mã ngân hàng
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <PaymentBox label="Người nhận" value={paymentInfo.accountName} />
                <PaymentBox label="Ngân hàng" value={paymentInfo.bankName} />
              </div>

              <CopyBox label="Số tài khoản" value={paymentInfo.accountNumber} onCopy={() => copyText(paymentInfo.accountNumber, 'số tài khoản')} />
              <CopyBox label="Nội dung chuyển khoản" value={transferContent} onCopy={() => copyText(transferContent, 'nội dung chuyển khoản')} />

              <p className="rounded-lg bg-white/70 p-3 text-sm leading-relaxed text-blue-800">
                Sau khi chuyển khoản, vui lòng nhắn Zalo kèm ảnh biên lai để quản lý xác nhận thanh toán.
              </p>
            </div>
          </div>
        </div>
      )}

      {isAwaitingConfirmation(invoice) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-950">Đang chờ chủ trọ xác nhận</h4>
              <p className="mt-1 text-sm leading-relaxed text-blue-800">
                Hệ thống đã ghi nhận bạn đã chuyển khoản. Chủ trọ sẽ kiểm tra và xác nhận thanh toán trong vài giờ.
              </p>
              {invoice.paymentSubmittedAt && (
                <p className="mt-2 text-xs text-blue-700">
                  Đã gửi lúc: {formatDate(invoice.paymentSubmittedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4">
        <LineItem label="Hạn thanh toán" value={formatDate(invoice.dueDate)} />
        {invoice.paidDate && <LineItem label="Ngày thanh toán" value={formatDate(invoice.paidDate)} />}
        {invoice.paidDate && invoice.paymentMethod && (
          <LineItem 
            label="Phương thức" 
            value={
              invoice.paymentMethod === 'sepay' ? 'Chuyển khoản tự động (SePay)' :
              invoice.paymentMethod === 'momo' ? 'Momo' :
              invoice.paymentMethod === 'vnpay' ? 'VNPAY' :
              invoice.paymentMethod === 'cash' ? 'Tiền mặt' :
              invoice.paymentMethod === 'transfer' ? 'Chuyển khoản thủ công' : invoice.paymentMethod
            } 
          />
        )}
        {invoice.paidDate && invoice.notes && <LineItem label="Ghi chú" value={invoice.notes} />}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
        <Button variant="outline" onClick={() => printInvoicePdf(invoice)}>
          <Printer className="mr-2 h-4 w-4" />
          Xuất PDF
        </Button>
        <Button variant="outline" onClick={onClose}>Đóng</Button>
        {isUnpaidInvoice(invoice) && (
          <>
            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={openZalo}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Gửi biên lai qua Zalo
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => onSubmitPayment(invoice._id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Đã chuyển khoản
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function LineItem({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function PaymentBox({ label, value }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function CopyBox({ label, value, onCopy }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 break-all font-semibold text-gray-900">{value}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="shrink-0 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
        >
          <Copy className="mr-1.5 h-4 w-4" />
          Copy
        </Button>
      </div>
    </div>
  );
}
