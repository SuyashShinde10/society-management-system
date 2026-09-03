import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAmenityBooking extends Document {
  societyId: mongoose.Types.ObjectId;
  amenityId: mongoose.Types.ObjectId;
  residentId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  slotTime: string; // e.g. "07:00 - 08:00"
  numberOfPeople: number;
  totalAmount: number;
  status: 'Confirmed' | 'Cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AmenityBookingSchema = new Schema<IAmenityBooking>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    amenityId: { type: Schema.Types.ObjectId, ref: 'Amenity', required: true, index: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    slotTime: { type: String, required: true },
    numberOfPeople: { type: Number, default: 1 },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

AmenityBookingSchema.index({ amenityId: 1, date: 1, slotTime: 1 });

const AmenityBooking: Model<IAmenityBooking> = mongoose.models.AmenityBooking || mongoose.model<IAmenityBooking>('AmenityBooking', AmenityBookingSchema);
export default AmenityBooking;
