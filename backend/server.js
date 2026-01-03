const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize Express App
const app = express();

// 4. Middleware (Allows us to accept JSON data)
app.use(express.json());
app.use(cors());

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/complaints', require('./routes/complaintRoutes'));

app.use('/api/notices', require('./routes/noticeRoutes'));

app.use('/api/expenses', require('./routes/expenseRoutes'));

// 5. Basic Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 6. Define Port and Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 