# ☕ Nha Trang Coffee Review

Ứng dụng web đánh giá & khám phá quán cà phê tại **Nha Trang**. Người dùng có thể
tìm kiếm, lọc theo phong cách/khu vực, xem chi tiết quán trên bản đồ, viết đánh giá
chấm sao; quản trị viên (admin) có thể thêm/sửa/xóa quán và tải ảnh lên.

> Dữ liệu thật được lưu trên **MongoDB Atlas**, ảnh quán lưu trên **Cloudinary**.

---

## ✨ Tính năng chính

- 🏠 **Trang chủ**: hero slider, ô tìm kiếm, lọc theo **phong cách** (View biển, Làm
  việc, Yên tĩnh, Sân vườn, Rang xay, Học bài, Chơi game, Chơi bài) và theo **khu vực**
  (Nha Trang, Nam/Bắc/Tây Nha Trang), bản đồ quán.
- 🔍 **Khám phá**: duyệt toàn bộ quán, lọc + sắp xếp (điểm cao, nhiều đánh giá, A→Z).
- 🗺️ **Bản đồ**: hiển thị vị trí quán (Google Maps nếu có API key, ngược lại
  OpenStreetMap miễn phí).
- 🏆 **Bảng xếp hạng**: top quán theo điểm & lượt đánh giá.
- ☕ **Chi tiết quán**: thư viện ảnh có lightbox (xem ảnh gốc), bản đồ vị trí + nút chỉ
  đường, danh sách đánh giá, form viết đánh giá chấm sao.
- 👤 **Tài khoản**: đăng ký / đăng nhập (JWT lưu trong cookie httpOnly), trang cá nhân.
- 🛠️ **Trang quản trị (Admin)**: thống kê, duyệt quán, thêm/sửa/xóa quán, **upload ảnh
  lên Cloudinary** (kéo-thả hoặc chọn tệp), tự động dọn ảnh cũ khi thay ảnh.
- ⭐ **Tự tính rating**: khi có đánh giá mới, điểm trung bình của quán được tính lại tự
  động từ collection Review.
- 🌗 **Dark mode** (lưu lựa chọn vào localStorage) + giao diện **responsive** từ điện
  thoại gập (Galaxy Z Fold) tới desktop.

---

## 🧱 Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| Framework | **Next.js 16** (App Router, Server Components, Server Actions, Turbopack) |
| UI | **React 19**, **TypeScript 5** |
| Styling | **Tailwind CSS v4** (design tokens qua `@theme`, dark mode bằng class, breakpoint tùy biến) |
| Cơ sở dữ liệu | **MongoDB Atlas** + **Mongoose 9** (kết nối cache toàn cục) |
| Lưu trữ ảnh | **Cloudinary** (`cloudinary` SDK, upload từ Server Action) |
| Xác thực | **JWT** (`jsonwebtoken`) lưu trong cookie httpOnly + **bcryptjs** để hash mật khẩu |
| Bản đồ | **@react-google-maps/api** (Advanced Marker) hoặc **OpenStreetMap** (fallback) |
| Icon | **Material Symbols** (Google Fonts), **lucide-react** |
| Font | Inter & Montserrat (`next/font/google`) |

---

## 📁 Cấu trúc thư mục

```
frontend/
├─ app/                       # App Router
│  ├─ page.tsx + HomeClient   # Trang chủ
│  ├─ explore/                # Khám phá
│  ├─ map/                    # Bản đồ
│  ├─ top-reviews/            # Bảng xếp hạng
│  ├─ cafe/[id]/              # Chi tiết quán + form đánh giá
│  ├─ login/                  # Đăng nhập / đăng ký
│  ├─ profile/                # Trang cá nhân
│  ├─ admin/                  # Trang quản trị (+ add-cafe, edit-cafe)
│  ├─ layout.tsx              # Layout gốc (font, dark-mode script)
│  └─ globals.css             # Design tokens + dark mode + tiện ích
├─ components/                # Navbar, Footer, HeroSlider, GoogleMapWidget,
│                             # LocationPicker, CafeGallery, CoffeeRating...
├─ lib/
│  ├─ dbConnect.ts            # Kết nối MongoDB (cache global) + chạy seed
│  ├─ cloudinary.ts           # Cấu hình SDK + upload/xóa ảnh
│  ├─ data.ts                 # Lớp truy vấn DB (serialize về plain object)
│  ├─ auth.ts                 # JWT cookie, hash/verify mật khẩu
│  ├─ actions.ts              # Server Actions (login, register, review, CRUD quán)
│  ├─ seed.ts                 # Seed admin mặc định + quán mẫu
│  ├─ mockData.ts             # Chỉ còn các kiểu TypeScript dùng chung
│  └─ constants.ts            # Danh sách khu vực Nha Trang
├─ models/                    # Mongoose schema: User, Cafe, Review
├─ public/
│  ├─ logo/                   # Đặt logo.png (1024×1024) vào đây
│  └─ slides/                 # Đặt slide1.png … slide4.png cho hero banner
├─ scripts/
│  └─ make-admin.mjs          # Tạo / nâng quyền tài khoản admin
└─ .env.example               # Mẫu biến môi trường
```

---

## 🚀 Bắt đầu

### 1. Yêu cầu
- Node.js 18+ (khuyến nghị 20+)
- Tài khoản **MongoDB Atlas** và **Cloudinary**

### 2. Cài đặt
```bash
npm install
```

### 3. Cấu hình biến môi trường
```bash
cp .env.example .env.local
```
Mở `.env.local` và điền giá trị thật (xem bảng bên dưới).

### 4. Chạy
```bash
npm run dev      # http://localhost:3000
```
Lần truy cập đầu tiên sẽ tự kết nối DB, **seed admin mặc định** và in thông tin tài
khoản ra terminal.

### 5. Build production
```bash
npm run build
npm run start
```

---

## 🔐 Biến môi trường

| Biến | Bắt buộc | Mô tả |
|------|:--:|------|
| `MONGODB_URI` | ✅ | Chuỗi kết nối MongoDB Atlas. Nếu mạng chặn DNS SRV gây lỗi `querySrv ECONNREFUSED`, dùng dạng `mongodb://` chuẩn (trỏ thẳng các shard host). |
| `JWT_SECRET` | ✅ | Chuỗi bí mật ký cookie phiên đăng nhập. |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Tên cloud Cloudinary. |
| `CLOUDINARY_API_KEY` | ✅ | API key Cloudinary. |
| `CLOUDINARY_API_SECRET` | ✅ | API secret Cloudinary (chỉ dùng phía server). |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ⬜ | Upload preset (mặc định `ml_default`). |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ⬜ | Có thì dùng Google Maps; bỏ trống thì dùng OpenStreetMap. |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | ⬜ | Map ID cho Advanced Marker (mặc định `DEMO_MAP_ID`). |

---

## 👮 Tài khoản Admin

- Khi DB chưa có admin nào, hệ thống **tự tạo admin mặc định** (xem `lib/seed.ts`) và
  in email/mật khẩu ra terminal khi chạy lần đầu.
- Tự tạo / nâng quyền admin bất kỳ lúc nào bằng script:
  ```bash
  node scripts/make-admin.mjs <email> [mật-khẩu] ["Tên"]
  ```
  - Email đã tồn tại → đặt `role = admin`.
  - Email chưa có → tạo admin mới (cần truyền mật khẩu).
- Hoặc sửa tay trong MongoDB Atlas: collection `users` → đổi trường `role` thành `admin`.

> Sau khi đổi quyền, **đăng xuất rồi đăng nhập lại** để cookie phiên cập nhật.

---

## 🖼️ Ảnh giao diện (logo & banner)

- **Logo navbar**: bỏ file `public/logo/logo.png` (1024×1024) → tự hiển thị (chưa có thì
  dùng `favicon.ico`).
- **Hero banner**: bỏ `public/slides/slide1.png` … `slide4.png` → đổi từng slide (chưa có
  thì tự dùng ảnh Unsplash dự phòng).

Ảnh quán do admin tải lên đi thẳng lên **Cloudinary**, chỉ lưu URL trong MongoDB.

---

## 📜 Scripts

| Lệnh | Tác dụng |
|------|----------|
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | Kiểm tra ESLint |
| `node scripts/make-admin.mjs` | Tạo/nâng quyền admin |

---

## 🛡️ Ghi chú bảo mật
- Mọi Server Action đều kiểm tra phiên & quyền trước khi thao tác.
- Mật khẩu được hash bằng bcrypt; phiên đăng nhập dùng JWT trong cookie `httpOnly`.
- Nếu repo công khai: cân nhắc đưa mật khẩu admin mặc định trong `lib/seed.ts` ra biến
  môi trường thay vì để cứng trong code.
