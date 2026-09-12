import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  label: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface IUserCartItem {
  productId: string;
  quantity: number;
  product?: any;
}

export interface IUser extends Document {
  uid: string;          // Firebase UID
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: IAddress[];
  wishlist: string[];   // array of product IDs
  cart: IUserCartItem[]; // array of cart items
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: 'Home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const CartItemSchema = new Schema<IUserCartItem>(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    product: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    avatar: { type: String },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: { type: [String], default: [] },
    cart: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
