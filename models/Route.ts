import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoute extends Document {
  name: string;
  startLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  endLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  waypoints: Array<{
    lat: number;
    lng: number;
  }>;
  assignedVehicle: mongoose.Types.ObjectId | string | null; // Vehicle ID
  totalDistance: number; // in km
  estimatedDuration: number; // in minutes
  status: 'active' | 'completed' | 'pending';
  optimized: boolean;
  createdAt: Date;
}

const RouteSchema = new Schema<IRoute>({
  name: { type: String, required: true },
  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  endLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  waypoints: [{
    lat: Number,
    lng: Number,
  }],
  assignedVehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  totalDistance: { type: Number, required: true },
  estimatedDuration: { type: Number, required: true },
  status: { type: String, enum: ['active', 'completed', 'pending'], default: 'pending' },
  optimized: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Route: Model<IRoute> = mongoose.models.Route || mongoose.model<IRoute>('Route', RouteSchema);

export default Route;
