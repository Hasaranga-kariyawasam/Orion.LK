import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  _id?: string;
  id?: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  street: string;
  city: string;
  district?: string;
  province?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface IUserCartItem {
  productId: string;
  quantity: number;
  product?: any;
}

export interface IPointsTransaction {
  amount: number;
  type: 'earned' | 'redeemed' | 'bonus' | 'refund';
  description: string;
  date: Date;
}

export interface IUserNotification {
  id: string;
  title: string;
  message: string;
  time: Date;
  isRead: boolean;
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
  points: number;       // loyalty points balance
  pointsHistory: IPointsTransaction[];
  notifications: IUserNotification[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: 'Home' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, default: '' },
  province: { type: String, default: '' },
  postalCode: { type: String, default: '' },
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

const PointsTransactionSchema = new Schema<IPointsTransaction>(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: ['earned', 'redeemed', 'bonus', 'refund'], required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const NotificationSchema = new Schema<IUserNotification>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
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
    points: { type: Number, default: 100, min: 0 },
    pointsHistory: {
      type: [PointsTransactionSchema],
      default: () => [
        {
          amount: 100,
          type: 'bonus',
          description: 'Welcome Bonus: 100 Orion Reward Points!',
          date: new Date(),
        },
      ],
    },
    notifications: { type: [NotificationSchema], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
