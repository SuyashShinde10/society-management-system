const mongoose = require('mongoose');

// Use a variable to cache the connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('// USING_EXISTING_DB_CONNECTION');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // Stop trying after 5 seconds
    });
    
    isConnected = db.connections[0].readyState;
    console.log(`// DB_CONNECTED: ${db.connection.host}`);
  } catch (error) {
    console.error('// DB_HANDSHAKE_CRITICAL_FAILURE:', error.message);
    // On Vercel, we don't want to process.exit(1) as it kills the function instance
    throw error; 
  }
};

module.exports = connectDB;