import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISecurityStaff extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'security';
  societyId: mongoose.Types.ObjectId;
  phone?: string;
  age?: number;
  address?: string;
  shift: 'Day' | 'Night' | 'Rotational';
  status: 'Active' | 'Left';
  joinDate: Date;
  leaveDate?: Date;
  mustChangePassword?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SecurityStaffSchema: Schema<ISecurityStaff> = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'security' },
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
  phone: { type: String, trim: true },
  age: { type: Number },
  address: { type: String, trim: true },
  shift: { type: String, enum: ['Day', 'Night', 'Rotational'], default: 'Day' },
  status: { type: String, enum: ['Active', 'Left'], default: 'Active' },
  joinDate: { type: Date, default: Date.now },
  leaveDate: { type: Date },
  mustChangePassword: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const SecurityStaff: Model<ISecurityStaff> = mongoose.models.SecurityStaff || mongoose.model<ISecurityStaff>('SecurityStaff', SecurityStaffSchema);
export default SecurityStaff;
