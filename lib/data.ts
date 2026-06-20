import mongoose from 'mongoose';
import dbConnect from './dbConnect';
import Cafe, { type CafeDoc, type CafeArea } from '@/models/Cafe';
import Review, { type ReviewDoc } from '@/models/Review';
import type { Cafe as CafeType, Review as ReviewType } from './mockData';

// Ảnh mặc định nếu một quán chưa có ảnh nào (đảm bảo UI dùng images[0] không vỡ).
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop&auto=format';

type LeanCafe = CafeDoc & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
};

type LeanReview = ReviewDoc & {
  _id: mongoose.Types.ObjectId;
  cafeId: mongoose.Types.ObjectId;
  createdAt?: Date;
};

function toISO(value?: Date): string {
  return value instanceof Date ? value.toISOString() : new Date().toISOString();
}

function serializeCafe(doc: LeanCafe): CafeType {
  return {
    id: String(doc._id),
    name: doc.name,
    address: doc.address,
    description: doc.description,
    images: doc.images && doc.images.length > 0 ? doc.images : [DEFAULT_IMAGE],
    location: {
      lat: doc.location?.lat ?? 12.2388,
      lng: doc.location?.lng ?? 109.1967,
    },
    rating: doc.rating ?? 0,
    reviewCount: doc.reviewCount ?? 0,
    tags: doc.tags ?? [],
    district: doc.area,
    priceRange: doc.priceRange ?? '$$',
    openHours: doc.openHours ?? '',
    phone: doc.phone ?? '',
    website: doc.website ?? undefined,
    createdBy: doc.createdBy,
    createdAt: toISO(doc.createdAt),
    status: doc.status as CafeType['status'],
  };
}

function serializeReview(doc: LeanReview): ReviewType {
  return {
    id: String(doc._id),
    cafeId: String(doc.cafeId),
    userId: doc.userId,
    userName: doc.userName,
    userAvatar: doc.userAvatar ?? undefined,
    rating: doc.rating,
    comment: doc.comment,
    createdAt: toISO(doc.createdAt),
  };
}

/* ----------------------------- Đọc dữ liệu quán ----------------------------- */

export async function getApprovedCafes(): Promise<CafeType[]> {
  await dbConnect();
  const docs = await Cafe.find({ status: 'approved' })
    .sort({ createdAt: -1 })
    .lean<LeanCafe[]>();
  return docs.map(serializeCafe);
}

export async function getPendingCafes(): Promise<CafeType[]> {
  await dbConnect();
  const docs = await Cafe.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .lean<LeanCafe[]>();
  return docs.map(serializeCafe);
}

export async function getAllCafes(): Promise<CafeType[]> {
  await dbConnect();
  const docs = await Cafe.find().sort({ createdAt: -1 }).lean<LeanCafe[]>();
  return docs.map(serializeCafe);
}

export async function getCafeById(id: string): Promise<CafeType | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await dbConnect();
  const doc = await Cafe.findById(id).lean<LeanCafe>();
  return doc ? serializeCafe(doc) : null;
}

export async function countCafes(): Promise<number> {
  await dbConnect();
  return Cafe.countDocuments();
}

/* --------------------------- Đọc dữ liệu đánh giá --------------------------- */

export async function getReviewsByCafeId(cafeId: string): Promise<ReviewType[]> {
  if (!mongoose.isValidObjectId(cafeId)) return [];
  await dbConnect();
  const docs = await Review.find({ cafeId })
    .sort({ createdAt: -1 })
    .lean<LeanReview[]>();
  return docs.map(serializeReview);
}

export async function getReviewsByUserId(userId: string): Promise<ReviewType[]> {
  await dbConnect();
  const docs = await Review.find({ userId })
    .sort({ createdAt: -1 })
    .lean<LeanReview[]>();
  return docs.map(serializeReview);
}

export async function getRecentReviews(limit = 5): Promise<ReviewType[]> {
  await dbConnect();
  const docs = await Review.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<LeanReview[]>();
  return docs.map(serializeReview);
}

export async function countReviews(): Promise<number> {
  await dbConnect();
  return Review.countDocuments();
}

/* ------------------------------ Ghi dữ liệu quán ----------------------------- */

export interface CreateCafeInput {
  name: string;
  address: string;
  area: string;
  description: string;
  images: string[];
  location: { lat: number; lng: number };
  tags: string[];
  priceRange: string;
  openHours: string;
  phone: string;
  createdBy: string;
  status?: CafeType['status'];
}

export async function createCafe(input: CreateCafeInput): Promise<CafeType> {
  await dbConnect();
  const { area, ...rest } = input;
  const doc = await Cafe.create({
    ...rest,
    area: area as CafeArea,
    status: input.status ?? 'approved',
  });
  return serializeCafe(doc.toObject() as LeanCafe);
}

export interface UpdateCafeInput {
  name?: string;
  address?: string;
  area?: string;
  description?: string;
  tags?: string[];
  priceRange?: string;
  openHours?: string;
  phone?: string;
  location?: { lat: number; lng: number };
  images?: string[];
}

export async function updateCafe(
  id: string,
  patch: UpdateCafeInput
): Promise<CafeType | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await dbConnect();
  const doc = await Cafe.findByIdAndUpdate(
    id,
    patch as mongoose.UpdateQuery<CafeDoc>,
    { new: true }
  ).lean<LeanCafe>();
  return doc ? serializeCafe(doc) : null;
}

export async function deleteCafe(id: string): Promise<boolean> {
  if (!mongoose.isValidObjectId(id)) return false;
  await dbConnect();
  const result = await Cafe.findByIdAndDelete(id);
  if (!result) return false;
  // Xoá luôn các đánh giá thuộc về quán đã bị gỡ.
  await Review.deleteMany({ cafeId: id });
  return true;
}

export async function approveCafe(id: string): Promise<void> {
  if (!mongoose.isValidObjectId(id)) return;
  await dbConnect();
  await Cafe.findByIdAndUpdate(id, { status: 'approved' });
}

/* ----------------------------- Ghi dữ liệu đánh giá -------------------------- */

export interface AddReviewInput {
  cafeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
}

export async function addReview(input: AddReviewInput): Promise<ReviewType> {
  await dbConnect();
  const doc = await Review.create(input);
  await recomputeCafeRating(input.cafeId);
  return serializeReview(doc.toObject() as LeanReview);
}

/**
 * Tính lại điểm rating trung bình + số lượng đánh giá của một quán dựa trên toàn
 * bộ bản ghi trong collection Review, rồi cập nhật vào document Cafe tương ứng.
 */
export async function recomputeCafeRating(cafeId: string): Promise<void> {
  if (!mongoose.isValidObjectId(cafeId)) return;
  const objectId = new mongoose.Types.ObjectId(cafeId);
  const [agg] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { cafeId: objectId } },
    { $group: { _id: '$cafeId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avg = agg?.avg ?? 0;
  const count = agg?.count ?? 0;
  await Cafe.findByIdAndUpdate(cafeId, {
    rating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
}
