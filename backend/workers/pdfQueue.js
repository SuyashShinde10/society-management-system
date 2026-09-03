const { Queue, Worker } = require('bullmq');
const getRedis = require('../utils/redis');
const logger = require('../utils/logger');
// Assuming we'd generate a PDF and optionally save it to AWS S3 or send via email
// We will mock the PDF generation for the boilerplate setup

let pdfQueue = {
  add: async (name, data) => {
    logger.info(`Mock Queue add for PDF: ${name}`);
    return { id: `mock-pdf-${Date.now()}` };
  }
};
let connection;

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  connection = getRedis();
  try {
    const queue = new Queue('pdf-jobs', { connection });
    queue.on('error', () => {});
    pdfQueue = queue;
  } catch (err) {
    logger.warn('PDF Queue fallback active (Redis offline).');
  }
}

const { dlqManager } = require('../utils/dlq');

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && connection) {
  try {
    const worker = new Worker('pdf-jobs', async job => {
      if (job.name === 'generateBillPdf') {
        const { billId, userId } = job.data;
        try {
          logger.info(`Generating PDF receipt for Bill ID: ${billId} for User: ${userId}`);
        
          // Simulate heavy PDF generation
          await new Promise(resolve => setTimeout(resolve, 2000));
        
          return { success: true, billId, pdfUrl: `https://dummy-bucket.s3.amazonaws.com/receipts/${billId}.pdf` };
        } catch (err) {
          logger.error(`Error generating PDF for Bill ID: ${billId}`, err);
          throw err;
        }
      }
    }, { connection });

    worker.on('error', () => {});
    worker.on('failed', (job, err) => {
      dlqManager.handleFailedJob('pdf-jobs', job, err);
    });
  } catch (err) {
    logger.warn('PDF Worker fallback active (Redis offline).');
  }
}

module.exports = { pdfQueue };
