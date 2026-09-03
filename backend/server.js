const dotenv = require('dotenv');
dotenv.config();

const validateEnv = require('./utils/validateEnv');
validateEnv();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const getRedis = require('./utils/redis');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');

const app = express();
app.set('trust proxy', 1);
app.use(cookieParser());

// -------------------------------------------------------
// DB CONNECTION MIDDLEWARE (Serverless specific)
// -------------------------------------------------------
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    logger.error('[DB_CONNECT_FAILED]', error.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// -------------------------------------------------------
// CORRELATION ID & CACHE HEADERS MIDDLEWARE
// -------------------------------------------------------
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  
  // Cache headers for GET requests
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute cache
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

// -------------------------------------------------------
// OPENTELEMETRY / APM TRACING & METRICS MIDDLEWARE
// -------------------------------------------------------
const { telemetry, telemetryMiddleware } = require('./utils/telemetry');
app.use(telemetryMiddleware);

// -------------------------------------------------------
// SECURITY HEADERS
// -------------------------------------------------------
app.use(helmet());

// -------------------------------------------------------
// CORS
// -------------------------------------------------------
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://awaastech.vercel.app', 'https://society-management-system-nine.vercel.app', process.env.FRONTEND_URL].filter(Boolean)
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use((req, res, next) => {
  const sanitize = (obj) => {
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
let redisClient = getRedis();

const getRateLimitStore = () => {
  if (redisClient && process.env.NODE_ENV === 'production') {
    try {
      return new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
      });
    } catch (e) {
      logger.warn('Failed to initialize RedisStore for rate limiting, falling back to memory store.');
    }
  }
  return undefined; // fallback to memory store
};
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRateLimitStore(),
  message: { message: 'TOO_MANY_REQUESTS — Try again in 15 minutes.' },
  skip: (req, res) => process.env.NODE_ENV !== 'production'
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRateLimitStore(),
  message: { message: 'TOO_MANY_REQUESTS — Try again in 15 minutes.' },
  skip: (req, res) => process.env.NODE_ENV !== 'production'
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1', generalLimiter);

// -------------------------------------------------------
// ROUTES
// -------------------------------------------------------
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/complaints', require('./routes/complaintRoutes'));
app.use('/api/v1/notices', require('./routes/noticeRoutes'));
app.use('/api/v1/expenses', require('./routes/expenseRoutes'));
app.use('/api/v1/bills', require('./routes/billRoutes'));

app.use('/api/v1/meetings', require('./routes/meetingRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));
app.use('/api/v1/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/v1/visitors', require('./routes/visitorRoutes'));
app.use('/api/v1/disputes', require('./routes/disputeRoutes'));
app.use('/api/v1/vendors', require('./routes/vendorRoutes'));
app.use('/api/v1/escrow', require('./routes/escrowRoutes'));
app.use('/api/v1/parking', require('./routes/parkingRoutes'));
app.use('/api/v1/emergency', require('./routes/emergencyRoutes'));
app.use('/api/v1/iot', require('./routes/iotRoutes'));
app.use('/api/v1/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/v1/theme', require('./routes/themeRoutes'));
app.use('/api/v1/ads', require('./routes/adRoutes'));

// -------------------------------------------------------
// DEEP HEALTH CHECK
// -------------------------------------------------------
app.get('/api/v1/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'ok' : 'error';
  const redisStatus = redisClient && redisClient.status === 'ready' ? 'ok' : 'error';
  
  res.status(dbStatus === 'ok' && redisStatus === 'ok' ? 200 : 503).json({
    status: dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'error',
    services: {
      database: dbStatus,
      redis: redisStatus
    },
    timestamp: new Date().toISOString()
  });
});

const { swaggerUiHtml, openApiSpec } = require('./config/swagger');

// Interactive Swagger/OpenAPI API documentation
app.get('/api-docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(swaggerUiHtml);
});
app.get('/api-docs/spec.json', (req, res) => {
  res.json(openApiSpec);
});

// OpenTelemetry & APM metrics endpoints
const { dlqManager } = require('./utils/dlq');
app.get('/api/telemetry/metrics', (req, res) => {
  res.json(telemetry.getMetricsSummary());
});
app.get('/api/telemetry/prometheus', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(telemetry.getPrometheusFormat());
});
app.get('/api/telemetry/dlq', (req, res) => {
  res.json(dlqManager.getDlqSummary());
});

// Shallow health check for root
app.get('/', (req, res) => {
  res.json({ status: 'ok', version: '1.0', docs: '/api-docs', metrics: '/api/telemetry/metrics' });
});

// -------------------------------------------------------
// 404 HANDLER
// -------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'ROUTE_NOT_FOUND', errorCode: 'ROUTE_NOT_FOUND' });
});

// -------------------------------------------------------
// GLOBAL ERROR HANDLER
// -------------------------------------------------------
app.use((err, req, res, next) => {
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

module.exports = app;