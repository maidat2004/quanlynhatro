import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, PenTool, FileText, Calendar, User, Home } from 'lucide-react';
import { contractService } from '../../services';
import { toast } from 'sonner';

export default function ContractSignaturePad({ contract, isOpen, onClose, onSignatureComplete }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState('handwritten');
  const [textSignature, setTextSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState(null);

  useEffect(() => {
    if (isOpen && contract) {
      loadSignatureStatus();
      setupCanvas();
    }
  }, [isOpen, contract]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const loadSignatureStatus = async () => {
    try {
      const status = await contractService.getContractSignatureStatus(contract._id);
      setSignatureStatus(status.data);
    } catch (error) {
      console.error('Error loading signature status:', error);
    }
  };

  const startDrawing = (e) => {
    if (signatureType !== 'handwritten') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || signatureType !== 'handwritten') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTextSignature('');
  };

  const getSignatureData = () => {
    if (signatureType === 'handwritten') {
      const canvas = canvasRef.current;
      return canvas.toDataURL('image/png');
    } else if (signatureType === 'text') {
      return textSignature;
    }
    return null;
  };

  const handleSignContract = async () => {
    let signature = getSignatureData();

    if (!signature && signatureType === 'text' && !textSignature.trim()) {
      toast.error('Vui lòng nhập chữ ký');
      return;
    }

    if (signatureType === 'handwritten' && !signature) {
      toast.error('Vui lòng ký tên vào hợp đồng');
      return;
    }

    setLoading(true);
    try {
      const signatureData = {
        signature,
        signatureType
      };

      // Determine if user is admin or tenant
      const isAdmin = localStorage.getItem('userRole') === 'admin';

      if (isAdmin) {
        await contractService.signContractByAdmin(contract._id, signatureData);
        toast.success('✅ Admin đã ký hợp đồng thành công!');
      } else {
        await contractService.signContractByTenant(contract._id, signatureData);
        toast.success('✅ Đã ký hợp đồng thành công!');
      }

      await loadSignatureStatus();
      onSignatureComplete && onSignatureComplete();

    } catch (error) {
      toast.error(error.message || 'Không thể ký hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Ký Hợp Đồng Online
          </DialogTitle>
          <DialogDescription>
            Xem và ký hợp đồng thuê phòng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Thông Tin Hợp Đồng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Người thuê</p>
                    <p className="font-medium">{contract.tenant?.fullName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phòng</p>
                    <p className="font-medium">Phòng {contract.room?.roomNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Thời hạn</p>
                    <p className="font-medium">
                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div>
                    <p className="text-sm text-gray-600">Tiền thuê/tháng</p>
                    <p className="font-medium">{formatCurrency(contract.monthlyRent)}</p>
                  </div>
                </div>
              </div>

              {contract.terms && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Điều khoản hợp đồng:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                    {contract.terms}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signature Status */}
          {signatureStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Trạng Thái Ký Hợp Đồng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {signatureStatus.isSignedByTenant ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">Người thuê</p>
                      {signatureStatus.isSignedByTenant && signatureStatus.tenantSignedAt && (
                        <p className="text-sm text-gray-600">
                          Đã ký: {new Date(signatureStatus.tenantSignedAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {signatureStatus.isSignedByAdmin ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">Quản lý</p>
                      {signatureStatus.isSignedByAdmin && signatureStatus.adminSignedAt && (
                        <p className="text-sm text-gray-600">
                          Đã ký: {new Date(signatureStatus.adminSignedAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {signatureStatus.isFullySigned && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <Badge className="bg-green-100 text-green-700">
                      ✅ Hợp đồng đã được ký đầy đủ bởi cả hai bên
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Signature Input */}
          <Card>
            <CardHeader>
              <CardTitle>Ký Hợp Đồng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Signature Type Selection */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="handwritten"
                    checked={signatureType === 'handwritten'}
                    onChange={(e) => setSignatureType(e.target.value)}
                  />
                  Ký tay
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="text"
                    checked={signatureType === 'text'}
                    onChange={(e) => setSignatureType(e.target.value)}
                  />
                  Ký bằng text
                </label>
              </div>

              {/* Signature Input Area */}
              {signatureType === 'handwritten' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Ký tên của bạn vào khung bên dưới:</p>
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="border border-gray-200 rounded cursor-crosshair w-full"
                      style={{
                        touchAction: 'none',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ffffff'
                      }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                </div>
              )}

              {signatureType === 'text' && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Nhập chữ ký của bạn:</label>
                  <input
                    type="text"
                    value={textSignature}
                    onChange={(e) => setTextSignature(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full p-3 border border-gray-300 rounded-lg text-lg font-signature"
                    style={{
                      fontFamily: '"Dancing Script", "Brush Script MT", cursive',
                      fontSize: '24px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={clearSignature}
                  variant="outline"
                  disabled={loading}
                >
                  Xóa ký tên
                </Button>
                <Button
                  onClick={handleSignContract}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Đang ký...' : 'Ký hợp đồng'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}