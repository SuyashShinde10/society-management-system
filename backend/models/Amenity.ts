import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAmenity extends Document {
  societyId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  capacity: number;
  slotDurationMinutes: number; // e.g. 60 min
  pricePerSlot: number; // 0 for free
  openTime: string; // e.g. "06:00"
  closeTime: string; // e.g. "22:00"
  rules?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AmenitySchema = new Schema<IAmenity>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    capacity: { type: Number, required: true, default: 10 },
    slotDurationMinutes: { type: Number, default: 60 },
    pricePerSlot: { type: Number, default: 0 },
    openTime: { type: String, default: '06:00' },
    closeTime: { type: String, default: '22:00' },
    rules: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Amenity: Model<IAmenity> = mongoose.models.Amenity || mongoose.model<IAmenity>('Amenity', AmenitySchema);
export default Amenity;
