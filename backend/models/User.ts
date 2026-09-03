import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'member' | 'superadmin' | 'security';
  phone?: string;
  isActive: boolean;
  mustChangePassword?: boolean;
  parkingSlot?: string;
  vehicleNumber?: string;
  profilePicture?: string;
  societyId?: mongoose.Types.ObjectId;
  flatDetails?: {
    wing?: string;
    floor?: number;
    flatNumber?: string;
    residentType: 'Owner' | 'Tenant' | 'Staff';
    moveInDate?: Date;
  };
  securityDetails?: {
    age?: number;
    address?: string;
    joinDate?: Date;
    leaveDate?: Date;
    status: 'Active' | 'Left';
    shift: 'Day' | 'Night' | 'Rotational';
  };
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String, required: true, trim: true, maxlength: [100, 'Name too long']
  },
  email: {
    type: String, required: true, unique: true, trim: true,
    lowercase: true, maxlength: [150, 'Email too long']
  },
  password: {
    type: String, required: true, minlength: 8
  },
  role: {
    type: String, enum: ['admin', 'member', 'superadmin', 'security'], default: 'member'
  },
  phone: { type: String, trim: true, maxlength: 15 },
  isActive: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: false },
  parkingSlot: { type: String, trim: true, maxlength: 20 },
  vehicleNumber: { type: String, trim: true, maxlength: 20 },
  profilePicture: { type: String }, 
  societyId: {
    type: Schema.Types.ObjectId, ref: 'Society'
  },
  flatDetails: {
    wing: { type: String, trim: true, maxlength: 10 },
    floor: { type: Number },
    flatNumber: { type: String, trim: true, maxlength: 20 },
    residentType: {
      type: String, enum: ['Owner', 'Tenant', 'Staff'], default: 'Owner'
    },
    moveInDate: { type: Date },
  },
  securityDetails: {
    age: { type: Number },
    address: { type: String, trim: true },
    joinDate: { type: Date },
    leaveDate: { type: Date },
    status: { type: String, enum: ['Active', 'Left'], default: 'Active' },
    shift: { type: String, enum: ['Day', 'Night', 'Rotational'], default: 'Day' }
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

UserSchema.pre(/^find/, function(this: any) {
  this.where({ deletedAt: null });
});

UserSchema.index({ societyId: 1, role: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
