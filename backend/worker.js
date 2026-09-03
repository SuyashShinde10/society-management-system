require('dotenv').config();
const { Worker } = require('bullmq');
const getRedis = require('./utils/redis');
const logger = require('./utils/logger');
const connectDB = require('./config/db');

const connection = getRedis();

const startWorkers = async () => {
  try {
    await connectDB();
    logger.info('[WORKER_PROCESS] Connected to Database');

    logger.info('[WORKER_PROCESS] Starting BullMQ workers...');

    // Import workers to start them
    require('./workers/emailQueue');
    require('./workers/aiQueue');
    require('./workers/pdfQueue');

    logger.info('[WORKER_PROCESS] All workers successfully started');
  } catch (error) {
    logger.error('[WORKER_PROCESS_ERROR]', error);
    process.exit(1);
  }
};

startWorkers();
