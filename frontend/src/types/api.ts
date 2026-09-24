/**
 * Shared API Type Definitions
 * Maps backend models and API contracts for frontend autocomplete, validation, and type safety.
 */

export interface IUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'superadmin' | 'security';
  phone?: string;
  isActive: boolean;
  mustChangePassword?: boolean;
  parkingSlot?: string;
  vehicleNumber?: string;
  profilePicture?: string;
  societyId?: string | ISociety;
  societyName?: string;
  societyCity?: string;
  flatDetails?: {
    wing?: string;
    floor?: number;
    flatNumber?: string;
    residentType: 'Owner' | 'Tenant' | 'Staff';
    moveInDate?: string | Date;
  };
  securityDetails?: {
    age?: number;
    address?: string;
    joinDate?: string | Date;
    leaveDate?: string | Date;
    status: 'Active' | 'Left';
    shift: 'Day' | 'Night' | 'Rotational';
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ISociety {
  _id: string;
  name: string;
  address: string;
  regNumber: string;
  slug?: string;
  wings: string[];
  floors: number;
  city?: string;
  state?: string;
  pincode?: string;
  contactEmail?: string;
  contactPhone?: string;
  maintenanceAmount: number;
  amenities: string[];
  logo?: string;
  themeConfig?: {
    accentColor: string;
    bg: string;
  };
  isActive: boolean;
  planType: 'Trial' | 'Pro' | 'Premium';
  planExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBill {
  _id: string;
  societyId: string;
  userId: string | IUser;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  isPaid: boolean;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Under Verification';
  paidOn?: string;
  paymentMode?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INotice {
  _id: string;
  societyId: string;
  title: string;
  description: string;
  category: 'General' | 'Urgent' | 'Event' | 'Maintenance' | 'Security';
  attachment?: string;
  authorId?: string | IUser;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IComplaint {
  _id: string;
  societyId: string;
  user: string | IUser;
  title: string;
  description: string;
  category?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo?: string | IUser;
  resolvedAt?: string;
  attachment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGuestPass {
  _id: string;
  societyId: string;
  residentId: string | IUser;
  guestName: string;
  guestPhone: string;
  purpose: string;
  passCode: string;
  validDate: string;
  status: 'Active' | 'Used' | 'Expired';
  verifiedAt?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
