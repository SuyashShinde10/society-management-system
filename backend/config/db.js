const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Use a variable to cache the connection
let isConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    logger.info('// USING_EXISTING_DB_CONNECTION');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // Stop trying after 5 seconds
    });
    mongoose.plugin(schema => {
      schema.pre('find', function() { this.maxTimeMS(3000); });
      schema.pre('findOne', function() { this.maxTimeMS(3000); });
    });
    
    isConnected = db.connections[0].readyState;
    logger.info(`// DB_CONNECTED: ${db.connection.host}`);
  } catch (error) {
    logger.error('// DB_HANDSHAKE_CRITICAL_FAILURE:', error.message);
    // On Vercel, we don't want to process.exit(1) as it kills the function instance
    throw error; 
  }
};

module.exports = connectDB;