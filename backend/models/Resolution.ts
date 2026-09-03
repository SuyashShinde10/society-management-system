import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IResolution extends Document {
  societyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'Finance' | 'Maintenance' | 'Rule Change' | 'Election' | 'General';
  quorumPercent: number; // e.g. 50%
  deadline: Date;
  options: {
    text: string;
    votesCount: number;
  }[];
  voters: {
    residentId: mongoose.Types.ObjectId;
    optionIndex: number;
    votedAt: Date;
  }[];
  status: 'Open' | 'Passed' | 'Rejected';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResolutionSchema = new Schema<IResolution>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Finance', 'Maintenance', 'Rule Change', 'Election', 'General'],
      default: 'General'
    },
    quorumPercent: { type: Number, default: 50, min: 1, max: 100 },
    deadline: { type: Date, required: true },
    options: [
      {
        text: { type: String, required: true },
        votesCount: { type: Number, default: 0 }
      }
    ],
    voters: [
      {
        residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        optionIndex: { type: Number, required: true },
        votedAt: { type: Date, default: Date.now }
      }
    ],
    status: { type: String, enum: ['Open', 'Passed', 'Rejected'], default: 'Open' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const Resolution: Model<IResolution> = mongoose.models.Resolution || mongoose.model<IResolution>('Resolution', ResolutionSchema);
export default Resolution;
