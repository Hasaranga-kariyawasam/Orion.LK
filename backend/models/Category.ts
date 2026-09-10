import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: 'brand-new' | 'used';
  count: number;
  img: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    type: {
      type: String,
      enum: ['brand-new', 'used'],
      default: 'brand-new',
    },
    count: { type: Number, default: 0 },
    img: { type: String, default: '' },
  },
  { timestamps: true }
);

CategorySchema.index({ type: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
