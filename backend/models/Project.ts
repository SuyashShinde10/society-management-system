import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  specs?: string;
  budget?: number;
  status: 'Open' | 'Analysis_Complete' | 'Closed';
  deadline: Date;
  societyId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  aiAnalysis?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  specs: { type: String },
  budget: { type: Number },
  status: { type: String, enum: ['Open', 'Analysis_Complete', 'Closed'], default: 'Open' },
  deadline: { type: Date, required: true },
  societyId: { type: Schema.Types.ObjectId, ref: 'Society' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  aiAnalysis: { type: String },
}, { timestamps: true });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
