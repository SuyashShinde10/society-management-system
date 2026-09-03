import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEscrowAccount extends Document {
  projectId: mongoose.Types.ObjectId;
  vendorQuoteId: mongoose.Types.ObjectId;
  societyId: mongoose.Types.ObjectId;
  amount: number;
  geofenceVerified: boolean;
  geofenceVerifiedAt?: Date;
  residentVerified: boolean;
  residentVerifiedAt?: Date;
  residentId?: mongoose.Types.ObjectId;
  status: 'Held' | 'Released' | 'Disputed';
  createdAt: Date;
  updatedAt: Date;
}

const EscrowAccountSchema: Schema<IEscrowAccount> = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  vendorQuoteId: { type: Schema.Types.ObjectId, ref: 'VendorQuote', required: true },
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
  amount: { type: Number, required: true },
  
  geofenceVerified: { type: Boolean, default: false },
  geofenceVerifiedAt: { type: Date },
  
  residentVerified: { type: Boolean, default: false },
  residentVerifiedAt: { type: Date },
  residentId: { type: Schema.Types.ObjectId, ref: 'User' },

  status: { type: String, enum: ['Held', 'Released', 'Disputed'], default: 'Held' }
}, { timestamps: true });

const EscrowAccount: Model<IEscrowAccount> = mongoose.models.EscrowAccount || mongoose.model<IEscrowAccount>('EscrowAccount', EscrowAccountSchema);
export default EscrowAccount;
