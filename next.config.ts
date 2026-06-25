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
  // Lưu ý: KHÔNG cần nâng `serverActions.bodySizeLimit` nữa. Ảnh được trình duyệt
  // upload thẳng lên Cloudinary (lib/cloudinaryClient.ts), Server Action chỉ nhận
  // lại mảng URL chữ (vài KB) nên không còn dính giới hạn ~4.5MB body của Vercel
  // (lỗi 413 "Payload Too Large").
};

export default nextConfig;
