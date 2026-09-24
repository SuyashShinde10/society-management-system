// -------------------------------------------------------
// Global Express type augmentation — extends Request with
// req.user so all controllers have full type safety without
// (req as any).user casts.
// -------------------------------------------------------
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string | Types.ObjectId;
        id: string | Types.ObjectId;
        role: 'admin' | 'member' | 'superadmin' | 'security';
        societyId?: string | Types.ObjectId;
      };
      /** Resolved tenant society from tenantResolver middleware */
      tenantSociety?: import('../models/Society').ISociety;
      /** Correlation ID for request tracing */
      id?: string;
    }
  }
}

export {};
