const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB(); 

const app = express();

// Industrial CORS Protocol
app.use(cors({
  origin: [
    "https://society-management-system-five.vercel.app", 
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes - Note the '/api' prefix here
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// Heartbeat route
app.get('/', (req, res) => res.json({ status: "VERCEL_BACKEND_ACTIVE" }));

// Vercel handles the port in production
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`// LOCAL_DEV_ACTIVE_ON_${PORT}`));
}

// CRITICAL for Vercel Serverless
module.exports = app;