# Hướng Dẫn Sử Dụng Hệ Thống Quản Lý Nhà Trọ

## 🚀 Cài Đặt và Chạy

### 1. Cài đặt dependencies
```bash
setup.bat
```

### 2. Tạo dữ liệu mẫu
```bash
cd Backend
npm run seed
```

### 3. Chạy ứng dụng
```bash
start-all.bat
```

Hoặc chạy riêng từng phần:
- Backend: `cd Backend && npm start` (port 5000)
- Frontend: `cd Frontend && npm run dev` (port 3000)

## 👥 Tài Khoản Mặc Định

### 👨‍💼 Tài khoản Admin (Quản lý nhà trọ)
- **Email:** `admin@nhatro.com`
- **Password:** `admin123`
- **Quyền hạn:**
  - Quản lý phòng trọ
  - Quản lý người thuê
  - Quản lý hợp đồng
  - Quản lý hóa đơn
  - Quản lý dịch vụ
  - Quản lý yêu cầu
  - Cài đặt hệ thống

### 👤 Tài khoản User (Người thuê trọ)
- **Email:** `user@nhatro.com`
- **Password:** `user123`
- **Quyền hạn:**
  - Xem thông tin phòng của mình
  - Xem hợp đồng
  - Xem và thanh toán hóa đơn
  - Cập nhật thông tin cá nhân
  - Gửi yêu cầu đến admin

## 📱 Chức Năng Theo Vai Trò

### Admin (Quản lý nhà trọ)
- Dashboard với thống kê tổng quan
- Quản lý danh sách phòng (thêm, sửa, xóa)
- Quản lý người thuê trọ
- Tạo và quản lý hợp đồng
- Tạo và theo dõi hóa đơn
- Quản lý các dịch vụ (điện, nước, internet...)
- Xem và xử lý yêu cầu từ người thuê
- Cài đặt thông tin hệ thống

### User (Người thuê trọ)
- Dashboard cá nhân
- Xem thông tin phòng đang thuê
- Xem chi tiết hợp đồng
- Xem danh sách hóa đơn và thanh toán
- Cập nhật thông tin cá nhân
- Gửi yêu cầu bảo trì/khiếu nại

## 🌐 Truy Cập

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Database:** MongoDB (localhost:27017)

## 🔑 Phân Quyền

Hệ thống có 2 vai trò:

1. **admin** - Quản lý nhà trọ (full quyền)
2. **user** - Người thuê trọ (quyền hạn chế)

Sau khi đăng nhập, hệ thống tự động chuyển hướng:
- Admin → `/admin`
- User → `/user`

## 📝 Lưu Ý

- Mật khẩu được mã hóa bằng bcrypt
- Token JWT có thời gian hết hạn
- Cần có MongoDB đang chạy trước khi start backend
- Frontend sử dụng Vite cho hot reload nhanh

## 🛠️ Công Nghệ

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React 18, Vite, Axios, React Router
- **Authentication:** JWT (JSON Web Token)
- **Styling:** Tailwind CSS
