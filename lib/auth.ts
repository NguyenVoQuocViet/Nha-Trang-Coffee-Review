import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import dbConnect from './dbConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'coastal-roast-nha-trang-secret-2024';
const COOKIE_NAME = 'nthub_session';

export interface SessionPayload {
  userId: string;
  role: 'admin' | 'user';
  name: string;
  email: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export function createToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;

  await dbConnect();
  const user = await User.findById(session.userId)
    .select('name email role')
    .lean<{
      _id: import('mongoose').Types.ObjectId;
      name: string;
      email: string;
      role: 'admin' | 'user';
    }>();
  if (!user) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function setSession(payload: SessionPayload): Promise<void> {
  const cookieStore = await cookies();
  const token = createToken(payload);
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Kiểm tra email + mật khẩu với dữ liệu thật trong MongoDB (mật khẩu được hash
 * bằng bcrypt). Trả về thông tin người dùng nếu hợp lệ, ngược lại trả về null.
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<AuthUser | null> {
  await dbConnect();
  const user = await User.findOne({ email: email.toLowerCase().trim() }).lean<{
    _id: import('mongoose').Types.ObjectId;
    name: string;
    email: string;
    role: 'admin' | 'user';
    password: string;
  }>();
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export type RegisterResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

/**
 * Đăng ký người dùng mới: kiểm tra trùng email, hash mật khẩu rồi lưu vào DB.
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  await dbConnect();

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.exists({ email: normalizedEmail });
  if (existing) {
    return { ok: false, error: 'Email này đã được đăng ký.' };
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashed,
    role: 'user',
  });

  return {
    ok: true,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
