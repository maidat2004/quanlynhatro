# 🚀 HƯỚNG DẪN NHANH - BẮT ĐẦU NGAY

## Cách 1: Setup tự động (Khuyến nghị)

### Bước 1: Chạy setup
```bash
setup.bat
```
Script này sẽ tự động:
- ✅ Cài đặt dependencies cho Backend
- ✅ Cài đặt dependencies cho Frontend
- ✅ Tạo file .env

### Bước 2: Đảm bảo MongoDB đang chạy
Kiểm tra MongoDB service đã được start

### Bước 3: Chạy seed data (tạo dữ liệu mẫu)
```bash
cd Backend
npm run seed
```

### Bước 4: Chạy toàn bộ hệ thống
```bash
start-all.bat
```

## Cách 2: Chạy thủ công

### Backend:
```bash
cd Backend
npm install
npm run seed
npm run dev
```

### Frontend (Terminal mới):
```bash
cd Frontend
npm install
npm run dev
```

## 🔑 Đăng nhập

Truy cập: http://localhost:3000

**Admin:**
- Email: `admin@nhatro.com`
- Password: `admin123`

## ⚡ Commands nhanh

| Command | Mô tả |
|---------|-------|
| `setup.bat` | Setup toàn bộ project |
| `start-all.bat` | Chạy cả Backend + Frontend |
| `Backend\start.bat` | Chỉ chạy Backend |
| `Frontend\start.bat` | Chỉ chạy Frontend |

## 🐛 Lỗi thường gặp

### MongoDB not running
```bash
# Start MongoDB service
net start MongoDB
```

### Port đã được sử dụng
- Backend (5000): Thay đổi PORT trong Backend/.env
- Frontend (3000): Thay đổi port trong Frontend/vite.config.js

### Token hết hạn
- Đăng xuất và đăng nhập lại

## 📚 Tài liệu đầy đủ

Xem file `README.md` để biết thêm chi tiết.
