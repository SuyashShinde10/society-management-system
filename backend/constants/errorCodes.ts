export interface IErrorCodeDetail {
  status: number;
  message: string;
}

export const ERROR_CODES: Record<string, IErrorCodeDetail> = {
  // Authentication & Authorization
  CREDENTIALS_REJECTED: {
    status: 401,
    message: 'Invalid email or password. Please verify your credentials.',
  },
  ACCOUNT_PENDING_APPROVAL: {
    status: 403,
    message: 'Your account is pending administrator approval.',
  },
  SOCIETY_SUSPENDED: {
    status: 403,
    message: 'This housing society account is currently suspended.',
  },
  UNAUTHORIZED: {
    status: 401,
    message: 'Authentication token is required or expired.',
  },
  FORBIDDEN: {
    status: 403,
    message: 'You do not have permission to perform this action.',
  },
  ADMIN_SECRET_INVALID: {
    status: 403,
    message: 'The provided administrator authorization code is incorrect.',
  },
  USER_ALREADY_EXISTS: {
    status: 409,
    message: 'An account with this email address already exists.',
  },
  USER_NOT_FOUND: {
    status: 404,
    message: 'User account could not be found.',
  },
  CONCURRENCY_LOCK_ACTIVE: {
    status: 409,
    message: 'Another transaction is currently processing this resource. Please retry in a few moments.',
  },

  // Maintenance & Billing
  BILL_NOT_FOUND: {
    status: 404,
    message: 'Requested maintenance bill could not be found.',
  },
  BILL_ALREADY_PAID: {
    status: 400,
    message: 'This maintenance bill has already been settled.',
  },
  BILL_ALREADY_PENDING: {
    status: 400,
    message: 'Bill payment is already in progress.',
  },
  ALREADY_UNDER_VERIFICATION: {
    status: 400,
    message: 'Payment proof is already submitted and awaiting admin verification.',
  },
  TITLE_AND_AMOUNT_REQUIRED: {
    status: 400,
    message: 'Both bill title and amount are required.',
  },
  TARGET_USER_REQUIRED: {
    status: 400,
    message: 'Target resident must be selected for specific bill issuance.',
  },
  MEMBER_NOT_FOUND: {
    status: 404,
    message: 'Specified member was not found in this society.',
  },
  NOT_YOUR_BILL: {
    status: 403,
    message: 'You can only view or pay bills issued to your own account.',
  },

  // Complaints & Grievances
  COMPLAINT_NOT_FOUND: {
    status: 404,
    message: 'The requested complaint record does not exist.',
  },
  INVALID_STATUS_TRANSITION: {
    status: 400,
    message: 'The requested complaint status update is not allowed.',
  },

  // Visitors & Security
  VISITOR_NOT_FOUND: {
    status: 404,
    message: 'Visitor log record could not be found.',
  },
  VISITOR_ALREADY_CHECKED_OUT: {
    status: 400,
    message: 'This visitor has already checked out.',
  },

  // Escrow & Contracts
  ESCROW_NOT_FOUND: {
    status: 404,
    message: 'Escrow contract account could not be found.',
  },
  GEOFENCE_VERIFICATION_FAILED: {
    status: 400,
    message: 'Contractor is outside the verified society perimeter boundary.',
  },

  // General & System
  SOCIETY_NOT_FOUND: {
    status: 404,
    message: 'Specified housing society could not be found.',
  },
  VALIDATION_FAILED: {
    status: 400,
    message: 'Request payload validation failed.',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: 'An unexpected internal server error occurred.',
  },
};

export default ERROR_CODES;
