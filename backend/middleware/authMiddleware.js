const jwt = require('jsonwebtoken');
const getRedis = require('../utils/redis');
const logger = require('../utils/logger');

const redisClient = getRedis();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (redisClient && process.env.NODE_ENV !== 'test') {
        try {
          const isBlacklisted = await redisClient.get(`bl_${token}`);
          if (isBlacklisted) {
            return res.status(401).json({ message: 'Token revoked, please login again' });
          }
        } catch (redisErr) {
          logger.error('Redis check failed in auth middleware:', redisErr.message);
        }
      }
      
      // Trust the JWT payload for standard auth to avoid DB hits
      // Controllers that explicitly need full user data can query it using req.user.id
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role,
        societyId: decoded.societyId
      };

      next();
      return; // Stop execution
    } catch (error) {
      // SECURITY: Never log the full token — only a safe prefix for debugging
      const tokenHint = token ? `${token.substring(0, 12)}...` : 'none';
      logger.error('JWT ERROR:', { message: error.message, name: error.name, tokenHint });
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const superadmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a superadmin' });
  }
};

const securityGuard = (req, res, next) => {
  if (req.user && req.user.role === 'security') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a security guard' });
  }
};

module.exports = { protect, admin, adminOnly: admin, superadmin, securityGuard };