import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHomeSettings extends Document {
  key: string;
  heroImages: string[];
  featuredImages: unknown[];
  pcBuildCards: unknown[];
  homePromoCards: unknown[];
  accessories: unknown[];
  bestSellerIds: string[];
  whatsappNumber: string;
  storeAddress: string;
  specialOffers: unknown[];
  specialOffersDeadline: string;
  updatedAt: Date;
}

const HomeSettingsSchema = new Schema<IHomeSettings>(
  {
    key: { type: String, unique: true, default: 'default' },
    heroImages: { type: [String], default: [] },
    featuredImages: { type: [Schema.Types.Mixed], default: [] },
    pcBuildCards: { type: [Schema.Types.Mixed], default: [] },
    homePromoCards: { type: [Schema.Types.Mixed], default: [] },
    accessories: { type: [Schema.Types.Mixed], default: [] },
    bestSellerIds: { type: [String], default: [] },
    whatsappNumber: { type: String, default: '' },
    storeAddress: { type: String, default: '' },
    specialOffers: { type: [Schema.Types.Mixed], default: [] },
    specialOffersDeadline: { type: String, default: '' },
  },
  { timestamps: true }
);

const HomeSettings: Model<IHomeSettings> =
  mongoose.models.HomeSettings || mongoose.model<IHomeSettings>('HomeSettings', HomeSettingsSchema);

export default HomeSettings;
