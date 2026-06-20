import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

export const NHA_TRANG_AREAS = [
  'Nha Trang',
  'Nam Nha Trang',
  'Bắc Nha Trang',
  'Tây Nha Trang',
] as const;

export type CafeArea = (typeof NHA_TRANG_AREAS)[number];

const cafeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    area: {
      type: String,
      enum: NHA_TRANG_AREAS,
      required: true,
    },
    description: { type: String, required: true },
    // Mảng các URL tuyệt đối (secure_url) trả về từ Cloudinary.
    images: { type: [String], default: [] },
    location: {
      lat: { type: Number, default: 12.2388 },
      lng: { type: Number, default: 109.1967 },
    },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    priceRange: { type: String, default: '$$' },
    openHours: { type: String, default: '07:00 AM - 10:00 PM' },
    phone: { type: String, default: '' },
    website: { type: String },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'pending',
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, collection: 'cafes' }
);

export type CafeDoc = InferSchemaType<typeof cafeSchema>;

const Cafe: Model<CafeDoc> =
  (mongoose.models.Cafe as Model<CafeDoc>) ||
  mongoose.model<CafeDoc>('Cafe', cafeSchema);

export default Cafe;
