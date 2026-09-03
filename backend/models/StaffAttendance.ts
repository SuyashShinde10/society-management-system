import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IStaffAttendance extends Document {
  societyId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  entryTime: Date;
  exitTime?: Date;
  status: 'Inside' | 'Exited';
  loggedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StaffAttendanceSchema = new Schema<IStaffAttendance>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date },
    status: { type: String, enum: ['Inside', 'Exited'], default: 'Inside' },
    loggedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const StaffAttendance: Model<IStaffAttendance> = mongoose.models.StaffAttendance || mongoose.model<IStaffAttendance>('StaffAttendance', StaffAttendanceSchema);
export default StaffAttendance;
