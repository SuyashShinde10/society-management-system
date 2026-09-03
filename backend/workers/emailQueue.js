const { Queue, Worker } = require('bullmq');
const getRedis = require('../utils/redis');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

let emailQueue = { add: async (name, data) => {
  // Fallback if Vercel or Redis is not connected: execute immediately
  await sendEmail(data);
} };
let connection;

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  connection = getRedis();
  try {
    const queue = new Queue('email-jobs', { connection });
    queue.on('error', () => {});
    emailQueue = queue;
  } catch (err) {
    logger.warn('Email Queue fallback active (Redis offline).');
  }
}

const { dlqManager } = require('../utils/dlq');

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && connection) {
  try {
    const worker = new Worker('email-jobs', async job => {
      if (job.name === 'sendEmailJob') {
        const { email, subject, message, html } = job.data;
        await sendEmail({ email, subject, message, html });
        return { success: true, email };
      }
    }, { connection });

    worker.on('error', () => {});
    worker.on('failed', (job, err) => {
      dlqManager.handleFailedJob('email-jobs', job, err);
    });
  } catch (err) {
    logger.warn('Email Worker fallback active (Redis offline).');
  }
}

module.exports = { emailQueue };
