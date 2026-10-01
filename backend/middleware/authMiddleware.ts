import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import getRedis from '../utils/redis';
import logger from '../utils/logger';

const redisClient = getRedis();

// ── protect ───────────────────────────────────────────────────────────────────
// Accepts JWT from Authorization header (Bearer token) or httpOnly cookie.
// Dual-mode auth guarantees functionality in cross-origin environments (e.g. Vercel)
// where third-party cookies are blocked, while preserving cookie support.
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: 'admin' | 'member' | 'superadmin' | 'security';
      societyId?: string;
    };

    // Check token blacklist (skip in tests to avoid Redis dependency)
    if (redisClient && process.env.NODE_ENV !== 'test') {
      try {
        const isBlacklisted = await redisClient.get(`bl_${token}`);
        if (isBlacklisted) {
          res.status(401).json({ message: 'Token revoked, please login again' });
          return;
        }
      } catch (redisErr: any) {
        logger.error('Redis check failed in auth middleware:', redisErr.message);
      }
    }

    // Trust the JWT payload for standard auth to avoid DB hits on every request.
    // Controllers that explicitly need full user data can query it via req.user.id.
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      role: decoded.role,
      societyId: decoded.societyId,
    };

    next();
  } catch (error: any) {
    // SECURITY: Never log the full token — only a safe prefix for debugging
    const tokenHint = `${token.substring(0, 12)}...`;
    logger.error('JWT ERROR:', { message: error.message, name: error.name, tokenHint });
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// ── admin ────────────────────────────────────────────────────────────────────
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Alias for routes that import `adminOnly`
export const adminOnly = admin;

// ── superadmin ───────────────────────────────────────────────────────────────
export const superadmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a superadmin' });
  }
};

// ── securityGuard ─────────────────────────────────────────────────────────────
export const securityGuard = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'security') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a security guard' });
  }
};

// CommonJS interop — routes that use require() can still destructure from this module
module.exports = { protect, admin, adminOnly, superadmin, securityGuard };
