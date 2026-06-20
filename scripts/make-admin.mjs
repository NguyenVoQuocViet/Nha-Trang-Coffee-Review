// Tạo mới hoặc nâng quyền một tài khoản lên admin.
//
// Cách dùng (chạy trong thư mục frontend):
//   node scripts/make-admin.mjs <email> [mật-khẩu] ["Tên hiển thị"]
//
// - Nếu email ĐÃ tồn tại  -> đặt role = admin (kèm đổi mật khẩu/tên nếu có truyền).
// - Nếu email CHƯA tồn tại -> tạo admin mới (bắt buộc truyền mật khẩu).
//
// Ví dụ:
//   node scripts/make-admin.mjs boss@gmail.com MatKhau123 "Sếp Tổng"
//   node scripts/make-admin.mjs nvqv123@gmail.com           (nâng quyền tài khoản đã có)

import pkg from '@next/env';
pkg.loadEnvConfig(process.cwd());

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const [, , rawEmail, password, ...nameParts] = process.argv;
const name = nameParts.join(' ').trim();

if (!rawEmail) {
  console.error('❌ Thiếu email.');
  console.error('   Cách dùng: node scripts/make-admin.mjs <email> [mật-khẩu] ["Tên"]');
  process.exit(1);
}

const email = rawEmail.toLowerCase().trim();

if (!process.env.MONGODB_URI) {
  console.error('❌ Không tìm thấy MONGODB_URI trong .env.local');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
  const users = mongoose.connection.db.collection('users');
  const existing = await users.findOne({ email });

  if (existing) {
    const update = { role: 'admin', updatedAt: new Date() };
    if (password) update.password = await bcrypt.hash(password, 10);
    if (name) update.name = name;
    await users.updateOne({ _id: existing._id }, { $set: update });
    console.log(`✅ Đã nâng quyền ADMIN cho tài khoản: ${email}`);
  } else {
    if (!password) {
      console.error('❌ Tài khoản chưa tồn tại nên cần truyền mật khẩu để tạo mới.');
      console.error('   Ví dụ: node scripts/make-admin.mjs ' + email + ' MatKhau123 "Tên"');
      process.exit(1);
    }
    const hashed = await bcrypt.hash(password, 10);
    await users.insertOne({
      name: name || 'Admin',
      email,
      password: hashed,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Đã tạo tài khoản ADMIN mới: ${email}`);
  }

  await mongoose.disconnect();
  console.log('   Hãy đăng xuất rồi đăng nhập lại để áp dụng.');
} catch (err) {
  console.error('❌ Lỗi:', err.message);
  process.exit(2);
}
