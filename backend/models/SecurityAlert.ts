import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISecurityAlert extends Document {
  ipAddress: string;
  emailAttempted?: string;
  reason?: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema: Schema<ISecurityAlert> = new Schema({
  ipAddress: { type: String, required: true },
  emailAttempted: { type: String },
  reason: { type: String }, 
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

const SecurityAlert: Model<ISecurityAlert> = mongoose.models.SecurityAlert || mongoose.model<ISecurityAlert>('SecurityAlert', alertSchema);
export default SecurityAlert;
