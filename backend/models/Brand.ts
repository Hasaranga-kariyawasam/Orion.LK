import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  image: string;
  banner?: string;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    image: { type: String, default: '' },
    banner: { type: String, default: '' },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
