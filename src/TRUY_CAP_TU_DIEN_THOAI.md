# 📱 Hướng dẫn Truy cập từ Điện thoại

## Bước 1: Khởi động Backend và Frontend

### Backend
```bash
cd Backend
npm run dev
```

Backend sẽ hiển thị địa chỉ IP của bạn, ví dụ:
```
🚀 Server is running!
📝 Environment: development

📡 Access URLs:
   Local:   http://localhost:5000
   Network: http://192.168.1.100:5000

📱 To access from mobile:
   Make sure your phone is on the same WiFi network
   Then open: http://192.168.1.100:5000
```

### Frontend
```bash
cd Frontend
npm run dev
```

Vite sẽ hiển thị:
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
```

## Bước 2: Cấu hình Frontend để kết nối Backend

### Cách 1: Sử dụng file .env (Khuyến nghị)

Tạo file `.env` trong thư mục `Frontend`:
```
VITE_API_URL=http://192.168.1.100:5000/api
```

**Lưu ý**: Thay `192.168.1.100` bằng địa chỉ IP thực của máy tính bạn (hiển thị khi chạy backend)

### Cách 2: Sửa trực tiếp trong code

Mở file `Frontend/src/config/api.js` và sửa:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.100:5000/api';
```

## Bước 3: Truy cập từ Điện thoại

1. **Đảm bảo điện thoại và máy tính cùng WiFi**
2. **Trên điện thoại, mở trình duyệt**
3. **Nhập địa chỉ**: `http://192.168.1.100:3000`
   - Thay `192.168.1.100` bằng địa chỉ IP Network của bạn

## 🔧 Xử lý sự cố

### Không kết nối được?

1. **Kiểm tra tường lửa Windows**:
   - Mở Windows Defender Firewall
   - Cho phép Node.js qua cả Private và Public networks

2. **Kiểm tra cùng WiFi**:
   - Máy tính và điện thoại phải cùng mạng WiFi

3. **Tắt VPN**:
   - Nếu đang dùng VPN trên máy tính hoặc điện thoại, hãy tắt đi

4. **Kiểm tra IP**:
   - Chạy `ipconfig` trong PowerShell
   - Tìm "IPv4 Address" của WiFi adapter

### Lỗi CORS?

File `Backend/server.js` đã được cấu hình CORS mặc định. Nếu vẫn lỗi, thêm:
```javascript
app.use(cors({
  origin: '*',  // Cho phép mọi origin
  credentials: true
}));
```

## 📝 Ví dụ địa chỉ IP phổ biến

- `192.168.1.x` - Router gia đình thông thường
- `192.168.0.x` - Router gia đình (biến thể)
- `10.0.0.x` - Một số router/công ty
- `172.16.x.x` - Mạng công ty

## ✅ Hoàn tất!

Sau khi cấu hình xong, bạn có thể:
- ✅ Đăng nhập từ điện thoại
- ✅ Sử dụng tất cả chức năng như trên máy tính
- ✅ Quản lý nhà trọ mọi lúc mọi nơi (trong cùng WiFi)
