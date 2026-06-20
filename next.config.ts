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
      // hạn (lỗi 413 "Body exceeded 1 MB limit"). Nâng lên cho phép gửi kèm ảnh.
      bodySizeLimit: '25mb',
    },
  },
};

export default nextConfig;
