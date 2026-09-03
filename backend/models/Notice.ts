import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  societyId: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  priority: 'Normal' | 'Important' | 'Urgent';
  isPinned: boolean;
  expiryDate?: Date;
  targetWing: string;
  targetType: 'All' | 'Specific';
  targetUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema: Schema<INotice> = new Schema({
  title: {
    type: String, required: true, trim: true, maxlength: [200, 'Title too long']
  },
  content: {
    type: String, required: true, trim: true, maxlength: [5000, 'Content too long']
  },
  societyId: {
    type: Schema.Types.ObjectId, ref: 'Society', required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  priority: {
    type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal'
  },
  isPinned: { type: Boolean, default: false },
  expiryDate: { type: Date },
  targetWing: { type: String, default: 'All' },
  targetType: { type: String, enum: ['All', 'Specific'], default: 'All' },
  targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

NoticeSchema.index({ societyId: 1, isPinned: -1, createdAt: -1 });

const Notice: Model<INotice> = mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
export default Notice;
