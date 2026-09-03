/**
 * Human-Readable Error Message Translator for API Responses
 */

const ERROR_MESSAGE_MAP = {
  CREDENTIALS_REJECTED: 'Invalid email or password. Please verify your credentials and try again.',
  ACCOUNT_PENDING_APPROVAL: 'Your account has been registered and is awaiting administrator approval.',
  SOCIETY_SUSPENDED: 'This society portal is temporarily suspended. Please contact the management committee.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have administrative permission to perform this action.',
  ADMIN_SECRET_INVALID: 'The society admin registration code is incorrect.',
  USER_ALREADY_EXISTS: 'An account with this email address already exists in the system.',
  BILL_NOT_FOUND: 'The requested bill record could not be found.',
  BILL_ALREADY_PAID: 'This bill has already been marked as settled.',
  BILL_ALREADY_PENDING: 'A payment is already being processed for this bill.',
  ALREADY_UNDER_VERIFICATION: 'Your payment slip is already under review by society administrators.',
  TITLE_AND_AMOUNT_REQUIRED: 'Please fill in both the bill title and a valid amount.',
  TARGET_USER_REQUIRED: 'Please select the specific resident to issue this bill to.',
  MEMBER_NOT_FOUND: 'The selected resident could not be found in this society.',
  NOT_YOUR_BILL: 'You can only view or pay bills issued to your own flat.',
  COMPLAINT_NOT_FOUND: 'The requested complaint ticket could not be found.',
  INVALID_STATUS_TRANSITION: 'This status update is not permitted.',
  VISITOR_NOT_FOUND: 'Visitor log record was not found.',
  VISITOR_ALREADY_CHECKED_OUT: 'This visitor is already marked as checked out.',
  ESCROW_NOT_FOUND: 'Escrow account record could not be found.',
  GEOFENCE_VERIFICATION_FAILED: 'Vendor is not within the geofenced society premises.',
  SOCIETY_NOT_FOUND: 'Society details not found.',
  INTERNAL_SERVER_ERROR: 'A server error occurred. Please try again in a few moments.',
  ROUTE_NOT_FOUND: 'API endpoint does not exist.',
};

export const getErrorMessage = (error, fallback = 'An unexpected error occurred.') => {
  if (!error) return fallback;

  // 1. Check for backend standardized error code
  const errorCode = error.response?.data?.errorCode;
  if (errorCode && ERROR_MESSAGE_MAP[errorCode]) {
    return ERROR_MESSAGE_MAP[errorCode];
  }

  // 2. Check for backend message string matching code
  const message = error.response?.data?.message || error.response?.data?.error;
  if (message && ERROR_MESSAGE_MAP[message]) {
    return ERROR_MESSAGE_MAP[message];
  }

  if (typeof message === 'string' && message.length > 0) {
    return message;
  }

  // 3. Check for standard Axios network errors
  if (error.code === 'ERR_NETWORK') {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  return fallback;
};

export default getErrorMessage;
