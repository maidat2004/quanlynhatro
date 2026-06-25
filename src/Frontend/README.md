# Frontend - Quản Lý Nhà Trọ

Frontend application cho hệ thống quản lý nhà trọ được xây dựng với React + Vite (100% JavaScript).

## 🚀 Tính năng

- ✅ Giao diện responsive, hiện đại
- 🔐 Authentication với JWT
- 👨‍💼 Dashboard Admin - Quản lý toàn bộ hệ thống
- 👨‍🎓 Dashboard Student - Xem thông tin cá nhân
- 📋 Quản lý phòng trọ
- 👥 Quản lý người thuê
- 📄 Quản lý hợp đồng
- 💰 Quản lý hóa đơn
- 🛠 Quản lý dịch vụ
- 📝 Quản lý yêu cầu/khiếu nại

## 📦 Cài đặt

### Yêu cầu

- Node.js >= 16.x
- Backend API đã chạy tại `http://localhost:5000`

### Các bước cài đặt

1. Di chuyển vào thư mục Frontend:
```bash
cd Frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. File `.env` đã được tạo với cấu hình:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Chạy development server:
```bash
npm run dev
```

App sẽ chạy tại: `http://localhost:3000`

## 🔌 API Integration

Frontend kết nối với Backend API thông qua:

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Token trong header `Authorization: Bearer <token>`
- **HTTP Client**: Axios với interceptors

## 🧪 Testing Login

### Tài khoản Admin mặc định:
- **Email**: admin@nhatro.com
- **Password**: admin123

## 🚀 Build cho Production

```bash
npm run build
```

## 📝 Notes

- Đảm bảo Backend API đang chạy trước khi start Frontend
- Token sẽ tự động expire sau 7 ngày (cấu hình trong Backend)
  