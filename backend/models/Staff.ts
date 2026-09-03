import mongoose, { Document, Schema, Model } from 'mongoose';


export interface IStaff extends Document {
  societyId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  role: 'Maid' | 'Cook' | 'Driver' | 'Gardener' | 'Electrician' | 'Plumber' | 'Other';
  policeVerified: boolean;
  photoUrl?: string;
  flatsAssigned: {
    residentId?: mongoose.Types.ObjectId;
    wing: string;
    flatNumber: string;
  }[];
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['Maid', 'Cook', 'Driver', 'Gardener', 'Electrician', 'Plumber', 'Other'],
      default: 'Maid'
    },
    policeVerified: { type: Boolean, default: false },
    photoUrl: { type: String, trim: true },
    flatsAssigned: [
      {
        residentId: { type: Schema.Types.ObjectId, ref: 'User' },
        wing: { type: String, required: true },
        flatNumber: { type: String, required: true }
      }
    ],
    rating: { type: Number, default: 5, min: 1, max: 5 },
    reviewsCount: { type: Number, default: 1 }
  },
  { timestamps: true }
);

const Staff: Model<IStaff> = mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);
export default Staff;
