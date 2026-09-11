import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  isNewProduct?: boolean;
  discount?: number;
  status?: string;
  shortDescription?: string;
  description?: string;
  sku?: string;
  brand?: string;
  tags?: string[];
  hashtags?: string[];
  specifications?: Record<string, string>;
  stock: number;
  warranty?: string;
  colors?: string[];
  descriptionShipping?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    image: { type: String, required: true },
    images: [{ type: String }],
    isNewProduct: { type: Boolean, default: false },
    discount: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Delivered', 'In Stock', 'Out of Stock', 'Sold Out'],
      default: 'In Stock',
    },
    shortDescription: { type: String },
    description: { type: String },
    sku: { type: String, unique: true, sparse: true },
    brand: { type: String },
    tags: [{ type: String }],
    hashtags: [{ type: String }],
    specifications: { type: Map, of: String },
    stock: { type: Number, default: 0 },
    warranty: { type: String, default: '6 Months' },
    colors: [{ type: String }],
    descriptionShipping: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.virtual('isNew').get(function (this: IProduct) {
  return this.isNewProduct;
});

ProductSchema.index({ name: 'text', description: 'text', brand: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
