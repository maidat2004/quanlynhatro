import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { User, Lock, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsPage({ user }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin!' });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp!' });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      setIsLoading(false);
      return;
    }

    // Simulate password change
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! 🎉' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
          <span className="text-3xl">⚙️</span>
        </div>
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Cài Đặt
          </h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và bảo mật</p>
        </div>
      </motion.div>

      {/* Profile Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Thông Tin Tài Khoản</CardTitle>
                <CardDescription>Thông tin cá nhân của bạn</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Họ và Tên</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-900">{user.name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Vai Trò</span>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👑</span>
                    <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Quản Trị Viên
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Trạng Thái</span>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-green-700">Đang Hoạt Động</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Đổi Mật Khẩu</CardTitle>
                <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl border flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p>{message.text}</p>
                </motion.div>
              )}

              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mật Khẩu Hiện Tại
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mật Khẩu Mới
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Xác Nhận Mật Khẩu Mới
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span>Cập Nhật Mật Khẩu</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔐</span>
              <div>
                <CardTitle className="text-xl text-orange-800">Mẹo Bảo Mật</CardTitle>
                <CardDescription className="text-orange-600">Giữ tài khoản của bạn an toàn</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-orange-800">
              <li className="flex items-start gap-2">
                <span>🔹</span>
                <span>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔹</span>
                <span>Không chia sẻ mật khẩu với bất kỳ ai</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔹</span>
                <span>Thay đổi mật khẩu định kỳ để tăng cường bảo mật</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔹</span>
                <span>Đăng xuất khỏi tài khoản khi sử dụng máy tính chung</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
