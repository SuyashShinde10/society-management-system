import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISustainability extends Document {
  societyId: mongoose.Types.ObjectId;
  tanks: {
    name: string;
    capacityLiters: number;
    currentLevelPercent: number; // 0 - 100
    status: 'Normal' | 'Low' | 'Critical';
    lastUpdated: Date;
  }[];
  tankerDeliveries: {
    date: Date;
    vendor: string;
    capacityLiters: number;
    cost: number;
  }[];
  evStations: {
    stationId: string;
    name: string;
    status: 'Available' | 'Occupied' | 'Offline';
    ratePerKwh: number;
    totalKwhDelivered: number;
    sessions: {
      residentId: mongoose.Types.ObjectId;
      flatNumber: string;
      startTime: Date;
      endTime?: Date;
      kwhConsumed: number;
      cost: number;
      addedToMaintenance: boolean;
    }[];
  }[];
  solarMetrics: {
    date: Date;
    generationKwh: number;
    gridExportKwh: number;
    selfConsumptionKwh: number;
    savingsAmount: number;
    co2OffsetKg: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SustainabilitySchema = new Schema<ISustainability>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, unique: true, index: true },
    tanks: [
      {
        name: { type: String, required: true },
        capacityLiters: { type: Number, required: true },
        currentLevelPercent: { type: Number, default: 75 },
        status: { type: String, enum: ['Normal', 'Low', 'Critical'], default: 'Normal' },
        lastUpdated: { type: Date, default: Date.now }
      }
    ],
    tankerDeliveries: [
      {
        date: { type: Date, default: Date.now },
        vendor: { type: String, required: true },
        capacityLiters: { type: Number, required: true },
        cost: { type: Number, required: true }
      }
    ],
    evStations: [
      {
        stationId: { type: String, required: true },
        name: { type: String, required: true },
        status: { type: String, enum: ['Available', 'Occupied', 'Offline'], default: 'Available' },
        ratePerKwh: { type: Number, default: 12 },
        totalKwhDelivered: { type: Number, default: 0 },
        sessions: [
          {
            residentId: { type: Schema.Types.ObjectId, ref: 'User' },
            flatNumber: { type: String, required: true },
            startTime: { type: Date, default: Date.now },
            endTime: { type: Date },
            kwhConsumed: { type: Number, default: 0 },
            cost: { type: Number, default: 0 },
            addedToMaintenance: { type: Boolean, default: false }
          }
        ]
      }
    ],
    solarMetrics: [
      {
        date: { type: Date, default: Date.now },
        generationKwh: { type: Number, default: 0 },
        gridExportKwh: { type: Number, default: 0 },
        selfConsumptionKwh: { type: Number, default: 0 },
        savingsAmount: { type: Number, default: 0 },
        co2OffsetKg: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

const Sustainability: Model<ISustainability> = mongoose.models.Sustainability || mongoose.model<ISustainability>('Sustainability', SustainabilitySchema);
export default Sustainability;
