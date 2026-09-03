import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IVisitor extends Document {
  name: string;
  phone: string;
  purpose: string;
  wing?: string;
  flatNumber?: string;
  societyId: mongoose.Types.ObjectId;
  enteredBy?: mongoose.Types.ObjectId;
  status: 'Inside' | 'CheckedOut';
  checkInTime: Date;
  checkOutTime?: Date;
  photo?: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema: Schema<IVisitor> = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, maxlength: 15 },
  purpose: { type: String, required: true },
  wing: { type: String, trim: true },
  flatNumber: { type: String, trim: true },
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
  enteredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Inside', 'CheckedOut'], default: 'Inside' },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  photo: { type: String },
  signature: { type: String }
}, { timestamps: true });

VisitorSchema.index({ societyId: 1, status: 1 });
VisitorSchema.index({ societyId: 1, checkInTime: -1 });
VisitorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

const Visitor: Model<IVisitor> = mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);
export default Visitor;
