import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAdCampaign extends Document {
  societyId: mongoose.Types.ObjectId;
  vendorName: string;
  title: string;
  description: string;
  imageUrl?: string;
  contactUrl?: string;
  bidAmount: number;
  status: 'Pending' | 'Active' | 'Rejected' | 'Expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdCampaignSchema: Schema<IAdCampaign> = new Schema({
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
  vendorName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String }, 
  contactUrl: { type: String }, 
  bidAmount: { type: Number, required: true }, 
  status: { type: String, enum: ['Pending', 'Active', 'Rejected', 'Expired'], default: 'Active' },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

AdCampaignSchema.index({ societyId: 1, status: 1 });
AdCampaignSchema.index({ societyId: 1, expiresAt: 1 });

const AdCampaign: Model<IAdCampaign> = mongoose.models.AdCampaign || mongoose.model<IAdCampaign>('AdCampaign', AdCampaignSchema);
export default AdCampaign;
