const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// 1. Initialize Environment & Database
dotenv.config();
connectDB(); // Establishes connection to MongoDB Atlas

const app = express();

// 2. INDUSTRIAL CORS CONFIG
// UPDATED: Added your new society-management frontend URL
app.use(cors({
  origin: [
    "https://society-management-system-wis5.vercel.app", 
    "https://mental-wellbeing-app-sandy.vercel.app", // Keep old one just in case
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 3. API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// 4. Heartbeat Endpoint
app.get('/', (req, res) => res.json({ status: "VERCEL_BACKEND_ACTIVE_V2" }));

// 5. VERCEL LOGIC
// Serverless environments do not use persistent port listening
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`// LOCAL_DEV_READY_ON_PORT_${PORT}`);
    });
}

// CRITICAL: Export for Vercel's serverless handler
module.exports = app;