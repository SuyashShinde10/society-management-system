import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IParkingSpace extends Document {
  societyId: mongoose.Types.ObjectId;
  spaceNumber: string;
  allocatedTo?: mongoose.Types.ObjectId;
  geoJSON: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  vehicleNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParkingSpaceSchema: Schema<IParkingSpace> = new Schema({
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
  spaceNumber: { type: String, required: true },
  allocatedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  geoJSON: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  vehicleNumber: { type: String }
}, { timestamps: true });

ParkingSpaceSchema.index({ geoJSON: '2dsphere' });

const ParkingSpace: Model<IParkingSpace> = mongoose.models.ParkingSpace || mongoose.model<IParkingSpace>('ParkingSpace', ParkingSpaceSchema);
export default ParkingSpace;
