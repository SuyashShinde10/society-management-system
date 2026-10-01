import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  attempts: number;
  isVerified?: boolean;
  createdAt: Date;
}

const OtpSchema: Schema<IOtp> = new Schema({
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 600 } 
});

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
export default Otp;
