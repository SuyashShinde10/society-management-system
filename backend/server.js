const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
// Ensure this function handles connection errors gracefully
connectDB(); 

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    "https://society-management-system-five.vercel.app", // Your Frontend URL
    "http://localhost:5173"                              // Local Development
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Added OPTIONS for preflight checks
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// Heartbeat route (Access this in browser to verify backend is running)
app.get('/', (req, res) => {
  res.json({ 
    status: "VERCEL_BACKEND_ACTIVE", 
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Vercel Serverless Handling
// Vercel requires the app to be exported. 
// It handles the 'listen' part automatically in production.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`// LOCAL_DEV_ACTIVE_ON_${PORT}`));
}

module.exports = app;