import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IGuestPass extends Document {
  societyId: mongoose.Types.ObjectId;
  residentId: mongoose.Types.ObjectId;
  guestName: string;
  guestPhone: string;
  purpose: string;
  passCode: string; // 6-digit numeric pass code (bcrypt hashed in DB)
  validDate: Date;
  status: 'Active' | 'Used' | 'Expired';
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GuestPassSchema = new Schema<IGuestPass>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    guestName: { type: String, required: true, trim: true },
    guestPhone: { type: String, required: true, trim: true },
    purpose: { type: String, default: 'Guest', trim: true },
    passCode: { type: String, required: true, index: true },
    validDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Used', 'Expired'], default: 'Active' },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Hash passCode before saving so plaintext 6-digit PIN is never stored in DB
GuestPassSchema.pre('save', async function () {
  if (this.isModified('passCode') && this.passCode) {
    if (!this.passCode.startsWith('$2a$') && !this.passCode.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.passCode = await bcrypt.hash(this.passCode, salt);
    }
  }
});

const GuestPass: Model<IGuestPass> = mongoose.models.GuestPass || mongoose.model<IGuestPass>('GuestPass', GuestPassSchema);
export default GuestPass;

