import { dlqManager } from '../../utils/dlq';

describe('Dead-Letter Queue (DLQ) Manager Unit Tests', () => {
  beforeEach(() => {
    dlqManager.clearDlq();
  });

  it('should ignore job failure if attempts have not reached max retry limit', () => {
    const mockJob = {
      id: 'job-retry-1',
      name: 'sendEmailJob',
      attemptsMade: 1,
      opts: { attempts: 3 },
      data: { email: 'user@test.com' },
    };

    const res = dlqManager.handleFailedJob('email-jobs', mockJob, new Error('SMTP Timeout'));
    expect(res).toBeNull();
    expect(dlqManager.getDlqJobs().length).toBe(0);
  });

  it('should register job into DLQ when max retries are exhausted and trigger alert', () => {
    const mockJob = {
      id: 'job-fatal-99',
      name: 'generateBillPdf',
      attemptsMade: 3,
      opts: { attempts: 3 },
      data: { billId: 'bill_123', userId: 'user_456' },
    };

    const fatalError = new Error('Out of Memory in Chromium worker');
    const dlqEntry = dlqManager.handleFailedJob('pdf-jobs', mockJob, fatalError);

    expect(dlqEntry).not.toBeNull();
    expect(dlqEntry?.id).toBe('job-fatal-99');
    expect(dlqEntry?.queueName).toBe('pdf-jobs');
    expect(dlqEntry?.error.message).toBe('Out of Memory in Chromium worker');

    const summary = dlqManager.getDlqSummary();
    expect(summary.totalDeadJobs).toBe(1);
    expect(summary.byQueue['pdf-jobs']).toBe(1);
  });
});
