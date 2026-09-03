import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IVendorQuote extends Document {
  projectId: mongoose.Types.ObjectId;
  vendorName: string;
  vendorEmail: string;
  vendorPhone?: string;
  quoteAmount: number;
  timeline: string;
  notes?: string;
  status: 'Submitted' | 'Selected' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const VendorQuoteSchema: Schema<IVendorQuote> = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  vendorName: { type: String, required: true },
  vendorEmail: { type: String, required: true },
  vendorPhone: { type: String },
  quoteAmount: { type: Number, required: true },
  timeline: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Submitted', 'Selected', 'Rejected'], default: 'Submitted' },
}, { timestamps: true });

const VendorQuote: Model<IVendorQuote> = mongoose.models.VendorQuote || mongoose.model<IVendorQuote>('VendorQuote', VendorQuoteSchema);
export default VendorQuote;
