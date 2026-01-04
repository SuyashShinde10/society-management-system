const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// INDUSTRIAL CORS CONFIG
app.use(cors({
  origin: ["https://mental-wellbeing-app-sandy.vercel.app", "http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

app.get('/', (req, res) => res.json({ status: "AwaasTech_Systems_Online" }));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`// SYSTEM_READY_ON_PORT_${PORT}`));
}

// REQUIRED FOR VERCEL
module.exports = app;