// Các kiểu dữ liệu dùng chung cho toàn ứng dụng (plain object, an toàn để truyền
// từ Server Component xuống Client Component). Dữ liệu thật được lưu ở MongoDB và
// truy xuất qua `lib/data.ts`.

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  avatar?: string;
  bio?: string;
  joinedAt: string;
}

export interface Cafe {
  id: string;
  name: string;
  address: string;
  description: string;
  images: string[];
  location: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  tags: string[];
  district: string;
  priceRange: string;
  openHours: string;
  phone: string;
  website?: string;
  createdBy: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Review {
  id: string;
  cafeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}
