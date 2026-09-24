import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';


export interface IParcel extends Document {
  societyId: mongoose.Types.ObjectId;
  carrier: string;
  trackingNumber?: string;
  recipientId?: mongoose.Types.ObjectId;
  wing: string;
  flatNumber: string;
  claimOtp: string;
  status: 'At Gate' | 'Claimed';
  notes?: string;
  loggedBy?: mongoose.Types.ObjectId;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ParcelSchema = new Schema<IParcel>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    carrier: { type: String, required: true, trim: true },
    trackingNumber: { type: String, trim: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    wing: { type: String, required: true, trim: true },
    flatNumber: { type: String, required: true, trim: true },
    claimOtp: { type: String, required: true },
    status: { type: String, enum: ['At Gate', 'Claimed'], default: 'At Gate' },
    notes: { type: String, trim: true },
    loggedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    claimedAt: { type: Date }
  },
  { timestamps: true }
);

// Hash OTP before saving so plaintext is never stored in DB
ParcelSchema.pre('save', async function () {
  if (this.isModified('claimOtp') && this.claimOtp) {
    const salt = await bcrypt.genSalt(10);
    this.claimOtp = await bcrypt.hash(this.claimOtp, salt);
  }
});

ParcelSchema.index({ societyId: 1, status: 1 });
ParcelSchema.index({ societyId: 1, createdAt: -1 });

const Parcel: Model<IParcel> = mongoose.models.Parcel || mongoose.model<IParcel>('Parcel', ParcelSchema);
export default Parcel;
