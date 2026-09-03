import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from './logger';

interface IMetricRecord {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

class TelemetryRegistry {
  private records: IMetricRecord[] = [];
  private maxRecords = 2000; // In-memory ring buffer
  private dbOperationTimings: Map<string, number[]> = new Map();

  recordRequest(method: string, route: string, statusCode: number, durationMs: number) {
    if (this.records.length >= this.maxRecords) {
      this.records.shift();
    }
    this.records.push({
      method,
      route,
      statusCode,
      durationMs,
      timestamp: Date.now(),
    });
  }

  async measureDbOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await operation();
    } finally {
      const duration = performance.now() - start;
      if (!this.dbOperationTimings.has(operationName)) {
        this.dbOperationTimings.set(operationName, []);
      }
      const timings = this.dbOperationTimings.get(operationName)!;
      if (timings.length > 500) timings.shift();
      timings.push(duration);
    }
  }

  getMetricsSummary() {
    const totalRequests = this.records.length;
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        statusCodes: {},
        averageLatencyMs: 0,
        p95LatencyMs: 0,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      };
    }

    const statusCodes: Record<string, number> = {};
    const durations: number[] = [];

    for (const r of this.records) {
      const group = `${Math.floor(r.statusCode / 100)}xx`;
      statusCodes[group] = (statusCodes[group] || 0) + 1;
      durations.push(r.durationMs);
    }

    durations.sort((a, b) => a - b);
    const sum = durations.reduce((acc, v) => acc + v, 0);
    const avg = sum / durations.length;
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    const dbSummary: Record<string, { count: number; avgMs: number }> = {};
    for (const [op, timings] of this.dbOperationTimings.entries()) {
      const total = timings.reduce((a, b) => a + b, 0);
      dbSummary[op] = {
        count: timings.length,
        avgMs: Math.round((total / timings.length) * 100) / 100,
      };
    }

    return {
      service: 'society-management-backend',
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      totalRequests,
      statusCodes,
      latency: {
        avgMs: Math.round(avg * 100) / 100,
        p95Ms: Math.round(durations[p95Index] * 100) / 100,
        p99Ms: Math.round(durations[p99Index] * 100) / 100,
      },
      dbOperations: dbSummary,
      timestamp: new Date().toISOString(),
    };
  }

  getPrometheusFormat(): string {
    const summary = this.getMetricsSummary();
    const lines = [
      `# HELP http_requests_total Total number of HTTP requests processed.`,
      `# TYPE http_requests_total counter`,
      `http_requests_total ${summary.totalRequests}`,
      `# HELP process_uptime_seconds Total uptime of the node process in seconds.`,
      `# TYPE process_uptime_seconds gauge`,
      `process_uptime_seconds ${summary.uptimeSeconds}`,
      `# HELP process_heap_bytes Current heap usage in bytes.`,
      `# TYPE process_heap_bytes gauge`,
      `process_heap_bytes ${process.memoryUsage().heapUsed}`,
      `# HELP http_request_duration_p95_ms 95th percentile request latency in milliseconds.`,
      `# TYPE http_request_duration_p95_ms gauge`,
      `http_request_duration_p95_ms ${summary.latency ? summary.latency.p95Ms : 0}`,
    ];

    if (summary.statusCodes) {
      for (const [code, count] of Object.entries(summary.statusCodes)) {
        lines.push(`http_requests_by_status{status_group="${code}"} ${count}`);
      }
    }

    return lines.join('\n');
  }
}

export const telemetry = new TelemetryRegistry();

/**
 * Express middleware for APM metrics, response timing, and trace propagation.
 */
export const telemetryMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  const traceId = (req.headers['x-trace-id'] as string) || crypto.randomUUID();
  res.setHeader('X-Trace-Id', traceId);

  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    if (!res.headersSent) {
      const duration = performance.now() - start;
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    }
    return (originalEnd as any).apply(this, args);
  };

  res.on('finish', () => {
    const duration = performance.now() - start;
    const route = req.route ? req.route.path : req.path;
    telemetry.recordRequest(req.method, route, res.statusCode, duration);

    // Alert if any API call takes > 2000ms
    if (duration > 2000) {
      logger.warn(`[SLOW API DETECTED] ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
    }
  });

  next();
};

export default telemetry;
