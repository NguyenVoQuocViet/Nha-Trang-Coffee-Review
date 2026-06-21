import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const replySchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const reviewSchema = new Schema(
  {
    cafeId: { type: Schema.Types.ObjectId, ref: 'Cafe', required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    // Danh sách userId đã bấm "Hữu ích" (dùng để đếm và bật/tắt theo người dùng).
    helpfulUserIds: { type: [String], default: [] },
    // Phản hồi lồng dưới mỗi đánh giá.
    replies: { type: [replySchema], default: [] },
  },
  { timestamps: true }
);

export type ReviewDoc = InferSchemaType<typeof reviewSchema>;

const Review: Model<ReviewDoc> =
  (mongoose.models.Review as Model<ReviewDoc>) ||
  mongoose.model<ReviewDoc>('Review', reviewSchema);

export default Review;
