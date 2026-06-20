import bcrypt from 'bcryptjs';
import User from '@/models/User';
import Cafe from '@/models/Cafe';

// Thông tin admin mặc định đọc từ biến môi trường (không để cứng trong code).
// Cấu hình trong .env.local: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME.
const DEFAULT_ADMIN = {
  name: process.env.SEED_ADMIN_NAME?.trim() || 'Admin',
  email: process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || '',
  password: process.env.SEED_ADMIN_PASSWORD || '',
};

const UNSPLASH = {
  cafe1: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop&auto=format',
  cafe2: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop&auto=format',
  cafe3: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop&auto=format',
  cafe4: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop&auto=format',
  cafe5: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop&auto=format',
  cafe6: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800&h=600&fit=crop&auto=format',
  interior1: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&h=600&fit=crop&auto=format',
  interior2: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop&auto=format',
  latte: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&h=600&fit=crop&auto=format',
  beans: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop&auto=format',
};

function sampleCafes(createdBy: string) {
  return [
    {
      name: 'Nha Trang Roasters',
      address: '88 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa',
      area: 'Nha Trang',
      description:
        'Nằm ngay sát bờ biển Nha Trang thơ mộng, Nha Trang Roasters mang đến cà phê đặc sản rang xay tại chỗ với hạt Arabica Đà Lạt và Robusta Buôn Ma Thuột.',
      images: [UNSPLASH.cafe1, UNSPLASH.interior1, UNSPLASH.latte, UNSPLASH.interior2],
      location: { lat: 12.2389, lng: 109.1967 },
      rating: 4.8,
      reviewCount: 156,
      tags: ['Cold Brew', 'Beach View', 'Workspace'],
      priceRange: '$$$',
      openHours: '07:00 AM - 10:30 PM',
      phone: '+84 123 456 789',
      website: 'nhatrangroasters.com',
      status: 'approved',
      createdBy,
    },
    {
      name: 'The Azure Brew',
      address: '45 Bạch Đằng, Vĩnh Hải, Nha Trang',
      area: 'Bắc Nha Trang',
      description:
        'Không gian mở tràn ngập ánh sáng tự nhiên với tầm nhìn panorama ra vịnh Nha Trang. Chuyên cold brew thủ công và single origin chất lượng cao.',
      images: [UNSPLASH.cafe2, UNSPLASH.interior2, UNSPLASH.beans],
      location: { lat: 12.26, lng: 109.19 },
      rating: 4.9,
      reviewCount: 243,
      tags: ['Coastal View', 'Cold Brew', 'Vegan Options'],
      priceRange: '$$$',
      openHours: '06:30 AM - 11:00 PM',
      phone: '+84 234 567 890',
      status: 'approved',
      createdBy,
    },
    {
      name: 'Station 85',
      address: '85 Nguyễn Thiện Thuật, Phước Tiến, Nha Trang',
      area: 'Nha Trang',
      description:
        'Thiết kế công nghiệp-chic với tường gạch mộc và máy espresso hiện đại. Điểm đến lý tưởng cho dân làm việc tự do với WiFi siêu nhanh.',
      images: [UNSPLASH.cafe3, UNSPLASH.interior1, UNSPLASH.beans],
      location: { lat: 12.245, lng: 109.192 },
      rating: 4.7,
      reviewCount: 189,
      tags: ['Work Friendly', 'Hand Drip', 'Fast WiFi'],
      priceRange: '$$',
      openHours: '07:00 AM - 10:00 PM',
      phone: '+84 345 678 901',
      status: 'approved',
      createdBy,
    },
    {
      name: 'The Secret Garden',
      address: '12 Hoàng Văn Thụ, Phước Long, Nha Trang',
      area: 'Tây Nha Trang',
      description:
        'Góc thiên nhiên ẩn mình trong lòng thành phố. Cây xanh bao quanh, tiếng chim hót và không khí yên tĩnh. Menu bánh ngọt tự làm rất đáng thử.',
      images: [UNSPLASH.cafe4, UNSPLASH.interior2, UNSPLASH.latte],
      location: { lat: 12.255, lng: 109.185 },
      rating: 4.8,
      reviewCount: 112,
      tags: ['Hidden Gem', 'Quiet Zone', 'Bakery'],
      priceRange: '$',
      openHours: '07:30 AM - 09:00 PM',
      phone: '+84 456 789 012',
      status: 'approved',
      createdBy,
    },
    {
      name: 'Horizon Specialty Coffee',
      address: '120 Trần Phú, Lộc Thọ, Nha Trang',
      area: 'Nha Trang',
      description:
        'Quán cà phê đặc sản hàng đầu Nha Trang với view biển tuyệt đẹp. Kiến trúc tối giản kết hợp kỹ thuật pha chế đỉnh cao.',
      images: [UNSPLASH.cafe5, UNSPLASH.interior1, UNSPLASH.beans, UNSPLASH.latte],
      location: { lat: 12.238, lng: 109.1975 },
      rating: 4.9,
      reviewCount: 240,
      tags: ['Ocean View', 'Pour Over', 'Award Winning'],
      priceRange: '$$$',
      openHours: '06:00 AM - 11:00 PM',
      phone: '+84 567 890 123',
      website: 'horizonspecialty.vn',
      status: 'approved',
      createdBy,
    },
    {
      name: 'Rainforest Cafe',
      address: '23 Lê Thánh Tôn, Vĩnh Nguyên, Nha Trang',
      area: 'Nam Nha Trang',
      description:
        'Một khu rừng nhiệt đới thu nhỏ giữa thành phố biển. Không gian xanh mát với thực vật nhiệt đới bao quanh và ánh sáng lọc qua tán lá.',
      images: [UNSPLASH.cafe6, UNSPLASH.interior2, UNSPLASH.latte],
      location: { lat: 12.248, lng: 109.194 },
      rating: 4.5,
      reviewCount: 87,
      tags: ['Garden', 'Quiet Zone', 'Specialty'],
      priceRange: '$$',
      openHours: '07:00 AM - 09:30 PM',
      phone: '+84 678 901 234',
      status: 'approved',
      createdBy,
    },
  ];
}

/**
 * Chạy một lần sau khi kết nối DB:
 *  - Tạo tài khoản Admin mặc định nếu chưa có admin nào.
 *  - Tạo tài khoản user demo nếu chưa tồn tại.
 *  - Seed một số quán mẫu nếu collection Cafe đang trống (để có dữ liệu test).
 */
export async function seedDatabase(): Promise<void> {
  const adminExists = await User.exists({ role: 'admin' });

  let adminId: string | undefined;

  if (!adminExists) {
    if (DEFAULT_ADMIN.email && DEFAULT_ADMIN.password) {
      const hashed = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      const admin = await User.create({
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        password: hashed,
        role: 'admin',
      });
      adminId = String(admin._id);

      console.log('\n========================================');
      console.log('🔐 ĐÃ TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH');
      console.log(`   Email:    ${DEFAULT_ADMIN.email}`);
      console.log(`   Password: ${DEFAULT_ADMIN.password}`);
      console.log('   (Đổi mật khẩu này khi triển khai production)');
      console.log('========================================\n');
    } else {
      console.warn(
        '⚠️ Chưa có admin và chưa cấu hình SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD trong .env.local.\n' +
        '   Bỏ qua tạo admin tự động. Tạo admin thủ công bằng:\n' +
        '   node scripts/make-admin.mjs <email> <mật-khẩu> "<Tên>"'
      );
    }
  } else {
    const admin = await User.findOne({ role: 'admin' }).select('_id').lean<{
      _id: import('mongoose').Types.ObjectId;
    }>();
    adminId = admin ? String(admin._id) : undefined;
  }

  // Seed quán mẫu nếu chưa có quán nào.
  const cafeCount = await Cafe.countDocuments();
  if (cafeCount === 0 && adminId) {
    await Cafe.insertMany(sampleCafes(adminId));
    console.log('🌱 Đã seed các quán cà phê mẫu vào database.');
  }
}
