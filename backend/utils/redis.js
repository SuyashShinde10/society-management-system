const Redis = require('ioredis');
const logger = require('./logger');

let client;
let hasLoggedRedisWarning = false;

const getRedis = () => {
  if (!client && !process.env.VERCEL) {
    client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      lazyConnect: false,
      retryStrategy: (times) => {
        if (process.env.NODE_ENV === 'test') return null;
        if (times > 3) {
          if (!hasLoggedRedisWarning) {
            logger.warn(`Redis connection retry limit reached. Redis is unavailable at ${process.env.REDIS_URL || '127.0.0.1:6379'}. Queues & rate-limiting will operate in fallback mode.`);
            hasLoggedRedisWarning = true;
          }
          return null; // Stop infinite reconnect loop
        }
        return Math.min(times * 200, 1000);
      },
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    });

    client.on('connect', () => {
      hasLoggedRedisWarning = false;
      logger.info('Connected to Redis server successfully.');
    });

    client.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        if (!hasLoggedRedisWarning) {
          logger.warn(`Redis not detected at ${process.env.REDIS_URL || '127.0.0.1:6379'}. To enable background queues and Redis caching, start Redis (or ignore if running locally without Redis).`);
          hasLoggedRedisWarning = true;
        }
      } else {
        logger.error('Redis error:', err.message);
      }
    });
  }
  return client;
};

module.exports = getRedis;
