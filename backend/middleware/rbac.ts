import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

// ── Permission Registry ───────────────────────────────────────────────────────
// Defines all permissions available in the system and which roles hold them.
// superadmin holds '*' (wildcard = all permissions).
// Add new permissions here as the system expands — never scatter them in ad-hoc checks.

type Permission =
  | 'create:user' | 'read:user' | 'update:user' | 'delete:user'
  | 'create:staff' | 'read:staff' | 'update:staff' | 'delete:staff'
  | 'manage:bills' | 'manage:complaints' | 'manage:notices'
  | 'manage:expenses' | 'read:expenses' | 'manage:meetings' | 'manage:visitors'
  | 'manage:parking' | 'manage:vendors' | 'manage:escrow'
  | 'create:complaints' | 'read:complaints'
  | 'read:bills' | 'read:notices' | 'read:meetings'
  | 'read:parking' | 'read:vendors'
  | 'create:visitors' | 'read:visitors';

const roles: Record<UserRole, Permission[] | ['*']> = {
  superadmin: ['*'],
  admin: [
    'create:user', 'read:user', 'update:user', 'delete:user',
    'create:staff', 'read:staff', 'update:staff', 'delete:staff',
    'manage:bills', 'read:bills',
    'manage:complaints', 'create:complaints', 'read:complaints',
    'manage:notices', 'read:notices',
    'manage:expenses',
    'manage:meetings', 'read:meetings',
    'manage:visitors', 'create:visitors', 'read:visitors',
    'manage:parking', 'read:parking',
    'manage:vendors', 'read:vendors',
    'manage:escrow',
  ],
  member: [
    'read:user',
    'create:complaints', 'read:complaints',
    'read:bills', 'read:notices', 'read:meetings',
    'read:parking', 'read:vendors',
    'create:visitors', 'read:visitors',
    'read:expenses',
  ],
  security: [
    'create:visitors', 'read:visitors', 'manage:parking', 'read:parking',
  ],
};

/**
 * Middleware factory — gates a route behind a specific permission.
 *
 * @example
 * router.post('/bills', protect, hasPermission('manage:bills'), createBill);
 */
export const hasPermission = (requiredPermission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const userRole = req.user.role as UserRole;
    const permissions = roles[userRole];

    if (!permissions) {
      res.status(403).json({ message: 'Role not found' });
      return;
    }

    if ((permissions as string[]).includes('*') || (permissions as string[]).includes(requiredPermission)) {
      next();
      return;
    }

    // Role with 'manage:<resource>' implicitly holds 'read:<resource>' and 'create:<resource>'
    const parts = (requiredPermission as string).split(':');
    const resource = parts.length > 1 ? parts[1] : null;
    if (resource && (permissions as string[]).includes(`manage:${resource}`)) {
      next();
      return;
    }

    res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  };
};

export { roles };

// CommonJS interop
module.exports = { hasPermission, roles };
