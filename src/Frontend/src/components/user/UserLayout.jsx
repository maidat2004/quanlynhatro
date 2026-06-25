import {
  Bell,
  Building2,
  FileText,
  Receipt,
  User
} from 'lucide-react';
import ManagementLayout from '../layout/ManagementLayout';

const navigation = [
  { label: 'Thông tin cá nhân', href: '/user/profile', icon: User, accent: '#2563eb', exact: true },
  { label: 'Phòng của tôi', href: '/user/phong', aliases: ['/user'], icon: Building2, accent: '#7c3aed' },
  { label: 'Hợp đồng', href: '/user/hop-dong', icon: FileText, accent: '#ea580c' },
  { label: 'Hóa đơn', href: '/user/hoa-don', icon: Receipt, accent: '#db2777' },
  { label: 'Yêu cầu hỗ trợ', href: '/user/yeu-cau', icon: Bell, accent: '#16a34a' },
];

export default function UserLayout({ user, onLogout, children }) {
  return (
    <ManagementLayout
      user={user}
      title="Nhà trọ sinh viên"
      subtitle="Khu người dùng"
      roleLabel="Người dùng"
      navigation={navigation}
      settingsHref="/user/profile"
      onLogout={onLogout}
    >
      {children}
    </ManagementLayout>
  );
}
