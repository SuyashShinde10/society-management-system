const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// 1. INDUSTRIAL CORS CONFIG
// Ensure this matches your Vercel frontend URL exactly
app.use(cors({
  origin: ["https://mental-wellbeing-app-sandy.vercel.app", "http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. Middleware
app.use(express.json());

// 3. Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// 4. Root Endpoint (Heartbeat check)
app.get('/', (req, res) => {
  res.json({ 
    status: "AwaasTech_Systems_Online", 
    environment: process.env.NODE_ENV || 'development' 
  });
});

// 5. Global 404 Handler for missing API routes
app.use((req, res) => {
  res.status(404).json({ message: `// ROUTE_NOT_FOUND: ${req.originalUrl}` });
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error("// SYSTEM_FAULT:", err.stack);
  res.status(500).json({ message: "INTERNAL_SERVER_ERROR", details: err.message });
});

// 7. Define Port and Listen (Only for local dev)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`// SYSTEM_READY_ON_PORT_${PORT}`));
}

// 8. REQUIRED FOR VERCEL
module.exports = app;