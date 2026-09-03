import crypto from 'crypto';
import getRedis from './redis';
import logger from './logger';
import AppError from './appError';

// In-process fallback Mutex queue for environments where Redis is offline
class InMemoryMutex {
  private locks: Map<string, Promise<void>> = new Map();

  async acquire(key: string, ttlMs: number): Promise<() => void> {
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }

    let releaseResolver: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseResolver = resolve;
    });

    this.locks.set(key, lockPromise);

    // Auto-release after ttlMs to prevent deadlock
    const timeout = setTimeout(() => {
      this.release(key, releaseResolver);
    }, ttlMs);

    return () => {
      clearTimeout(timeout);
      this.release(key, releaseResolver);
    };
  }

  private release(key: string, resolver: () => void) {
    if (this.locks.has(key)) {
      this.locks.delete(key);
      resolver();
    }
  }
}

const localMutex = new InMemoryMutex();

/**
 * Execute an asynchronous operation with distributed mutual exclusion.
 * Prevents double-spend, duplicate invoice settlement, and concurrent race conditions.
 */
export async function withDistributedLock<T>(
  lockKey: string,
  ttlMs: number = 5000,
  operation: () => Promise<T>
): Promise<T> {
  const redis = getRedis();
  const lockToken = crypto.randomUUID();
  const fullKey = `lock:${lockKey}`;

  // Check if Redis is online and ready
  if (redis && redis.status === 'ready') {
    let acquired = false;
    try {
      // SET key token NX PX ttlMs
      const result = await redis.set(fullKey, lockToken, 'PX', ttlMs, 'NX');
      if (!result) {
        throw new AppError(
          'CONCURRENCY_LOCK_ACTIVE',
          'Another transaction is currently processing this resource. Please retry in a few moments.',
          409
        );
      }
      acquired = true;

      return await operation();
    } finally {
      if (acquired) {
        // Safe Lua release script: only delete if the token matches
        const luaRelease = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        try {
          await redis.eval(luaRelease, 1, fullKey, lockToken);
        } catch (err: any) {
          logger.warn(`Failed to release distributed lock ${fullKey}:`, err.message);
        }
      }
    }
  }

  // Graceful fallback to in-memory Mutex if Redis is not running
  const releaseLocal = await localMutex.acquire(fullKey, ttlMs);
  try {
    return await operation();
  } finally {
    releaseLocal();
  }
}

export default withDistributedLock;
