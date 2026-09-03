import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISociety extends Document {
  name: string;
  address: string;
  regNumber: string;
  wings: string[];
  floors: number;

  city?: string;
  state?: string;
  pincode?: string;
  contactEmail?: string;
  contactPhone?: string;
  maintenanceAmount: number;
  amenities: string[];
  geoJSON: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  logo?: string;
  themeConfig: {
    accentColor: string;
    bg: string;
  };

  createdBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  planType: 'Trial' | 'Pro' | 'Premium';
  planExpiry: Date;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const societySchema: Schema<ISociety> = new Schema({
  name: {
    type: String, required: true, trim: true, maxlength: [200, 'Society name too long']
  },
  address: {
    type: String, required: true, trim: true, maxlength: [500, 'Address too long']
  },
  regNumber: {
    type: String, required: true, unique: true, trim: true, maxlength: [50, 'Reg number too long']
  },

  wings: [{ type: String, trim: true }],
  floors: { type: Number, required: true, min: 0, max: 200 },

  city: { type: String, trim: true, maxlength: 100 },
  state: { type: String, trim: true, maxlength: 100 },
  pincode: { type: String, trim: true, maxlength: 10 },
  contactEmail: { type: String, trim: true, lowercase: true },
  contactPhone: { type: String, trim: true },
  maintenanceAmount: { type: Number, default: 0, min: 0 },
  amenities: [{ type: String, trim: true }],
  geoJSON: {
    type: { type: String, enum: ['Polygon'], default: 'Polygon' },
    coordinates: { type: [[[Number]]], default: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] }
  },
  logo: { type: String },
  themeConfig: {
    accentColor: { type: String, default: '#D9734E' },
    bg: { type: String, default: '#F9F8F3' }
  },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  planType: { type: String, enum: ['Trial', 'Pro', 'Premium'], default: 'Trial' },
  planExpiry: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

societySchema.pre(/^find/, function(this: any) {
  this.where({ deletedAt: null });
});

const Society: Model<ISociety> = mongoose.models.Society || mongoose.model<ISociety>('Society', societySchema);
export default Society;
