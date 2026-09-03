import { Types } from 'mongoose';

export type UserRole = 'admin' | 'member' | 'superadmin' | 'security';

export interface IUserTokenPayload {
  _id: string | Types.ObjectId;
  id?: string | Types.ObjectId;
  role: UserRole;
  societyId?: string | Types.ObjectId;
}

export interface IAuthUserContext {
  _id: Types.ObjectId | string;
  id?: Types.ObjectId | string;
  role: UserRole;
  societyId?: Types.ObjectId | string;
  name?: string;
  email?: string;
}

export interface IGenerateBillInput {
  title: string;
  description?: string;
  amount: number | string;
  dueDate?: string | Date;
  targetType?: 'All' | 'Specific';
  targetUserId?: string;
}

export interface IMarkBillPaidInput {
  paymentMode?: 'UPI' | 'Cash' | 'Bank Transfer' | 'Stripe' | string;
  notes?: string;
  action?: 'approve' | 'reject';
}

export interface ICreateComplaintInput {
  title: string;
  description: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  category?: 'Water' | 'Electricity' | 'Lift' | 'Security' | 'Cleanliness' | 'Noise' | 'Parking' | 'Other';
  attachment?: string;
}

export interface IUpdateComplaintStatusInput {
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Declined';
  adminComment?: string;
}

export interface ICreateVisitorInput {
  name: string;
  phone: string;
  purpose: string;
  wing?: string;
  flatNumber?: string;
  photo?: string;
  signature?: string;
}

export interface ICreateExpenseInput {
  title: string;
  amount: number;
  category: 'Maintenance' | 'Repairs' | 'Salary' | 'Event' | 'Utilities' | 'Security' | 'Other';
  date?: string | Date;
  description?: string;
  receiptUrl?: string;
}

export interface ICreateNoticeInput {
  title: string;
  content: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Emergency';
  targetWing?: string;
  expiresAt?: string | Date;
}

export interface ICreateEscrowInput {
  projectId: Types.ObjectId | string;
  vendorId: Types.ObjectId | string;
  amount: number;
  conditionNotes?: string;
}

export interface IParkingAllocationInput {
  slotNumber: string;
  vehicleNumber: string;
  vehicleType: 'Two Wheeler' | 'Four Wheeler';
  flatNumber?: string;
  wing?: string;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    nextCursor?: string | null;
  };
  error?: string;
  errorCode?: string;
}
