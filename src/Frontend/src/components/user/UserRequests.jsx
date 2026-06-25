import { useEffect, useState } from 'react';
import { requestService, roomService, tenantService } from '../../services';
import { useAuth } from '../../hooks';

export default function UserRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [userRoom, setUserRoom] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'repair',
    priority: 'medium',
    room: '',
    tenant: '',
  });

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user ID with fallback
      const userId = user?._id || user?.id;
      console.log('UserRequests - Loading for user ID:', userId);
      
      // Get current user's tenant first
      const currentUserTenant = await tenantService.getTenantByUser(userId);
      console.log('UserRequests - Current tenant:', currentUserTenant);
      
      if (currentUserTenant) {
        setCurrentTenant(currentUserTenant);
        if (currentUserTenant.room) {
          setUserRoom(currentUserTenant.room);
          setFormData(prev => ({ 
            ...prev, 
            room: currentUserTenant.room._id || currentUserTenant.room,
            tenant: currentUserTenant._id 
          }));
          console.log('UserRequests - Set room:', currentUserTenant.room);
        }
        
        // Get requests for this tenant
        const userRequests = await requestService.getRequestsByTenant(currentUserTenant._id);
        setRequests(userRequests);
      } else {
        console.warn('UserRequests - No tenant found for user:', userId);
        setRequests([]);
      }
    } catch (err) {
      setError(err.message || 'Không tải được yêu cầu');
      console.error('UserRequests - Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'repair',
      priority: 'medium',
      room: currentTenant?.room?._id || currentTenant?.room || '',
      tenant: currentTenant?._id || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.tenant || !formData.room) {
      alert('Không tìm thấy thông tin phòng. Vui lòng liên hệ quản lý.');
      return;
    }
    
    try {
      await requestService.createRequest({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        room: formData.room,
        tenant: formData.tenant,
        status: 'pending',
      });
      setShowForm(false);
      resetForm();
      await loadRequests();
      alert('Gửi yêu cầu thành công! Chúng tôi sẽ xử lý trong thời gian sớm nhất.');
    } catch (err) {
      alert(err.message || 'Gửi yêu cầu thất bại');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '⏳ Chờ xử lý',
      'in-progress': '🔄 Đang xử lý',
      'resolved': '✅ Đã xử lý',
      'rejected': '❌ Từ chối'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
      'resolved': 'bg-green-100 text-green-700 border-green-300',
      'rejected': 'bg-red-100 text-red-700 border-red-300'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      'low': '🟢 Thấp',
      'medium': '🟡 Trung bình',
      'high': '🟠 Cao',
      'urgent': '🔴 Khẩn cấp'
    };
    return priorityMap[priority] || priority;
  };

  const getTypeText = (type) => {
    const typeMap = {
      'repair': '🔧 Sửa chữa',
      'complaint': '💬 Phàn nàn',
      'service': '🛠️ Dịch vụ',
      'other': '📋 Khác'
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Yêu cầu của tôi</h1>
          <p className="text-gray-600">Gửi yêu cầu sửa chữa, phàn nàn hoặc dịch vụ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
            <div className="text-2xl mb-1">⏳</div>
            <div className="text-2xl font-bold text-gray-800">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Chờ xử lý</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <div className="text-2xl mb-1">🔄</div>
            <div className="text-2xl font-bold text-gray-800">
              {requests.filter(r => r.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600">Đang xử lý</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-2xl font-bold text-gray-800">
              {requests.filter(r => r.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Đã xử lý</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-2xl font-bold text-gray-800">{requests.length}</div>
            <div className="text-sm text-gray-600">Tổng cộng</div>
          </div>
        </div>

        {/* Create Request Button */}
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="text-3xl">➕</div>
              <div className="text-left">
                <div className="text-xl font-bold">Tạo yêu cầu mới</div>
                <div className="text-sm text-blue-100">
                  Gửi yêu cầu sửa chữa, phàn nàn hoặc dịch vụ cho quản lý
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📝 Tạo yêu cầu mới</h2>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📌 Tiêu đề *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  placeholder="VD: Điều hòa không hoạt động"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏷️ Loại yêu cầu
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="repair">🔧 Sửa chữa</option>
                    <option value="complaint">💬 Phàn nàn</option>
                    <option value="service">🛠️ Dịch vụ</option>
                    <option value="other">📋 Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⚡ Mức độ ưu tiên
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="low">🟢 Thấp</option>
                    <option value="medium">🟡 Trung bình</option>
                    <option value="high">🟠 Cao</option>
                    <option value="urgent">🔴 Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏠 Phòng của bạn
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-300 bg-gray-100 rounded-lg text-gray-700 font-semibold">
                    {userRoom ? `Phòng ${userRoom.roomNumber || 'N/A'}` : 'Chưa có phòng'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Yêu cầu sẽ được gửi cho phòng này</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📄 Mô tả chi tiết *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  rows={4}
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  🚀 Gửi yêu cầu
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Requests List */}
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Chưa có yêu cầu nào
                  </h3>
                  <p className="text-gray-600">
                    Tạo yêu cầu mới để nhận hỗ trợ từ quản lý
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-l-4 border-blue-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-2xl">{getTypeText(request.type).split(' ')[0]}</span>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {request.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {request.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 border-2 border-purple-300">
                            {getTypeText(request.type)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 border-2 border-orange-300">
                            {getPriorityText(request.priority)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border-2 border-gray-300">
                            🏠 Phòng {request.room?.roomNumber || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {request.response && (
                      <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">💬</div>
                          <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              Phản hồi từ quản lý:
                            </p>
                            <p className="text-gray-700">{request.response}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
