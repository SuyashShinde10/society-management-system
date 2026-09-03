import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISinkingFund extends Document {
  societyId: mongoose.Types.ObjectId;
  bankName: string;
  fdNumber: string;
  principalAmount: number;
  interestRate: number; // percentage e.g. 7.25
  tenureMonths: number;
  startDate: Date;
  maturityDate: Date;
  maturityAmount: number;
  purpose: 'Lift Replacement' | 'Building Painting' | 'Roof Waterproofing' | 'General Reserve' | 'Security Infrastructure';
  status: 'Active' | 'Matured' | 'Liquidated';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SinkingFundSchema = new Schema<ISinkingFund>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    bankName: { type: String, required: true, trim: true },
    fdNumber: { type: String, required: true, trim: true },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
    maturityDate: { type: Date, required: true },
    maturityAmount: { type: Number, required: true },
    purpose: {
      type: String,
      enum: ['Lift Replacement', 'Building Painting', 'Roof Waterproofing', 'General Reserve', 'Security Infrastructure'],
      default: 'General Reserve'
    },
    status: { type: String, enum: ['Active', 'Matured', 'Liquidated'], default: 'Active' },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

const SinkingFund: Model<ISinkingFund> = mongoose.models.SinkingFund || mongoose.model<ISinkingFund>('SinkingFund', SinkingFundSchema);
export default SinkingFund;
