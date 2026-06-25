# Hướng Dẫn Vẽ ERD Cho Hệ Thống Quản Lý Nhà Trọ

## 📋 Các Bảng (Entities) Trong Hệ Thống

### 1. **User** (Người dùng)
- **Khóa chính**: _id
- **Thuộc tính**: name, email, password, role (admin/user), phone, address, avatar
- **Mối quan hệ**: 
  - 1 User → N Tenant (1-N)
  - 1 User (Admin) → N UpdateRequest (review)

### 2. **Room** (Phòng trọ)
- **Khóa chính**: _id
- **Thuộc tính**: roomNumber, floor, area, price, capacity, status, description, images
- **Mối quan hệ**:
  - 1 Room → N Contract (1-N)
  - 1 Room → N Invoice (1-N)
  - 1 Room → N Request (1-N)

### 3. **Tenant** (Khách thuê)
- **Khóa chính**: _id
- **Khóa ngoại**: user (→ User)
- **Thuộc tính**: fullName, idCard, phone, email, dateOfBirth, hometown, addresses, occupation
- **Mối quan hệ**:
  - N Tenant → 1 User (N-1)
  - 1 Tenant → N Contract (1-N)
  - 1 Tenant → N Invoice (1-N)
  - 1 Tenant → N Request (1-N)
  - 1 Tenant → N UpdateRequest (1-N)

### 4. **Contract** (Hợp đồng)
- **Khóa chính**: _id
- **Khóa ngoại**: room (→ Room), tenant (→ Tenant)
- **Thuộc tính**: contractNumber, startDate, endDate, monthlyRent, deposit, status
- **Mối quan hệ**:
  - N Contract → 1 Room (N-1)
  - N Contract → 1 Tenant (N-1)
  - 1 Contract → N Invoice (1-N)

### 5. **Invoice** (Hóa đơn)
- **Khóa chính**: _id
- **Khóa ngoại**: room, tenant, contract
- **Thuộc tính**: invoiceNumber, month, year, roomRent, services, totalAmount, paid, status
- **Mối quan hệ**:
  - N Invoice → 1 Room (N-1)
  - N Invoice → 1 Tenant (N-1)
  - N Invoice → 1 Contract (N-1)
  - N Invoice → N Service (N-N)

### 6. **Service** (Dịch vụ)
- **Khóa chính**: _id
- **Thuộc tính**: name, type, unitPrice, unit, description
- **Mối quan hệ**:
  - N Service → N Invoice (N-N) qua services array

### 7. **Request** (Yêu cầu/Phản ánh)
- **Khóa chính**: _id
- **Khóa ngoại**: tenant, room
- **Thuộc tính**: type, title, description, priority, status, images, response
- **Mối quan hệ**:
  - N Request → 1 Tenant (N-1)
  - N Request → 1 Room (N-1)

### 8. **UpdateRequest** (Yêu cầu cập nhật thông tin)
- **Khóa chính**: _id
- **Khóa ngoại**: tenant, reviewedBy (→ User)
- **Thuộc tính**: type, currentData, requestedData, reason, status, reviewNote
- **Mối quan hệ**:
  - N UpdateRequest → 1 Tenant (N-1)
  - N UpdateRequest → 1 User/Admin (N-1) để review

---

## 🎨 Cách Vẽ ERD

### **Phương pháp 1: Vẽ thủ công**

#### Bước 1: Vẽ các Entity (hình chữ nhật)
```
┌─────────────┐
│    USER     │
├─────────────┤
│ _id (PK)    │
│ name        │
│ email       │
│ password    │
│ role        │
└─────────────┘
```

#### Bước 2: Vẽ các mối quan hệ (đường nối với ký hiệu cardinality)
- **1-1**: Một đường thẳng với 1 ở mỗi đầu
- **1-N**: Một đường với 1 ở đầu này và N (hoặc crow's foot) ở đầu kia
- **N-N**: Crow's foot ở cả hai đầu

```
User ──────1─────< Tenant
         (1 User có nhiều Tenant)

Tenant >─────1────── Contract ──────1─────< Room
       (1 Tenant có nhiều Contract)     (1 Room có nhiều Contract)
```

#### Bước 3: Đánh dấu khóa
- **PK** (Primary Key): Khóa chính
- **FK** (Foreign Key): Khóa ngoại

---

### **Phương pháp 2: Sử dụng công cụ trực tuyến**

#### 🔧 **Tools miễn phí để vẽ ERD:**

1. **Draw.io (diagrams.net)** ⭐ Khuyên dùng
   - Website: https://app.diagrams.net/
   - Miễn phí, không cần đăng ký
   - Có sẵn shapes cho ERD
   - Lưu vào Google Drive, OneDrive hoặc local

2. **Lucidchart**
   - Website: https://www.lucidchart.com/
   - Miễn phí với giới hạn
   - Giao diện đẹp, dễ dùng

3. **dbdiagram.io** ⭐ Tốt cho database
   - Website: https://dbdiagram.io/
   - Viết code để tạo diagram (DSL syntax)
   - Tự động layout

4. **PlantUML** (file đã tạo sẵn)
   - Vẽ bằng code
   - Cài extension "PlantUML" trong VS Code
   - Xem file: `docs/database-erd.puml`

5. **Mermaid** (trong Markdown)
   - Viết trong file .md
   - GitHub hỗ trợ render tự động

---

### **Phương pháp 3: Sử dụng PlantUML (Đã tạo sẵn)**

#### Cách xem file ERD đã tạo:

1. **Cài extension trong VS Code:**
   - Mở Extensions (Ctrl+Shift+X)
   - Tìm "PlantUML"
   - Cài extension của "jebbs"

2. **Xem diagram:**
   - Mở file: `docs/database-erd.puml`
   - Nhấn `Alt+D` để preview
   - Hoặc chuột phải → "Preview Current Diagram"

3. **Export sang PNG/SVG:**
   - Chuột phải vào preview
   - Chọn "Export Current Diagram"

---

### **Phương pháp 4: Dùng dbdiagram.io (Code-first)**

```dbml
Table User {
  _id ObjectId [pk]
  name String
  email String [unique]
  password String
  role Enum
  phone String
}

Table Room {
  _id ObjectId [pk]
  roomNumber String [unique]
  floor Number
  price Number
  status Enum
}

Table Tenant {
  _id ObjectId [pk]
  user ObjectId [ref: > User._id]
  fullName String
  idCard String [unique]
}

Table Contract {
  _id ObjectId [pk]
  room ObjectId [ref: > Room._id]
  tenant ObjectId [ref: > Tenant._id]
  startDate Date
  endDate Date
}

// Copy đoạn code này vào https://dbdiagram.io/
```

---

## 📊 Sơ đồ mối quan hệ tóm tắt

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1
     │
     │ N
┌────▼─────┐      N   ┌──────────┐   1    ┌──────┐
│  TENANT  ├──────────►│ CONTRACT │◄───────┤ ROOM │
└────┬─────┘           └─────┬────┘        └──┬───┘
     │                       │                 │
     │ 1                  1  │                 │ 1
     │                       │                 │
     │ N                  N  ▼              N  ▼
     │                  ┌────────┐        ┌─────────┐
     └──────────────────► INVOICE│◄───────┤ REQUEST │
                        └────┬───┘        └─────────┘
                             │ N
                             │
                          N  │
                        ┌────▼───┐
                        │ SERVICE│
                        └────────┘
```

---

## 🎯 Các ký hiệu quan trọng

### Cardinality (Bản số):
- **1:1** - One to One (một-một)
- **1:N** - One to Many (một-nhiều) ⭐ Phổ biến nhất
- **N:N** - Many to Many (nhiều-nhiều)

### Notation (Ký hiệu):
```
1 ──────── N     (Crow's foot notation)
│          ╱╲
│         ╱  ╲

├──────── ┤     (Chen notation)
1          N
```

### Khóa:
- **🔑 PK (Primary Key)**: Khóa chính, định danh duy nhất
- **🔗 FK (Foreign Key)**: Khóa ngoại, tham chiếu đến bảng khác

---

## 💡 Tips khi vẽ ERD

1. ✅ **Đặt tên rõ ràng**: Dùng tiếng Việt hoặc tiếng Anh nhất quán
2. ✅ **Xác định khóa chính trước**: Mỗi bảng phải có PK
3. ✅ **Vẽ mối quan hệ chính trước**: User → Tenant → Contract → Invoice
4. ✅ **Ghi rõ cardinality**: 1-1, 1-N, N-N
5. ✅ **Nhóm các entity liên quan**: Đặt gần nhau để dễ nhìn
6. ✅ **Tránh đường nối chéo nhau**: Layout gọn gàng
7. ✅ **Kiểm tra tính nhất quán**: FK phải match với PK tương ứng

---

## 📖 Đọc thêm

- **Chen Notation**: https://www.visual-paradigm.com/guide/data-modeling/what-is-entity-relationship-diagram/
- **Crow's Foot Notation**: https://vertabelo.com/blog/crow-s-foot-notation/
- **PlantUML Guide**: https://plantuml.com/ie-diagram

---

## ✅ File ERD đã tạo sẵn

📁 **Vị trí**: `d:\DACN\QuanLiNhaTro\docs\database-erd.puml`

**Cách sử dụng**:
1. Cài PlantUML extension trong VS Code
2. Mở file `database-erd.puml`
3. Nhấn `Alt+D` để xem diagram
4. Export sang PNG/SVG nếu cần

---

**Chúc bạn vẽ ERD thành công! 🎉**
