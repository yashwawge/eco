import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompostListing extends Document {
  seller: mongoose.Types.ObjectId;
  title: string;
  description: string;
  quantity: number;
  price: number;
  type: string;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
  };
  photos: string[];
  status: 'available' | 'sold';
  createdAt: Date;
}

const CompostListingSchema = new Schema<ICompostListing>({
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { type: String, default: 'vermicompost' },
  location: {
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String, required: true },
  },
  photos: [String],
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
});

const CompostListing: Model<ICompostListing> =
  mongoose.models.CompostListing || mongoose.model<ICompostListing>('CompostListing', CompostListingSchema);

export default CompostListing;
