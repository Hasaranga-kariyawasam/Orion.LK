import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  label: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  uid: string;          // Firebase UID
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: IAddress[];
  wishlist: string[];   // array of product IDs
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

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    avatar: { type: String },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
