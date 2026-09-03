import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy?: mongoose.Types.ObjectId;
  targetId?: mongoose.Types.ObjectId;
  targetModel?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  status: 'Success' | 'Failed' | 'Suspicious';
  createdAt: Date;
  updatedAt: Date;
}

const auditSchema: Schema<IAuditLog> = new Schema({
  action: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  targetId: { type: Schema.Types.ObjectId },
  targetModel: { type: String }, 
  details: { type: Object },
  ipAddress: { type: String },
  status: { type: String, enum: ['Success', 'Failed', 'Suspicious'], default: 'Success' }
}, { timestamps: true });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditSchema);
export default AuditLog;
