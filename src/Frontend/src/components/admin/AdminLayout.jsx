import {
  Bell,
  Building2,
  FileText,
  LayoutDashboard,
  Receipt,
  Settings,
  Users
} from 'lucide-react';
import ManagementLayout from '../layout/ManagementLayout';

const navigation = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, accent: '#2563eb', exact: true },
  { label: 'Phòng trọ', href: '/admin/phong', icon: Building2, accent: '#7c3aed' },
  { label: 'Người thuê', href: '/admin/nguoi-thue', icon: Users, accent: '#16a34a' },
  { label: 'Tài khoản', href: '/admin/tai-khoan', icon: Users, accent: '#0f766e' },
  { label: 'Hợp đồng', href: '/admin/hop-dong', icon: FileText, accent: '#ea580c' },
  { label: 'Hóa đơn', href: '/admin/hoa-don', icon: Receipt, accent: '#db2777' },
  { label: 'Yêu cầu', href: '/admin/yeu-cau', icon: Bell, accent: '#dc2626' },
  { label: 'Dịch vụ', href: '/admin/dich-vu', icon: Settings, accent: '#4f46e5' },
];

export default function AdminLayout({ user, onLogout, children }) {
  return (
    <ManagementLayout
      user={user}
      title="Quản lý nhà trọ"
      subtitle="Khu quản trị"
      roleLabel="Admin"
      navigation={navigation}
      settingsHref="/admin/settings"
      onLogout={onLogout}
    >
      {children}
    </ManagementLayout>
  );
}
