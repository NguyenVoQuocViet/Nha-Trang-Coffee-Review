import dns from 'node:dns';
import mongoose from 'mongoose';
import { seedDatabase } from './seed';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Thiếu biến môi trường MONGODB_URI. Vui lòng khai báo trong file .env.local'
  );
}

/**
 * Khắc phục lỗi `querySrv ECONNREFUSED` khi dùng chuỗi mongodb+srv://.
 * Trên một số máy Windows / mạng có VPN, Node (c-ares) chọn nhầm DNS server bị
 * từ chối kết nối nên không tra cứu được SRV record của Atlas. Ta ép Node dùng
 * các DNS công cộng đáng tin cậy (Google / Cloudflare) cho việc phân giải tên.
 */
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Một số môi trường không cho phép đổi DNS server — bỏ qua an toàn.
}

/**
 * Next.js (đặc biệt ở chế độ dev và serverless) tạo lại module nhiều lần khi
 * re-render, nên ta cache kết nối Mongoose vào biến global để tránh mở quá nhiều
 * connection trùng lặp tới MongoDB Atlas.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global._mongooseCache ?? { conn: null, promise: null, seeded: false };

global._mongooseCache = cached;

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string, {
        bufferCommands: false,
      })
      .then((m) => {
        console.log('✅ Đã kết nối MongoDB Atlas thành công.');
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ Lỗi kết nối MongoDB:', error);
    throw error;
  }

  // Chạy seeding một lần sau khi có kết nối đầu tiên.
  if (!cached.seeded) {
    cached.seeded = true;
    try {
      await seedDatabase();
    } catch (error) {
      console.error('⚠️ Lỗi khi seed dữ liệu khởi tạo:', error);
    }
  }

  return cached.conn;
}
