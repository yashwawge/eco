import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchedule extends Document {
  area: string;
  vehicleId: mongoose.Types.ObjectId;
  scheduledTime: Date;
  estimatedArrival: Date;
  wasteType: 'wet' | 'dry' | 'mixed';
  status: 'scheduled' | 'in_transit' | 'completed' | 'missed';
  notificationsSent: boolean;
  completedAt?: Date;
}

const ScheduleSchema = new Schema<ISchedule>({
  area: { type: String, required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  scheduledTime: { type: Date, required: true },
  estimatedArrival: { type: Date, required: true },
  wasteType: { type: String, enum: ['wet', 'dry', 'mixed'], required: true },
  status: {
    type: String,
    enum: ['scheduled', 'in_transit', 'completed', 'missed'],
    default: 'scheduled',
  },
  notificationsSent: { type: Boolean, default: false },
  completedAt: Date,
});

const Schedule: Model<ISchedule> = mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule;
