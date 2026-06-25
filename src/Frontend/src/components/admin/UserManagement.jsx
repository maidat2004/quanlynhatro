import { useEffect, useState } from 'react';
import { userService, tenantService } from '../../services';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChoiceSelect } from '../forms/ProfileChoiceFields';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { occupationOptions, vietnamProvinceOptions } from '../../constants/profileOptions';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, user, admin
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    hometown: '',
    currentAddress: '',
    idCard: '',
    occupation: 'Sinh viên',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    role: 'user'
  });

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const [userData, tenantData] = await Promise.all([
        userService.getUsers(),
        tenantService.getTenants(),
      ]);
      setUsers(userData);
      setTenants(tenantData);
    } catch (err) {
      setError(err.message || 'Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const getUserTenant = (userId) => {
    return tenants.find(t => t.user?._id === userId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update existing user
        await userService.updateUser(editingUser._id, newUser);
        toast.success('✅ Cập nhật tài khoản thành công!');
      } else {
        // Create new user
        await userService.createUser(newUser);
        toast.success('✅ Tạo tài khoản thành công!');
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        hometown: '',
        currentAddress: '',
        idCard: '',
        occupation: 'Sinh viên',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        role: 'user'
      });
      await loadUsers();
    } catch (err) {
      toast.error(err.message || 'Không thể lưu tài khoản');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      name: user.name || '',
      email: user.email || '',
      password: '', // Không hiển thị password cũ
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      hometown: user.hometown || '',
      currentAddress: user.currentAddress || '',
      idCard: user.idCard || '',
      occupation: user.occupation || 'Sinh viên',
      emergencyContact: {
        name: user.emergencyContact?.name || '',
        phone: user.emergencyContact?.phone || '',
        relationship: user.emergencyContact?.relationship || ''
      },
      role: user.role || 'user'
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await userService.deleteUser(userId);
      toast.success('✅ Xóa tài khoản thành công!');
      await loadUsers();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa tài khoản');
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
      hometown: '',
      currentAddress: '',
      idCard: '',
      occupation: 'Sinh viên',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      role: 'user'
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản lý Người dùng</h2>
          <p className="text-gray-500 mt-1">Danh sách tất cả tài khoản đã đăng ký</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo Tài Khoản
          </Button>
          <button
            type="button"
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Create/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Tạo Tài Khoản Mới'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Cập nhật thông tin tài khoản' : 'Tạo tài khoản user để đăng nhập hệ thống'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và Tên *</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu {editingUser ? '' : '*'}</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder={editingUser ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"}
                required={!editingUser}
                minLength={6}
              />
              {editingUser && (
                <p className="text-xs text-gray-500">Để trống nếu không muốn thay đổi mật khẩu</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="0987654321"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={newUser.dateOfBirth}
                onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hometown">Quê quán</Label>
              <ChoiceSelect
                value={newUser.hometown}
                onChange={(value) => setNewUser({ ...newUser, hometown: value })}
                options={vietnamProvinceOptions}
                placeholder="Chọn tỉnh/thành quê quán"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAddress">Địa chỉ hiện tại</Label>
              <Input
                id="currentAddress"
                value={newUser.currentAddress}
                onChange={(e) => setNewUser({ ...newUser, currentAddress: e.target.value })}
                placeholder="Số nhà, thôn/ấp, xã/phường, huyện, tỉnh"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idCard">CMND/CCCD</Label>
              <Input
                id="idCard"
                value={newUser.idCard}
                onChange={(e) => setNewUser({ ...newUser, idCard: e.target.value })}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Nghề nghiệp</Label>
              <ChoiceSelect
                value={newUser.occupation}
                onChange={(value) => setNewUser({ ...newUser, occupation: value })}
                options={occupationOptions}
                placeholder="Chọn nghề nghiệp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Người liên hệ khẩn cấp - Tên</Label>
              <Input
                id="emergencyName"
                value={newUser.emergencyContact.name}
                onChange={(e) => setNewUser({
                  ...newUser,
                  emergencyContact: { ...newUser.emergencyContact, name: e.target.value }
                })}
                placeholder="Nguyễn Văn B"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Người liên hệ khẩn cấp - Số điện thoại</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={newUser.emergencyContact.phone}
                onChange={(e) => setNewUser({
                  ...newUser,
                  emergencyContact: { ...newUser.emergencyContact, phone: e.target.value }
                })}
                placeholder="0987654321"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelationship">Người liên hệ khẩn cấp - Quan hệ</Label>
              <Input
                id="emergencyRelationship"
                value={newUser.emergencyContact.relationship}
                onChange={(e) => setNewUser({
                  ...newUser,
                  emergencyContact: { ...newUser.emergencyContact, relationship: e.target.value }
                })}
                placeholder="Cha, Mẹ, Anh chị em..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                {editingUser ? 'Cập nhật' : 'Tạo Tài Khoản'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tất cả ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('user')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Người dùng ({users.filter(u => u.role === 'user').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('admin')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'admin'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Quản trị viên ({users.filter(u => u.role === 'admin').length})
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hồ sơ người thuê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const tenant = getUserTenant(user._id);
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone || 'Chưa cập nhật'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tenant ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tenant.fullName}</div>
                            <div className="text-xs text-gray-500">{tenant.idCard}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-yellow-600 font-medium">
                            Chưa có hồ sơ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditUser(user)}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user._id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Có hồ sơ người thuê</p>
              <p className="text-3xl font-bold text-green-600">{tenants.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Chưa có hồ sơ</p>
              <p className="text-3xl font-bold text-yellow-600">
                {users.filter(u => u.role === 'user' && !getUserTenant(u._id)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Hướng dẫn</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Người dùng mới đăng ký sẽ xuất hiện trong danh sách này</li>
                <li>Để tạo hồ sơ người thuê: Vào <strong>Quản lý Người thuê</strong> → Chọn user từ dropdown</li>
                <li>Sau khi có hồ sơ người thuê, có thể tạo hợp đồng thuê trọ trong <strong>Quản lý Hợp đồng</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
