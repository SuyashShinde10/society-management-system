import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: 'Maintenance' | 'Repairs' | 'Salary' | 'Event' | 'Utilities' | 'Security' | 'Other';
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI' | 'Other';
  expenseDate: Date;
  receipt?: string;
  notes?: string;
  societyId: mongoose.Types.ObjectId;
  recordedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema<IExpense> = new Schema({
  title: {
    type: String, required: true, trim: true, maxlength: [200, 'Title too long']
  },
  amount: {
    type: Number, required: true, min: [0.01, 'Amount must be > 0'], max: [10000000, 'Amount too large']
  },
  category: {
    type: String, required: true, trim: true,
    enum: ['Maintenance', 'Repairs', 'Salary', 'Event', 'Utilities', 'Security', 'Other'],
    default: 'Other'
  },
  paymentMode: {
    type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Other'], default: 'Cash'
  },
  expenseDate: { type: Date, default: Date.now },
  receipt: { type: String },
  notes: { type: String, trim: true, maxlength: [500, 'Notes too long'] },
  societyId: {
    type: Schema.Types.ObjectId, ref: 'Society', required: true
  },
  recordedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  }
}, { timestamps: true });

ExpenseSchema.index({ societyId: 1, expenseDate: -1 });
ExpenseSchema.index({ societyId: 1, category: 1 });

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export default Expense;
