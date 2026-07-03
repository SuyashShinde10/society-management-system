const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

dotenv.config();

// -------------------------------------------------------
// ENV VALIDATION — log warnings but do NOT crash the
// Vercel serverless function. A hard throw() here kills
// the function before any route can respond, causing 500s.
// -------------------------------------------------------
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_SECRET'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[STARTUP_CRITICAL] Missing required env var: ${key}`);
  }
});

// Connect to Database (cached for serverless)
connectDB().catch((err) => {
  console.error('[DB_CONNECT_FAILED]', err.message);
});

const app = express();

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
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// -------------------------------------------------------
// NOSQL INJECTION SANITIZATION
// -------------------------------------------------------
app.use(mongoSanitize());

// -------------------------------------------------------
// RATE LIMITING
// -------------------------------------------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'TOO_MANY_REQUESTS — Try again in 15 minutes.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/visitors', require('./routes/visitorRoutes'));

// -------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

// -------------------------------------------------------
// 404 HANDLER
// -------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: 'ROUTE_NOT_FOUND' });
});

// -------------------------------------------------------
// GLOBAL ERROR HANDLER
// -------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('// UNHANDLED_SERVER_ERROR:', err.message);
  res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
});

// -------------------------------------------------------
// SERVER START (local dev only — Vercel handles this itself)
// -------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`// LOCAL_DEV_ACTIVE_ON_${PORT}`));
}

module.exports = app;