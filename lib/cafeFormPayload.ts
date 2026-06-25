// Kiểu dữ liệu gửi vào Server Action khi thêm/sửa quán.
//
// QUAN TRỌNG: payload này CHỈ chứa chữ và mảng URL ảnh (string[]) — TUYỆT ĐỐI
// không có đối tượng File nhị phân. Ảnh đã được trình duyệt upload thẳng lên
// Cloudinary (lib/cloudinaryClient.ts), ở đây chỉ truyền lại các secure_url.
// Nhờ vậy request body gửi tới Vercel chỉ vài KB, không bao giờ chạm giới hạn
// ~4.5MB (lỗi 413 Payload Too Large).
export type CafeFormPayload = {
  name: string;
  address: string;
  district: string;
  description: string;
  openHours: string;
  phone: string;
  priceRange: string;
  tags: string;
  lat: string;
  lng: string;
  imageUrls: string[];
};

export type CafeUpdatePayload = CafeFormPayload & { id: string };
