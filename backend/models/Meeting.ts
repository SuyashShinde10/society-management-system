import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  societyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  targetType: 'All' | 'Specific';
  targetUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema: Schema<IMeeting> = new Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Meeting description is required'],
  },
  date: {
    type: Date,
    required: [true, 'Meeting date is required'],
  },
  location: {
    type: String,
    required: [true, 'Location or Link is required'],
  },
  societyId: {
    type: Schema.Types.ObjectId,
    ref: 'Society',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: { type: String, enum: ['All', 'Specific'], default: 'All' },
  targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

MeetingSchema.index({ societyId: 1, date: -1 });

const Meeting: Model<IMeeting> = mongoose.models.Meeting || mongoose.model<IMeeting>('Meeting', MeetingSchema);
export default Meeting;
