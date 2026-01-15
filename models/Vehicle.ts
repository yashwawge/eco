import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVehicle extends Document {
  vehicleNumber: string;
  type: 'garbage_truck' | 'compactor';
  driver: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  route: mongoose.Types.ObjectId | string | null;
  status: 'active' | 'inactive' | 'maintenance';
  scheduledAreas: string[];
  lastUpdated: Date;
}

const VehicleSchema = new Schema<IVehicle>({
  vehicleNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['garbage_truck', 'compactor'], required: true },
  driver: { type: String, required: true },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  route: { type: Schema.Types.ObjectId, ref: 'Route', default: null },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  scheduledAreas: [String],
  lastUpdated: { type: Date, default: Date.now },
});

const Vehicle: Model<IVehicle> = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);

export default Vehicle;
