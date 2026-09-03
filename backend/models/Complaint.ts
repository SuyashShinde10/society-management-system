import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IComplaint extends Document {
  user: mongoose.Types.ObjectId;
  societyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Declined';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  attachment?: string;
  category: 'Water' | 'Electricity' | 'Lift' | 'Security' | 'Cleanliness' | 'Noise' | 'Parking' | 'Other';
  adminComment?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema<IComplaint> = new Schema({
  user: {
    type: Schema.Types.ObjectId, ref: 'User', required: true
  },
  societyId: {
    type: Schema.Types.ObjectId, ref: 'Society', required: true
  },
  title: {
    type: String, required: true, trim: true, maxlength: [200, 'Title too long']
  },
  description: {
    type: String, required: true, trim: true, maxlength: [2000, 'Description too long']
  },
  status: {
    type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Declined'], default: 'Pending'
  },
  priority: {
    type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Low'
  },
  attachment: {
    type: String,
    maxlength: [500, 'Attachment URL too long'],
  },
  category: {
    type: String,
    enum: ['Water', 'Electricity', 'Lift', 'Security', 'Cleanliness', 'Noise', 'Parking', 'Other'],
    default: 'Other'
  },
  adminComment: { type: String, trim: true, maxlength: [500, 'Comment too long'] },
  resolvedAt: { type: Date },
}, { timestamps: true });

ComplaintSchema.index({ societyId: 1, user: 1 });
ComplaintSchema.index({ societyId: 1, status: 1, createdAt: -1 });

const Complaint: Model<IComplaint> = mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
export default Complaint;
