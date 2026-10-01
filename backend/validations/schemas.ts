import { z } from 'zod';

// ── Auth Schemas ──────────────────────────────────────────────────────────────

export const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    societyName: z.string().optional(),
    adminName: z.string().optional(),
    adminEmail: z.string().email().optional(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
  }),
});

export const registerAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.literal('admin'),
    secretCode: z.string().optional(),
    societyName: z.string().min(2),
    address: z.string().min(5),
    regNumber: z.string().min(2),
    wings: z.union([z.string(), z.array(z.string())]),
    floors: z.union([z.string(), z.number()]),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    maintenanceAmount: z.union([z.string(), z.number()]).optional(),
    otp: z.string().optional(),
    verificationToken: z.string().optional(),
  }).refine((data) => !!(data.otp || data.verificationToken), {
    message: 'Either otp or verificationToken must be provided',
    path: ['otp'],
  }),
});

export const registerMemberSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    societyId: z.string().length(24),
    wing: z.string().optional(),
    floor: z.union([z.string(), z.number()]).optional(),
    flatNumber: z.string().optional(),
    residentType: z.string().optional(),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

// ── Bill Schemas ──────────────────────────────────────────────────────────────

export const generateBillSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    amount: z.union([z.string(), z.number()]),
    dueDate: z.string().optional(),
    targetType: z.string().optional(),
    targetUserId: z.string().length(24).optional(),
  }),
});

export const markBillPaidSchema = z.object({
  body: z.object({
    paymentMode: z.string().optional(),
    notes: z.string().optional(),
    action: z.string().optional(),
  }),
  params: z.object({
    id: z.string().length(24),
  }),
});

// ── Dispute Schemas ───────────────────────────────────────────────────────────

export const initiateDisputeSchema = z.object({
  body: z.object({
    maintenanceBillId: z.string().length(24),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    disputeId: z.string().length(24),
    message: z.string().min(1),
  }),
});

// ── Complaint Schemas ─────────────────────────────────────────────────────────

export const createComplaintSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200),
    description: z.string().min(2).max(2000),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
    category: z.enum(['Water', 'Electricity', 'Lift', 'Security', 'Cleanliness', 'Noise', 'Parking', 'Other']).optional(),
    attachment: z.string().max(500).optional(),
  }),
});

export const updateComplaintSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'In Progress', 'Resolved', 'Declined']),
    adminComment: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().length(24),
  }),
});

// ── Notice Schemas ────────────────────────────────────────────────────────────

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200),
    content: z.string().min(2).max(5000),
    priority: z.enum(['Normal', 'Important', 'Urgent']).optional(),
    isPinned: z.boolean().optional(),
    targetWing: z.string().optional(),
    targetType: z.enum(['All', 'Specific']).optional(),
    targetUserId: z.string().length(24).optional().or(z.literal('')),
    expiryDate: z.string().optional(),
  }),
});

// ── Expense Schemas ───────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200),
    description: z.string().optional(),
    amount: z.union([z.number(), z.string()]),
    category: z.string().optional(),
    expenseDate: z.string().optional(),
    receiptUrl: z.string().optional(),
  }),
});

// ── Meeting Schemas ───────────────────────────────────────────────────────────

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200),
    description: z.string().optional(),
    date: z.string(),
    time: z.string(),
    location: z.string().optional(),
    meetingUrl: z.string().optional(),
    targetType: z.enum(['All', 'Specific']).optional(),
    targetUserId: z.string().length(24).optional().or(z.literal('')),
  }),
});

// ── Visitor Schemas ───────────────────────────────────────────────────────────

export const createVisitorSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().min(10).max(15),
    purpose: z.string().min(2),
    wing: z.string().optional(),
    flatNumber: z.string().optional(),
    photo: z.string().optional(),
    signature: z.string().optional(),
  }),
});

export const updateVisitorSchema = z.object({
  params: z.object({
    id: z.string().length(24),
  }),
});

// ── Vendor Schemas ────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(2),
    specs: z.string().optional(),
    budget: z.union([z.number(), z.string()]).optional(),
    deadline: z.string().optional(),
  }),
});

export const submitQuoteSchema = z.object({
  body: z.object({
    vendorName: z.string().min(2),
    vendorEmail: z.string().email(),
    vendorPhone: z.string().min(10),
    quoteAmount: z.union([z.number(), z.string()]),
    timeline: z.string().optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    projectId: z.string().length(24),
  }),
});

// ── Escrow Schemas ────────────────────────────────────────────────────────────

export const createEscrowSchema = z.object({
  body: z.object({
    projectId: z.string().length(24),
    vendorQuoteId: z.string().length(24),
    amount: z.union([z.number(), z.string()]),
    societyId: z.string().length(24),
  }),
});

export const verifyGeofenceSchema = z.object({
  body: z.object({
    escrowId: z.string().length(24),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

/** Schema for POST /escrow/verify/resident — ensures escrowId is provided in body */
export const verifyResidentSchema = z.object({
  body: z.object({
    escrowId: z.string().length(24),
  }),
});

// ── Parking Schemas ───────────────────────────────────────────────────────────

export const allocateParkingSchema = z.object({
  body: z.object({
    spaceNumber: z.string().min(1),
    allocatedTo: z.string().length(24),
    vehicleNumber: z.string().min(4),
  }),
});

export const verifyParkingSchema = z.object({
  body: z.object({
    plateNumber: z.string().min(4),
    societyId: z.string().length(24).optional(),
  }),
});

// ── Ad Schemas ────────────────────────────────────────────────────────────────

export const submitAdBidSchema = z.object({
  body: z.object({
    vendorName: z.string().min(2),
    title: z.string().min(2),
    description: z.string().min(2),
    imageUrl: z.string().optional(),
    contactUrl: z.string().optional(),
    bidAmount: z.union([z.number(), z.string()]),
    durationDays: z.union([z.number(), z.string()]).optional(),
  }),
  params: z.object({
    societyId: z.string().length(24),
  }),
});

// CommonJS interop — routes using require() still work
module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  registerAdminSchema,
  registerMemberSchema,
  loginSchema,
  generateBillSchema,
  markBillPaidSchema,
  initiateDisputeSchema,
  sendMessageSchema,
  createComplaintSchema,
  updateComplaintSchema,
  createNoticeSchema,
  createExpenseSchema,
  createMeetingSchema,
  createVisitorSchema,
  updateVisitorSchema,
  createProjectSchema,
  submitQuoteSchema,
  createEscrowSchema,
  verifyGeofenceSchema,
  verifyResidentSchema,
  allocateParkingSchema,
  verifyParkingSchema,
  submitAdBidSchema,
};
