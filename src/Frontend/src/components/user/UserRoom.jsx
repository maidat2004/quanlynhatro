import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks';
import { tenantService, roomService } from '../../services';
import { Home, User, Phone, Mail, Calendar, DollarSign, Droplet, Zap } from 'lucide-react';

export default function UserRoom() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoomInfo();
    
    // Auto-refresh when window gains focus
    const handleFocus = () => loadRoomInfo();
    window.addEventListener('focus', handleFocus);
    
    // Refresh every 30 seconds
    const interval = setInterval(loadRoomInfo, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user]);

  const loadRoomInfo = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Loading room info for user:', { id: user?._id || user?.id, email: user?.email });

      // Lấy thông tin tenant của user hiện tại
      const currentTenant = await tenantService.getTenantByUser(user._id || user.id);
      console.log('Current tenant:', currentTenant);

      if (currentTenant) {
        setTenant(currentTenant);

        // Nếu tenant có phòng, lấy thông tin chi tiết phòng
        if (currentTenant.room) {
          const roomId = currentTenant.room._id || currentTenant.room;
          console.log('Loading room:', roomId);
          const roomData = await roomService.getRoom(roomId);
          console.log('Room data:', roomData);
          setRoom(roomData);
        }
      } else {
        console.log('No tenant found for user:', { id: user?._id, email: user?.email });
      }
    } catch (err) {
      setError('Không thể tải thông tin phòng');
      console.error('Error loading room info:', err);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-yellow-800 mb-2">Chưa có thông tin người thuê</h3>
        <p className="text-yellow-700">Vui lòng liên hệ quản lý để được thêm vào hệ thống.</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-yellow-800 mb-2">Chưa được gán phòng</h3>
        <p className="text-yellow-700">Bạn đã được thêm vào hệ thống nhưng chưa được gán phòng. Vui lòng liên hệ quản lý.</p>
        <div className="mt-4 bg-white rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Thông tin của bạn:</h4>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-600">Họ tên:</span> <span className="font-medium">{tenant.fullName}</span></p>
            <p><span className="text-gray-600">SĐT:</span> <span className="font-medium">{tenant.phone}</span></p>
            <p><span className="text-gray-600">Email:</span> <span className="font-medium">{tenant.email}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Phòng của tôi</h2>
      
      {/* Thông tin phòng */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Home className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">Phòng {room.roomNumber}</h3>
            <p className="text-blue-100">Tầng {room.floor}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Diện tích</p>
            <p className="text-2xl font-bold">{room.area}m²</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Giá phòng</p>
            <p className="text-xl font-bold">{formatCurrency(room.price)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Sức chứa</p>
            <p className="text-2xl font-bold">{room.capacity} người</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Trạng thái</p>
            <p className="text-lg font-semibold">
              {room.status === 'available' ? '✅ Trống' : 
               room.status === 'occupied' ? '🏠 Đang thuê' : 
               room.status === 'maintenance' ? '🔧 Bảo trì' : '📝 Đã đặt'}
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin người thuê */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Thông tin người thuê
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Họ tên</p>
              <p className="font-semibold text-gray-800">{tenant.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-semibold text-gray-800">{tenant.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">{tenant.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Ngày thuê</p>
              <p className="font-semibold text-gray-800">
                {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString('vi-VN') : 'Chưa có'}
              </p>
            </div>
          </div>
          {tenant.idCard && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">CCCD/CMND</p>
                <p className="font-semibold text-gray-800">{tenant.idCard}</p>
              </div>
            </div>
          )}
          {tenant.dateOfBirth && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Ngày sinh</p>
                <p className="font-semibold text-gray-800">
                  {new Date(tenant.dateOfBirth).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          )}
          {tenant.school && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Trường</p>
                <p className="font-semibold text-gray-800">{tenant.school}</p>
              </div>
            </div>
          )}
          {tenant.hometown && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Home className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Quê quán</p>
                <p className="font-semibold text-gray-800">{tenant.hometown}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Emergency Contact */}
        {(tenant.emergencyContact || tenant.emergencyPhone) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Liên hệ khẩn cấp</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {tenant.emergencyContact && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <User className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Người liên hệ</p>
                    <p className="font-semibold text-gray-800">
                      {typeof tenant.emergencyContact === 'object' 
                        ? `${tenant.emergencyContact.name || ''} ${tenant.emergencyContact.relationship ? `(${tenant.emergencyContact.relationship})` : ''}`
                        : tenant.emergencyContact}
                    </p>
                  </div>
                </div>
              )}
              {(tenant.emergencyPhone || tenant.emergencyContact?.phone) && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <Phone className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">SĐT khẩn cấp</p>
                    <p className="font-semibold text-gray-800">{tenant.emergencyPhone || tenant.emergencyContact?.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mô tả phòng */}
      {room.description && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Mô tả phòng</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{room.description}</p>
        </div>
      )}

      {/* Tiện ích phòng */}
      {room.amenities && room.amenities.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tiện ích</h3>
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Thông tin thanh toán */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Chi phí hàng tháng
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Tiền phòng</span>
            <span className="font-bold text-gray-800">{formatCurrency(room.price)}</span>
          </div>
          {room.electricPrice && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600">Giá điện (theo số)</span>
              </div>
              <span className="font-bold text-gray-800">{formatCurrency(room.electricPrice)}/kWh</span>
            </div>
          )}
          {room.waterPrice && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Giá nước (theo số)</span>
              </div>
              <span className="font-bold text-gray-800">{formatCurrency(room.waterPrice)}/m³</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
