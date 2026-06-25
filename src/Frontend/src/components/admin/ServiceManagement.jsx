import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Edit, Trash2, Zap, Droplet, Wifi, Car, Trash } from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { toast } from 'sonner';

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const serviceTypes = [
    { value: 'electricity', label: 'Tiền điện' },
    { value: 'water', label: 'Tiền nước' },
    { value: 'internet', label: 'Internet' },
    { value: 'parking', label: 'Giữ xe' },
    { value: 'cleaning', label: 'Dọn phòng / vệ sinh' },
    { value: 'other', label: 'Dịch vụ khác' }
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getServices();
      setServices(data);
    } catch (error) {
      toast.error('Không thể tải danh sách dịch vụ');
      console.error('Error loading services:', error);
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

  const getServiceIcon = (name) => {
    const icons = {
      'Điện': Zap,
      'Nước': Droplet,
      'Internet': Wifi,
      'Gửi xe': Car,
      'Rác': Trash
    };
    const Icon = icons[name] || Zap;
    return <Icon className="w-5 h-5" />;
  };

  const guessServiceType = (service) => {
    const explicitType = service?.type;
    if (explicitType) return explicitType;

    const name = (service?.name || '').toLowerCase();
    if (name.includes('điện') || name.includes('dien')) return 'electricity';
    if (name.includes('nước') || name.includes('nuoc')) return 'water';
    if (name.includes('internet') || name.includes('wifi')) return 'internet';
    if (name.includes('xe')) return 'parking';
    if (name.includes('dọn') || name.includes('don') || name.includes('rác') || name.includes('rac') || name.includes('vệ sinh') || name.includes('ve sinh')) return 'cleaning';
    return 'other';
  };

  const handleAddService = () => {
    setEditingService({
      name: '',
      type: 'other',
      unitPrice: '',
      unit: '',
      description: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService({ ...service, type: guessServiceType(service) });
    setIsDialogOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const payload = {
        ...editingService,
        type: guessServiceType(editingService),
        unitPrice: Number(editingService.unitPrice || 0)
      };

      if (editingService._id) {
        // Update existing service
        await serviceService.updateService(editingService._id, payload);
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        // Create new service
        await serviceService.createService(payload);
        toast.success('Tạo dịch vụ thành công');
      }
      
      setIsDialogOpen(false);
      setEditingService(null);
      await loadServices();
    } catch (error) {
      toast.error('Không thể lưu dịch vụ');
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    
    try {
      await serviceService.deleteService(serviceId);
      toast.success('Xóa dịch vụ thành công');
      await loadServices();
    } catch (error) {
      toast.error('Không thể xóa dịch vụ');
      console.error('Error deleting service:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Quản Lý Dịch Vụ</h1>
          <p className="text-gray-600">Quản lý các dịch vụ và đơn giá</p>
        </div>
        <Button 
          onClick={handleAddService}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm Dịch Vụ
        </Button>
      </div>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService?.name ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
              </DialogTitle>
              <DialogDescription>
                Nhập thông tin dịch vụ và đơn giá
              </DialogDescription>
            </DialogHeader>
            {editingService && (
              <form onSubmit={handleSaveService} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên Dịch Vụ *</Label>
                  <Input
                    id="name"
                    value={editingService.name || ''}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Loai dich vu *</Label>
                  <select
                    id="type"
                    value={editingService.type || 'other'}
                    onChange={(e) => setEditingService({ ...editingService, type: e.target.value })}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    {serviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Đơn Giá (VNĐ) *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={editingService.unitPrice === '' || editingService.unitPrice === null || editingService.unitPrice === undefined ? '' : editingService.unitPrice}
                      onChange={(e) => setEditingService({ ...editingService, unitPrice: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Đơn Vị *</Label>
                    <Input
                      id="unit"
                      value={editingService.unit || ''}
                      onChange={(e) => setEditingService({ ...editingService, unit: e.target.value })}
                      placeholder="Ví dụ: kWh, m³, tháng"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô Tả</Label>
                  <Textarea
                    id="description"
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">
                    Lưu
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

      {/* Services Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang tải...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dịch vụ nào</h3>
            <p className="text-gray-600 mb-6">Thêm dịch vụ đầu tiên để bắt đầu quản lý</p>
            <Button onClick={handleAddService} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Thêm Dịch Vụ Đầu Tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service._id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {getServiceIcon(service.name)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{service.unit}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đơn giá</p>
                <p className="text-xl text-gray-900">{formatCurrency(service.unitPrice)}</p>
              </div>

              {service.description && (
                <p className="text-sm text-gray-600">
                  {service.description}
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditService(service)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteService(service._id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng Quan Dịch Vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng số dịch vụ:</span>
              <span className="text-gray-900">{services.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dịch vụ cố định:</span>
              <span className="text-gray-900">
                {services.filter(s => s.unit.includes('tháng')).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dịch vụ theo sử dụng:</span>
              <span className="text-gray-900">
                {services.filter(s => !s.unit.includes('tháng')).length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
