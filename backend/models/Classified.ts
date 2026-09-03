import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IClassified extends Document {
  societyId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  category: 'Sell' | 'Rent' | 'Carpool' | 'Services';
  title: string;
  description: string;
  price?: number;
  contactPhone: string;
  images?: string[];
  carpool?: {
    origin: string;
    destination: string;
    departureTime: string;
    seatsAvailable: number;
    days: string[];
  };
  status: 'Active' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const ClassifiedSchema = new Schema<IClassified>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['Sell', 'Rent', 'Carpool', 'Services'],
      required: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },
    contactPhone: { type: String, required: true, trim: true },
    images: [{ type: String }],
    carpool: {
      origin: { type: String },
      destination: { type: String },
      departureTime: { type: String },
      seatsAvailable: { type: Number, default: 1 },
      days: [{ type: String }]
    },
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' }
  },
  { timestamps: true }
);

const Classified: Model<IClassified> = mongoose.models.Classified || mongoose.model<IClassified>('Classified', ClassifiedSchema);
export default Classified;
