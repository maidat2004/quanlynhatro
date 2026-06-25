# Hệ thống Quản Lý Nhà Trọ

Hệ thống quản lý nhà trọ full-stack được xây dựng với Node.js + Express + MongoDB (Backend) và React + Vite (Frontend).

## 📋 Tổng quan

### Backend
- **Framework**: Express.js
- **Database**: MongoDB với Mongoose
- **Authentication**: JWT (JSON Web Token)
- **API**: RESTful API

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **HTTP Client**: Axios
- **Routing**: React Router

## 🚀 Hướng dẫn cài đặt và chạy

### Bước 1: Cài đặt MongoDB

Đảm bảo MongoDB đã được cài đặt và đang chạy trên máy tính của bạn.

- Download: https://www.mongodb.com/try/download/community
- Sau khi cài đặt, chạy MongoDB service

### Bước 2: Cài đặt Backend

```bash
# Di chuyển vào thư mục Backend
cd Backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
copy .env.example .env

# Chỉnh sửa file .env theo cấu hình của bạn
# Mặc định:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/quanlinhatro
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# ADMIN_EMAIL=admin@nhatro.com
# ADMIN_PASSWORD=admin123

# Chạy seed data (tạo dữ liệu mẫu)
npm run seed

# Chạy server
npm run dev
```

Backend sẽ chạy tại: **http://localhost:5000**

### Bước 3: Cài đặt Frontend

Mở terminal mới:

```bash
# Di chuyển vào thư mục Frontend
cd Frontend

# Cài đặt dependencies
npm install

# File .env đã được tạo sẵn với:
# VITE_API_URL=http://localhost:5000/api

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

## 🔑 Tài khoản đăng nhập

### Admin (Quản lý)
- **Email**: admin@nhatro.com
- **Password**: admin123

### Student (Sinh viên)
- Cần được tạo bởi Admin sau khi đăng nhập

## 📚 Tính năng chính

### Dành cho Admin:
✅ Quản lý phòng trọ (CRUD)
✅ Quản lý người thuê (CRUD)
✅ Quản lý hợp đồng (CRUD)
✅ Quản lý hóa đơn (CRUD)
✅ Quản lý dịch vụ (Điện, nước, internet...)
✅ Xử lý yêu cầu/khiếu nại từ sinh viên
✅ Dashboard thống kê
✅ Cài đặt hệ thống

### Dành cho Sinh viên:
✅ Xem thông tin phòng của mình
✅ Xem hợp đồng thuê
✅ Xem và thanh toán hóa đơn
✅ Gửi yêu cầu/khiếu nại
✅ Cập nhật thông tin cá nhân

### Công khai:
✅ Xem danh sách phòng trống
✅ Thông tin liên hệ

## 🗂 Cấu trúc dự án

```
QuanLiNhaTro/
├── Backend/                 # Node.js + Express API
│   ├── config/             # Cấu hình database
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── seeds/             # Seed data
│   ├── utils/             # Utilities
│   ├── .env.example       # Environment template
│   ├── package.json
│   ├── README.md
│   └── server.js          # Entry point
│
└── Frontend/               # React + Vite
    ├── src/
    │   ├── components/    # React components
    │   │   ├── admin/    # Admin pages
    │   │   ├── student/  # Student pages
    │   │   ├── public/   # Public pages
    │   │   └── ui/       # UI components
    │   ├── config/       # API config
    │   ├── contexts/     # React contexts
    │   ├── hooks/        # Custom hooks
    │   ├── services/     # API services
    │   ├── App.jsx       # Main component
    │   └── main.jsx      # Entry point
    ├── .env              # Environment variables
    ├── package.json
    ├── README.md
    └── vite.config.js    # Vite config
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- `PUT /api/auth/profile` - Cập nhật profile
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Rooms
- `GET /api/rooms` - Danh sách phòng
- `GET /api/rooms/available` - Phòng trống
- `POST /api/rooms` - Tạo phòng (Admin)
- `PUT /api/rooms/:id` - Cập nhật phòng (Admin)
- `DELETE /api/rooms/:id` - Xóa phòng (Admin)

### Tenants
- `GET /api/tenants` - Danh sách người thuê (Admin)
- `POST /api/tenants` - Tạo người thuê (Admin)
- `PUT /api/tenants/:id` - Cập nhật (Admin)

### Contracts
- `GET /api/contracts` - Danh sách hợp đồng
- `GET /api/contracts/tenant/:tenantId` - Hợp đồng của tenant
- `POST /api/contracts` - Tạo hợp đồng (Admin)

### Invoices
- `GET /api/invoices` - Danh sách hóa đơn
- `GET /api/invoices/tenant/:tenantId` - Hóa đơn của tenant
- `POST /api/invoices` - Tạo hóa đơn (Admin)
- `PUT /api/invoices/:id/pay` - Thanh toán (Admin)

### Services
- `GET /api/services` - Danh sách dịch vụ
- `POST /api/services` - Tạo dịch vụ (Admin)

### Requests
- `GET /api/requests` - Danh sách yêu cầu (Admin)
- `POST /api/requests` - Tạo yêu cầu
- `PUT /api/requests/:id/resolve` - Xử lý yêu cầu (Admin)

## 🛠 Công nghệ sử dụng

### Backend:
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (Password hashing)
- dotenv (Environment variables)

### Frontend:
- React 18
- Vite
- React Router
- Axios
- Tailwind CSS
- shadcn/ui
- Lucide React (Icons)

## 📝 Ghi chú quan trọng

1. **Đảm bảo MongoDB đang chạy** trước khi start Backend
2. **Chạy Backend trước**, sau đó mới chạy Frontend
3. **Token JWT** có thời hạn 7 ngày, sau đó cần đăng nhập lại
4. **Port mặc định**: 
   - Backend: 5000
   - Frontend: 3000
5. Nếu muốn thay đổi port, cập nhật trong:
   - Backend: `.env` file (PORT=...)
   - Frontend: `.env` file (VITE_API_URL=...)

## 🧪 Testing

### Test Backend API với Postman/Thunder Client:
1. Import các endpoint từ phần API Endpoints
2. Đăng nhập để lấy token
3. Thêm token vào header: `Authorization: Bearer <token>`

### Test Frontend:
1. Truy cập http://localhost:3000
2. Đăng nhập với tài khoản admin
3. Test các tính năng quản lý

## 🚀 Deploy lên Production

### Backend:
```bash
cd Backend
npm run build  # Nếu có build process
node server.js
```

### Frontend:
```bash
cd Frontend
npm run build
# Deploy thư mục build/ lên hosting
```

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB:
- Kiểm tra MongoDB service đang chạy
- Kiểm tra MONGODB_URI trong file .env

### Lỗi CORS:
- Backend đã cấu hình CORS, cho phép mọi origin
- Nếu vẫn lỗi, kiểm tra proxy trong vite.config.js

### Lỗi 401 Unauthorized:
- Token hết hạn, đăng nhập lại
- Token không hợp lệ, xóa localStorage và đăng nhập lại

## 📄 License

MIT

## 👥 Liên hệ

Nếu có vấn đề gì, vui lòng tạo issue trên GitHub repository.
