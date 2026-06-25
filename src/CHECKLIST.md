# ✅ CHECKLIST - HƯỚNG DẪN TỪNG BƯỚC

## 📋 Chuẩn bị

- [ ] Đã cài đặt Node.js (phiên bản >= 16.x)
- [ ] Đã cài đặt MongoDB
- [ ] Đã start MongoDB service
- [ ] Đã tải code về máy

## 🔧 Setup (Làm 1 lần duy nhất)

### Tự động (Khuyến nghị):
- [ ] Chạy `setup.bat`
- [ ] Đợi cài đặt xong

### Thủ công:

**Backend:**
- [ ] Mở terminal, cd vào thư mục `Backend`
- [ ] Chạy `npm install`
- [ ] File `.env` đã được tạo sẵn, kiểm tra và điều chỉnh nếu cần

**Frontend:**
- [ ] Mở terminal mới, cd vào thư mục `Frontend`
- [ ] Chạy `npm install`

## 🗄️ Tạo dữ liệu mẫu (Làm 1 lần)

- [ ] Mở terminal trong thư mục `Backend`
- [ ] Chạy `npm run seed`
- [ ] Xác nhận thấy thông báo "Seed data hoàn tất!"
- [ ] Ghi nhớ thông tin đăng nhập Admin:
  - Email: admin@nhatro.com
  - Password: admin123

## 🚀 Chạy hệ thống

### Cách 1: Tự động (Dễ nhất)
- [ ] Chạy `start-all.bat`
- [ ] Đợi 2 cửa sổ terminal hiện lên
- [ ] Đợi Backend khởi động (cổng 5000)
- [ ] Đợi Frontend khởi động (cổng 3000)
- [ ] Browser tự động mở tại http://localhost:3000

### Cách 2: Thủ công

**Backend:**
- [ ] Terminal 1: cd vào `Backend`
- [ ] Chạy `npm run dev`
- [ ] Xác nhận thấy "Server is running on port 5000"

**Frontend:**
- [ ] Terminal 2: cd vào `Frontend`
- [ ] Chạy `npm run dev`
- [ ] Xác nhận thấy "Local: http://localhost:3000"
- [ ] Mở browser vào http://localhost:3000

## 🧪 Kiểm tra hoạt động

- [ ] Frontend hiển thị trang chủ
- [ ] Click vào nút "Đăng nhập"
- [ ] Nhập thông tin Admin:
  - Email: admin@nhatro.com
  - Password: admin123
- [ ] Đăng nhập thành công
- [ ] Chuyển vào Admin Dashboard
- [ ] Thử các chức năng:
  - [ ] Xem danh sách phòng
  - [ ] Xem danh sách người thuê
  - [ ] Xem hợp đồng
  - [ ] Xem hóa đơn
  - [ ] Xem dịch vụ

## ✨ Tạo tài khoản Sinh viên

- [ ] Đăng nhập với tài khoản Admin
- [ ] Vào mục "Quản lý Người thuê"
- [ ] Tạo người thuê mới
- [ ] Người thuê sẽ nhận được tài khoản để đăng nhập

## 🎯 Đã hoàn thành!

Nếu tất cả các bước trên đều ✅, hệ thống đã sẵn sàng!

## 🆘 Gặp lỗi?

### MongoDB không chạy
```bash
# Windows
net start MongoDB

# Kiểm tra
mongod --version
```

### Port đã được sử dụng

**Backend (port 5000):**
- Mở `Backend/.env`
- Đổi `PORT=5000` thành `PORT=5001` (hoặc port khác)

**Frontend (port 3000):**
- Mở `Frontend/vite.config.js`
- Đổi `port: 3000` thành `port: 3001` (hoặc port khác)

### Không kết nối được API

- [ ] Kiểm tra Backend đang chạy
- [ ] Kiểm tra console có lỗi không
- [ ] Xóa cache browser và reload (Ctrl + Shift + R)
- [ ] Kiểm tra file `Frontend/.env` có đúng API URL không

### Lỗi dependencies

```bash
# Trong Backend
cd Backend
rm -rf node_modules package-lock.json
npm install

# Trong Frontend
cd Frontend
rm -rf node_modules package-lock.json
npm install
```

### Reset toàn bộ dữ liệu

```bash
cd Backend
npm run seed
```

## 📞 Cần thêm trợ giúp?

Xem các file tài liệu:
- `README.md` - Hướng dẫn chi tiết
- `QUICK_START.md` - Hướng dẫn nhanh
- `BAT_DAU_NGAY.md` - Hướng dẫn tiếng Việt
- `Backend/README.md` - Tài liệu Backend API
- `Frontend/README.md` - Tài liệu Frontend

---

✅ **Hoàn thành checklist này là bạn đã sẵn sàng sử dụng hệ thống!**
