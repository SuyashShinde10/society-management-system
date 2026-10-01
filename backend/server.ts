import 'dotenv/config';

import validateEnv from './utils/validateEnv';
validateEnv();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// @ts-ignore — rate-limit-redis has no bundled types
import RedisStore from 'rate-limit-redis';
import cookieParser from 'cookie-parser';

import connectDB from './config/db';
import logger from './utils/logger';
import getRedis from './utils/redis';

const app = express();
app.set('trust proxy', 1);
app.use(cookieParser());

// -------------------------------------------------------
// DB CONNECTION MIDDLEWARE (Serverless specific)
// -------------------------------------------------------
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error: any) {
    logger.error('[DB_CONNECT_FAILED]', error.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// -------------------------------------------------------
// CORRELATION ID & CACHE HEADERS MIDDLEWARE
// -------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);

  // Cache headers for GET requests.
  // IMPORTANT: 'private' ensures CDN/proxies never cache authenticated responses.
  // Using 'public' here would risk serving one user's bills/data to another user.
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'private, max-age=60');
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }

  if ((logger as any).asyncLocalStorage) {
    (logger as any).asyncLocalStorage.run({ requestId: req.id }, () => {
      next();
    });
  } else {
    next();
  }
});

// -------------------------------------------------------
// OPENTELEMETRY / APM TRACING & METRICS MIDDLEWARE
// -------------------------------------------------------
const { telemetry, telemetryMiddleware } = require('./utils/telemetry');
app.use(telemetryMiddleware);

// -------------------------------------------------------
// SECURITY HEADERS & CSP
// -------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL,
          "https://awaastech.vercel.app",
          "https://society-management-system-nine.vercel.app",
          "https://society-management-system-flame.vercel.app"
        ].filter(Boolean) as string[],
      }
    }
  })
);

// Request tracing logger
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.url} - RequestID: ${req.id}`);
  next();
});

// -------------------------------------------------------
// CORS
// -------------------------------------------------------
const allowedOrigins = [
  'https://awaastech.vercel.app',
  'https://society-management-system-nine.vercel.app',
  'https://society-management-system-flame.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // No origin = same-origin or server-to-server — always allow
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow localhost in non-production environments only
      if (
        process.env.NODE_ENV !== 'production' &&
        (origin.includes('localhost') || origin.includes('127.0.0.1'))
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-tenant-slug'],
  })
);

// -------------------------------------------------------
// BODY PARSING
// -------------------------------------------------------
// Auth routes: tiny payloads only
app.use('/api/v1/auth', express.json({ limit: '1kb' }));
// Visitor routes need larger payload for base64 photo/signature
app.use('/api/v1/visitors', express.json({ limit: '5mb' }));
// Complaint routes need larger payload for base64 file attachments
app.use('/api/v1/complaints', express.json({ limit: '5mb' }));
// General: reasonable ceiling
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// -------------------------------------------------------
// NOSQL INJECTION SANITIZATION (CUSTOM MIDDLEWARE)
// -------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  next();
});

// -------------------------------------------------------
// RATE LIMITING (Redis Backed)
// -------------------------------------------------------
const redisClient = getRedis();

const getRateLimitStore = () => {
  if (redisClient && process.env.NODE_ENV === 'production') {
    try {
      return new RedisStore({
        sendCommand: (...args: any[]) => (redisClient as any).call(...args),
      });
    } catch (e) {
      logger.warn('Failed to initialize RedisStore for rate limiting, falling back to memory store.');
    }
  }
  return undefined; // fallback to memory store
};

// Rate limits are active in ALL environments — dev uses a higher ceiling so the
// limiter is always exercised in tests and local runs, without blocking normal dev work.
const IS_PROD = process.env.NODE_ENV === 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 20 : 500,          // prod: 20 attempts, dev: 500
  standardHeaders: true,
  legacyHeaders: false,
  store: getRateLimitStore(),
  message: { message: 'TOO_MANY_REQUESTS — Try again in 15 minutes.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 200 : 1000,        // prod: 200 req, dev: 1000 req
  standardHeaders: true,
  legacyHeaders: false,
  store: getRateLimitStore(),
  message: { message: 'TOO_MANY_REQUESTS — Try again in 15 minutes.' },
});

// Support both /api/... and /api/v1/... for frontend compatibility
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api/') && !req.url.startsWith('/api/v1/')) {
    req.url = req.url.replace('/api/', '/api/v1/');
  }
  next();
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1', generalLimiter);

// -------------------------------------------------------
// ROUTES
// -------------------------------------------------------
app.use('/api/v1/auth',         require('./routes/authRoutes'));
app.use('/api/v1/complaints',   require('./routes/complaintRoutes'));
app.use('/api/v1/notices',      require('./routes/noticeRoutes'));
app.use('/api/v1/expenses',     require('./routes/expenseRoutes'));
app.use('/api/v1/bills',        require('./routes/billRoutes'));
app.use('/api/v1/meetings',     require('./routes/meetingRoutes'));
app.use('/api/v1/analytics',    require('./routes/analyticsRoutes'));
app.use('/api/v1/superadmin',   require('./routes/superAdminRoutes'));
app.use('/api/v1/visitors',     require('./routes/visitorRoutes'));
app.use('/api/v1/disputes',     require('./routes/disputeRoutes'));
app.use('/api/v1/vendors',      require('./routes/vendorRoutes'));
app.use('/api/v1/escrow',       require('./routes/escrowRoutes'));
app.use('/api/v1/parking',      require('./routes/parkingRoutes'));
app.use('/api/v1/emergency',    require('./routes/emergencyRoutes'));
app.use('/api/v1/iot',          require('./routes/iotRoutes'));
app.use('/api/v1/chatbot',      require('./routes/chatbotRoutes'));
app.use('/api/v1/theme',        require('./routes/themeRoutes'));
app.use('/api/v1/ads',          require('./routes/adRoutes'));
app.use('/api/v1/gate',         require('./routes/gateRoutes'));
app.use('/api/v1/lifestyle',    require('./routes/lifestyleRoutes'));
app.use('/api/v1/accounting',   require('./routes/accountingRoutes'));
app.use('/api/v1/sustainability', require('./routes/sustainabilityRoutes'));
app.use('/api/v1/webhooks',     require('./routes/whatsappRoutes'));

// -------------------------------------------------------
// DEEP HEALTH CHECK
// -------------------------------------------------------
app.get('/api/v1/health', async (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'ok' : 'error';
  const redisStatus = redisClient && (redisClient as any).status === 'ready' ? 'ok' : 'error';

  res.status(dbStatus === 'ok' && redisStatus === 'ok' ? 200 : 503).json({
    status: dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'error',
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------
// INTERNAL-ONLY GUARD — blocks telemetry/docs in production
// unless request comes from a trusted source (localhost or
// an internal admin secret header).
// -------------------------------------------------------
const internalOnly = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') return next();
  const internalSecret = req.headers['x-internal-secret'] as string | undefined;
  if (internalSecret && internalSecret === process.env.INTERNAL_SECRET) return next();
  return res.status(403).json({ message: 'Forbidden — internal endpoint' });
};

const { swaggerUiHtml, openApiSpec } = require('./config/swagger');

// Interactive Swagger/OpenAPI API documentation
app.get('/api-docs', internalOnly, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(swaggerUiHtml);
});
app.get('/api-docs/spec.json', internalOnly, (req: Request, res: Response) => {
  res.json(openApiSpec);
});

// OpenTelemetry & APM metrics endpoints
const { dlqManager } = require('./utils/dlq');
app.get('/api/telemetry/metrics', internalOnly, (req: Request, res: Response) => {
  res.json(telemetry.getMetricsSummary());
});
app.get('/api/telemetry/prometheus', internalOnly, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(telemetry.getPrometheusFormat());
});
app.get('/api/telemetry/dlq', internalOnly, (req: Request, res: Response) => {
  res.json(dlqManager.getDlqSummary());
});

// Shallow health check for root
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: '1.0', docs: '/api-docs', metrics: '/api/telemetry/metrics' });
});

// -------------------------------------------------------
// 404 HANDLER
// -------------------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'ROUTE_NOT_FOUND', errorCode: 'ROUTE_NOT_FOUND' });
});

// -------------------------------------------------------
// GLOBAL ERROR HANDLER
// -------------------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.id || req.headers['x-request-id'];
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.isOperational ? err.message : (statusCode === 500 ? 'Internal Server Error' : err.message);

  if (statusCode >= 500) {
    logger.error('// UNHANDLED_SERVER_ERROR:', {
      error: err.message,
      stack: err.stack,
      requestId,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn('// CLIENT_OPERATIONAL_ERROR:', {
      errorCode,
      message,
      requestId,
      url: req.originalUrl,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    requestId,
    ...(err.details && { details: err.details }),
  });
});

// -------------------------------------------------------
// SERVER START (local dev only — Vercel handles this itself)
// -------------------------------------------------------
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => logger.info(`// LOCAL_DEV_ACTIVE_ON_${PORT}`));
}

export default app;
module.exports = app; // CommonJS interop for jest/vercel
