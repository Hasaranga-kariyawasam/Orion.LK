import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProductReview extends Document {
  productId: string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'Pending' | 'Approved';
  createdAt: Date;
  updatedAt: Date;
}

const ProductReviewSchema = new Schema<IProductReview>(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    customerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending', index: true },
  },
  { timestamps: true }
);

ProductReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const ProductReview: Model<IProductReview> =
  mongoose.models.ProductReview || mongoose.model<IProductReview>('ProductReview', ProductReviewSchema);

export default ProductReview;
