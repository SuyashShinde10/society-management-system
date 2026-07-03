const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

dotenv.config();

// -------------------------------------------------------
// ENV VALIDATION — crash early with a clear message
// -------------------------------------------------------
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_SECRET'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`[STARTUP_FATAL] Missing required environment variable: ${key}`);
  }
});

// Connect to Database
connectDB();

const app = express();

// -------------------------------------------------------
// SECURITY HEADERS (helmet)
// -------------------------------------------------------
app.use(helmet());

// -------------------------------------------------------
// CORS — only allow known origins, conditional on env
// -------------------------------------------------------
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://awaastech.vercel.app']
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// -------------------------------------------------------
// BODY PARSING — strict 10kb limit to prevent DoS payloads
// -------------------------------------------------------
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// -------------------------------------------------------
// NOSQL INJECTION SANITIZATION
// Strips $ and . characters from req.body, req.query, req.params
// -------------------------------------------------------
app.use(mongoSanitize());

// -------------------------------------------------------
// RATE LIMITING
// -------------------------------------------------------

// Strict limiter for auth endpoints (login / register) — 10 requests per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'TOO_MANY_REQUESTS — Try again in 15 minutes.' },
});

// General API limiter — 120 requests per 15 min
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'TOO_MANY_REQUESTS — Try again in 15 minutes.' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', generalLimiter);

// -------------------------------------------------------
// ROUTES
// -------------------------------------------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// -------------------------------------------------------
// HEALTH CHECK — no sensitive data exposed
// -------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// -------------------------------------------------------
// 404 HANDLER — catch undefined routes
// -------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: 'ROUTE_NOT_FOUND' });
});

// -------------------------------------------------------
// GLOBAL ERROR HANDLER
// -------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('// UNHANDLED_SERVER_ERROR:', err);
  res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
});

// -------------------------------------------------------
// SERVER START
// -------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`// LOCAL_DEV_ACTIVE_ON_${PORT}`));
}

module.exports = app;