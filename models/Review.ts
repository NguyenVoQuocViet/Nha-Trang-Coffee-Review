import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const reviewSchema = new Schema(
  {
    cafeId: { type: Schema.Types.ObjectId, ref: 'Cafe', required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export type ReviewDoc = InferSchemaType<typeof reviewSchema>;

const Review: Model<ReviewDoc> =
  (mongoose.models.Review as Model<ReviewDoc>) ||
  mongoose.model<ReviewDoc>('Review', reviewSchema);

export default Review;
