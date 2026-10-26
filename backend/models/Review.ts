import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  userId: string;
  productId: string;
  productName: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ userId: 1, orderNumber: 1, productId: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;