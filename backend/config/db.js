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
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000 // Stop trying after 5 seconds
    });
    mongoose.plugin(schema => {
      schema.pre('find', function() { this.maxTimeMS(3000); });
      schema.pre('findOne', function() { this.maxTimeMS(3000); });
    });
    
    isConnected = db.connections[0].readyState;
    logger.info(`// DB_CONNECTED: ${db.connection.host}`);

    // Drop outdated OTP TTL index if it was previously set to 120s
    try {
      const otpsCollection = mongoose.connection.collection('otps');
      const indexes = await otpsCollection.indexes();
      const ttlIndex = indexes.find((idx) => idx.name === 'createdAt_1');
      if (ttlIndex && ttlIndex.expireAfterSeconds && ttlIndex.expireAfterSeconds !== 600) {
        await otpsCollection.dropIndex('createdAt_1');
        logger.info('// DROPPED_OUTDATED_OTP_TTL_INDEX');
      }
    } catch (idxErr) {
      // Safe to ignore if collection doesn't exist yet
    }
  } catch (error) {
    logger.error('// DB_HANDSHAKE_CRITICAL_FAILURE:', error.message);
    // On Vercel, we don't want to process.exit(1) as it kills the function instance
    throw error; 
  }
};

module.exports = connectDB;