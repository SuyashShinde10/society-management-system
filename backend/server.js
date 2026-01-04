const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB(); 

const app = express();

// --- CORS CONFIGURATION (FIXED) ---
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://awaastech.vercel.app" // ⚠️ MUST MATCH YOUR FRONTEND URL EXACTLY (No trailing slash)
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// --- HEALTH CHECK ---
app.get('/', (req, res) => {
  res.json({ 
    status: "VERCEL_BACKEND_ACTIVE", 
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// --- SERVER START ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`// LOCAL_DEV_ACTIVE_ON_${PORT}`));
}

module.exports = app;