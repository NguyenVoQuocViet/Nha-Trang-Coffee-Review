import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Để các package server-only này được nạp trực tiếp ở runtime thay vì bundle,
  // tránh lỗi khi Next biên dịch (mongoose dùng dynamic require nội bộ).
  serverExternalPackages: ['mongoose', 'bcryptjs', 'cloudinary'],
  // Đưa chỉ báo Next.js Dev Tools lên góc trên-trái để không đè nút "lên đầu trang"
  // (chỉ ảnh hưởng chế độ dev; production không có chỉ báo này).
  devIndicators: {
    position: 'top-left',
  },
  experimental: {
    serverActions: {
      // Mặc định body của Server Action chỉ 1MB -> upload nhiều ảnh sẽ vượt giới
      // hạn (lỗi 413 "Body exceeded ... limit") và trang gửi bài bị "chết" lặng lẽ.
      // Form cho phép tối đa 5 ảnh x 10MB = 50MB, nên nâng giới hạn lên có dư địa.
      // Lưu ý: kích thước/số lượng ảnh còn được chặn ở client (AddCafeClient.tsx)
      // bằng MAX_IMAGES / MAX_FILE_MB — hai nơi này phải khớp nhau.
      bodySizeLimit: '60mb',
    },
  },
};

export default nextConfig;
