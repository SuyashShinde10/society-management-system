import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMaintenanceBill extends Document {
  societyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  isPaid: boolean;
  status: 'Pending' | 'Under Verification' | 'Paid';
  paidOn?: Date;
  paymentMode?: string;
  dueDate?: Date;
  lateFee: number;
  notes?: string;
  aiDisputeStatus: 'None' | 'In-Progress' | 'Resolved';
  markedPaidBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceBillSchema: Schema<IMaintenanceBill> = new Schema({
  societyId: {
    type: Schema.Types.ObjectId, ref: 'Society', required: true
  },
  userId: {
    type: Schema.Types.ObjectId, ref: 'User', required: true
  },

  title: { type: String, required: true },
  description: { type: String },

  amount: { type: Number, required: true, min: 0 },
  isPaid: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Under Verification', 'Paid'], default: 'Pending' },
  paidOn: { type: Date },
  paymentMode: {
    type: String, trim: true
  },

  dueDate: { type: Date },
  lateFee: { type: Number, default: 0 },
  notes: { type: String, trim: true, maxlength: 300 },

  // AI Dispute Feature
  aiDisputeStatus: { type: String, enum: ['None', 'In-Progress', 'Resolved'], default: 'None' },

  // Who marked it as paid
  markedPaidBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

MaintenanceBillSchema.index({ societyId: 1, userId: 1 });
MaintenanceBillSchema.index({ societyId: 1, status: 1 });
MaintenanceBillSchema.index({ societyId: 1, isPaid: 1, paidOn: -1 });
MaintenanceBillSchema.index({ societyId: 1, _id: -1 });

const MaintenanceBill: Model<IMaintenanceBill> = mongoose.models.MaintenanceBill || mongoose.model<IMaintenanceBill>('MaintenanceBill', MaintenanceBillSchema);
export default MaintenanceBill;
