# Hệ Thống Quản Lý Nhà Trọ - MVC Architecture

## 📁 Cấu Trúc Thư Mục MVC

```
f:\NT\Frontend\
├── index.html                   # Entry point HTML
├── package.json                 # Dependencies
├── vite.config.ts              # Vite configuration
├── README.md                    # Tài liệu dự án
├── public\                      # Tài nguyên tĩnh
│   └── images\                  # Ảnh tĩnh
├── src\                         # Source code
│   ├── models\                  # 📊 MODELS - Định nghĩa data structures
│   │   ├── User.ts             # Model cho User
│   │   ├── Room.ts             # Model cho Room
│   │   ├── Tenant.ts           # Model cho Tenant
│   │   ├── Contract.ts         # Model cho Contract
│   │   ├── Invoice.ts          # Model cho Invoice
│   │   ├── Service.ts          # Model cho Service
│   │   ├── UpdateRequest.ts    # Model cho Update Request
│   │   └── index.ts            # Central export
│   │
│   ├── services\                # 🔧 SERVICES - Business logic & API calls
│   │   ├── dataService.ts      # Mock data service (sẽ thay bằng real API)
│   │   ├── authService.ts      # Authentication service
│   │   ├── roomService.ts      # Room management service
│   │   ├── invoiceService.ts   # Invoice service
│   │   └── index.ts            # Service exports
│   │
│   ├── contexts\                # 🌐 CONTEXTS - Global state management
│   │   ├── AuthContext.tsx     # Auth state & functions
│   │   └── index.ts            # Context exports
│   │
│   ├── hooks\                   # 🪝 CUSTOM HOOKS - Reusable logic
│   │   ├── useAuth.ts          # Auth hook
│   │   ├── useRooms.ts         # Rooms data hook
│   │   ├── useInvoices.ts      # Invoices data hook
│   │   └── index.ts            # Hooks exports
│   │
│   ├── pages\                   # 📄 VIEWS/PAGES - UI Components
│   │   ├── LoginPage.tsx       # Login page
│   │   ├── public\             # Public pages (không cần login)
│   │   │   ├── PublicHome.tsx  # Trang chủ công khai
│   │   │   ├── PublicRooms.tsx # Xem phòng trống
│   │   │   └── index.ts
│   │   ├── admin\              # Admin pages
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── RoomManagement.tsx
│   │   │   ├── TenantManagement.tsx
│   │   │   ├── ContractManagement.tsx
│   │   │   ├── InvoiceManagement.tsx
│   │   │   ├── ServiceManagement.tsx
│   │   │   ├── RequestManagement.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── index.ts
│   │   └── user\               # User/Student pages
│   │       ├── StudentLayout.tsx
│   │       ├── StudentDashboard.tsx
│   │       ├── StudentProfile.tsx
│   │       ├── StudentRoom.tsx
│   │       ├── StudentContract.tsx
│   │       ├── StudentInvoices.tsx
│   │       └── index.ts
│   │
│   ├── components\              # 🧩 SHARED COMPONENTS
│   │   ├── shared\             # Shared components (Header, Footer, etc.)
│   │   ├── ui\                 # UI primitives (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── figma\              # Figma exported components
│   │
│   ├── utils\                   # 🛠️ UTILITIES
│   │   └── helpers.ts          # Helper functions
│   │
│   ├── styles\                  # 🎨 STYLES
│   │   └── globals.css         # Global CSS
│   │
│   ├── App.tsx                  # 🚀 ROOT COMPONENT - Routes & Context Provider
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind CSS
```

## 🏗️ Kiến Trúc MVC

### **Models** (📊 Data Layer)

- Định nghĩa cấu trúc dữ liệu (interfaces, types)
- Không chứa business logic
- TypeScript interfaces cho type safety

**Files:** `src/models/*.ts`

### **Services** (🔧 Business Logic Layer)

- Xử lý business logic
- Gọi API (hiện tại là mock data)
- Data transformation & validation
- Không phụ thuộc vào UI

**Files:** `src/services/*.ts`

### **Views/Pages** (📄 Presentation Layer)

- React components hiển thị UI
- Sử dụng hooks để lấy data từ services
- Không chứa business logic
- Responsive & accessible

**Files:** `src/pages/**/*.tsx`

### **Contexts** (🌐 State Management)

- Global state management
- Authentication state
- Shared data across components

**Files:** `src/contexts/*.tsx`

### **Hooks** (🪝 Reusable Logic)

- Custom hooks cho logic tái sử dụng
- Kết nối giữa services và components
- Data fetching & state management

**Files:** `src/hooks/*.ts`

## 🔄 Data Flow

```
┌─────────────┐
│   User      │
│  Interaction│
└──────┬──────┘
       │
       v
┌─────────────┐      ┌──────────┐      ┌─────────┐
│  Component  │ ---> │  Hook    │ ---> │ Service │
│   (View)    │ <--- │ (Logic)  │ <--- │ (Data)  │
└─────────────┘      └──────────┘      └─────────┘
       │                                      │
       │                                      v
       │                              ┌─────────┐
       └──────────────────────────────│  Model  │
                                      └─────────┘
```

## 🎯 Features Đã Giữ Nguyên

✅ **100% Giao diện** - Màu sắc, layout, animation
✅ **100% Chức năng** - Login, Dashboard, CRUD operations  
✅ **100% Luồng đồ** - Authentication, authorization flow
✅ **Responsive Design** - Mobile, tablet, desktop
✅ **Beautiful UI** - Gradient, animations, modern design

## 🚀 Cách Sử Dụng

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Demo Accounts

- **Admin**: admin@tronho.com / admin123
- **Student**: nguyenvana@email.com / student123

## 📝 Changelog

### v2.0.0 - MVC Architecture

- ✨ Chuyển đổi sang mô hình MVC chuẩn
- 📊 Tạo Models cho tất cả entities
- 🔧 Tạo Services layer cho business logic
- 🌐 Implement Context API cho state management
- 🪝 Tạo custom hooks cho reusable logic
- 📄 Tổ chức lại Pages theo luồng: public/admin/user
- 🧩 Tách biệt shared components
- ✅ Giữ nguyên 100% giao diện và chức năng

## 🔮 Tương Lai

- [ ] Kết nối với real API backend
- [ ] Thêm unit tests
- [ ] Implement error boundaries
- [ ] Add loading states
- [ ] Optimize performance
- [ ] Add more features

## 👨‍💻 Developer

Hệ thống được refactor sang MVC architecture trong khi vẫn giữ nguyên toàn bộ giao diện, màu sắc và chức năng gốc.
