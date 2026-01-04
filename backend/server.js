const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB(); // Ensure your DB connection is established

const app = express();

// 1. UPDATED CORS: Allow your production frontend and local development
app.use(cors({
  origin: ["https://mental-wellbeing-app-sandy.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 2. Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

app.get('/', (req, res) => res.json({ status: "Vercel_Backend_Active" }));

// 3. VERCEL LOGIC: Do not call listen() in production
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`// LOCAL_DEV_READY_ON_PORT_${PORT}`);
    });
}

// CRITICAL: Export the app instance for Vercel
module.exports = app;