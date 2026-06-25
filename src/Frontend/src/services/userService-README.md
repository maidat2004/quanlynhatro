# UserService - Tính năng Tự động Cập nhật

## Tổng quan
UserService đã được mở rộng với các phương thức tự động cập nhật dữ liệu và reload trang.

## Các phương thức mới

### 1. `startAutoRefresh(callback, filters, interval)`
Bắt đầu tự động cập nhật dữ liệu theo khoảng thời gian định kỳ.

**Tham số:**
- `callback` (Function): Hàm được gọi mỗi khi có dữ liệu mới
- `filters` (Object): Bộ lọc dữ liệu (tùy chọn)
- `interval` (Number): Khoảng thời gian cập nhật (ms), mặc định 30000ms

**Ví dụ:**
```javascript
userService.startAutoRefresh(
  (newUsers) => {
    setUsers(newUsers);
    toast.info('Dữ liệu đã cập nhật');
  },
  { role: 'tenant' }, // Chỉ lấy tenant
  15000 // Cập nhật mỗi 15 giây
);
```

### 2. `stopAutoRefresh()`
Dừng việc tự động cập nhật dữ liệu.

**Ví dụ:**
```javascript
userService.stopAutoRefresh();
```

### 3. `refreshData(filters)`
Cập nhật dữ liệu một lần thủ công.

**Tham số:**
- `filters` (Object): Bộ lọc dữ liệu (tùy chọn)

**Trả về:** Promise với dữ liệu users mới

**Ví dụ:**
```javascript
const users = await userService.refreshData({ isActive: true });
setUsers(users);
```

### 4. `autoReloadPage(delay, message)`
Tự động reload trang sau một khoảng thời gian.

**Tham số:**
- `delay` (Number): Thời gian chờ trước khi reload (ms), mặc định 5000ms
- `message` (String): Thông báo hiển thị trước khi reload

**Ví dụ:**
```javascript
userService.autoReloadPage(
  3000,
  'Dữ liệu quan trọng đã được cập nhật. Trang sẽ tải lại...'
);
```

## Cách sử dụng trong Component

```javascript
import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';

export default function MyComponent() {
  const [users, setUsers] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadUsers();

    // Cleanup khi component unmount
    return () => {
      userService.stopAutoRefresh();
    };
  }, []);

  const loadUsers = async () => {
    const data = await userService.refreshData();
    setUsers(data);
  };

  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      userService.stopAutoRefresh();
      setAutoRefresh(false);
    } else {
      userService.startAutoRefresh(
        (newData) => setUsers(newData),
        {},
        20000 // 20 giây
      );
      setAutoRefresh(true);
    }
  };

  return (
    <div>
      <button onClick={toggleAutoRefresh}>
        {autoRefresh ? 'Tắt' : 'Bật'} Auto Refresh
      </button>
      {/* ... render users ... */}
    </div>
  );
}
```

## Lưu ý
- Luôn gọi `stopAutoRefresh()` trong cleanup function của useEffect để tránh memory leaks
- Auto refresh sẽ tự động dừng khi component unmount
- Các phương thức này hoạt động bất đồng bộ và có error handling built-in
- Console logs được thêm để debug dễ dàng hơn