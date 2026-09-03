import logger from './logger';

export interface IDlqJob {
  id: string;
  queueName: string;
  jobName: string;
  data: any;
  error: {
    message: string;
    stack?: string;
  };
  attemptsMade: number;
  failedAt: string;
}

class DeadLetterQueueManager {
  private deadJobs: IDlqJob[] = [];
  private maxDeadJobs = 1000;

  /**
   * Register a job that has exhausted all retries into the Dead-Letter Queue (DLQ).
   */
  handleFailedJob(queueName: string, job: any, err: any) {
    const attempts = job?.opts?.attempts || 3;
    const attemptsMade = job?.attemptsMade || 1;

    // Only move to DLQ if max retries have been exhausted
    if (attemptsMade >= attempts) {
      const dlqEntry: IDlqJob = {
        id: job?.id || `dlq-${Date.now()}`,
        queueName,
        jobName: job?.name || 'unknown',
        data: job?.data || {},
        error: {
          message: err?.message || 'Unknown queue processing failure',
          stack: err?.stack,
        },
        attemptsMade,
        failedAt: new Date().toISOString(),
      };

      if (this.deadJobs.length >= this.maxDeadJobs) {
        this.deadJobs.shift();
      }
      this.deadJobs.push(dlqEntry);

      // Trigger High-Severity Alert
      logger.error(`[DLQ_ALERT] Permanent queue failure in "${queueName}" for job "${dlqEntry.jobName}" (${dlqEntry.id}):`, {
        queueName,
        jobName: dlqEntry.jobName,
        jobId: dlqEntry.id,
        attemptsMade,
        error: dlqEntry.error.message,
      });

      return dlqEntry;
    }

    logger.warn(`[QUEUE_RETRY] Job ${job?.id} in "${queueName}" failed attempt ${attemptsMade}/${attempts}: ${err?.message}`);
    return null;
  }

  getDlqJobs(): IDlqJob[] {
    return [...this.deadJobs].reverse();
  }

  getDlqSummary() {
    const byQueue: Record<string, number> = {};
    for (const j of this.deadJobs) {
      byQueue[j.queueName] = (byQueue[j.queueName] || 0) + 1;
    }

    return {
      totalDeadJobs: this.deadJobs.length,
      byQueue,
      latestDeadJobs: this.getDlqJobs().slice(0, 10),
    };
  }

  clearDlq() {
    this.deadJobs = [];
  }
}

export const dlqManager = new DeadLetterQueueManager();
export default dlqManager;
