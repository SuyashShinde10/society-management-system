const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// 1. UPDATED CORS: Must allow your Vercel Frontend URL
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

app.get('/', (req, res) => res.json({ status: "Render_Backend_Active" }));

// 3. RENDER LOGIC: Always listen on the provided PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`// SYSTEM_READY_ON_PORT_${PORT}`);
});