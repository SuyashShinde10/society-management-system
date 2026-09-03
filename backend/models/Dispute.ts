import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDispute extends Document {
  maintenanceBillId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'Open' | 'Resolved' | 'Escalated';
  utrNumber?: string;
  chatHistory: Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema: Schema<IDispute> = new Schema({
  maintenanceBillId: { type: Schema.Types.ObjectId, ref: 'MaintenanceBill', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open', 'Resolved', 'Escalated'], default: 'Open' },
  utrNumber: { type: String },
  chatHistory: [
    {
      role: { type: String, enum: ['user', 'agent'] },
      content: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Dispute: Model<IDispute> = mongoose.models.Dispute || mongoose.model<IDispute>('Dispute', DisputeSchema);
export default Dispute;
