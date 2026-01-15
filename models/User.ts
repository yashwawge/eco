import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'citizen' | 'municipal';
  phone: string;
  address: {
    street: string;
    area: string;
    city: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  ecoPoints: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'municipal'], required: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    area: String,
    city: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  ecoPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
