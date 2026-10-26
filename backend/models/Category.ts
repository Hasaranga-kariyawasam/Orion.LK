import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  productType?: 'pc' | 'laptop' | 'other';
  productTypeManual?: boolean;
  type: 'brand-new' | 'used';
  group?: 'components' | 'accessories' | 'used';
  count: number;
  img: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    productType: {
      type: String,
      enum: ['pc', 'laptop', 'other'],
    },
    productTypeManual: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['brand-new', 'used'],
      default: 'brand-new',
    },
    group: {
      type: String,
      enum: ['components', 'accessories', 'used'],
      default: 'components',
    },
    count: { type: Number, default: 0 },
    img: { type: String, default: '' },
  },
  { timestamps: true }
);

CategorySchema.index({ type: 1 });
CategorySchema.index({ group: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
