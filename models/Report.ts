import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  type: 'illegal_dumping' | 'missed_pickup' | 'poor_sanitation' | 'segregation_issue';
  description: string;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
  };
  photos: string[];
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  assignedTo?: string;
  completionPhoto?: string;
  priority: 'low' | 'medium' | 'high';
  ecoPointsAwarded: number;
  createdAt: Date;
  resolvedAt?: Date;
}

const ReportSchema = new Schema<IReport>({
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['illegal_dumping', 'missed_pickup', 'poor_sanitation', 'segregation_issue'],
    required: true,
  },
  description: { type: String, required: true },
  location: {
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String, required: true },
  },
  photos: [String],
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved'],
    default: 'pending',
  },
  assignedTo: String,
  completionPhoto: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  ecoPointsAwarded: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
});

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
