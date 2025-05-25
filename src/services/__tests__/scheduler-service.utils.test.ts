import { validateCronExpression } from 'src/services/scheduler-service.utils';

describe('validateCronExpression', () => {
  it('should throw an error when schedule is empty', () => {
    expect(() => validateCronExpression('')).toThrow('Cron expression is required');
  });

  it('should accept valid cron expressions', () => {
    const validCronExpressions = [
      '* * * * *', // Every minute
      '*/5 * * * *', // Every 5 minutes
      '0 * * * *', // Every hour
      '0 0 * * *', // Every day at midnight
      '0 0 * * 0', // Every Sunday at midnight
      '0 0 1 * *', // First day of every month
      '0 0 1 1 *', // First day of January
      '*/15 * * * *', // Every 15 minutes
      '0 */2 * * *', // Every 2 hours
      '0 0 */2 * *', // Every 2 days
    ];

    for (const expression of validCronExpressions) {
      expect(() => validateCronExpression(expression)).not.toThrow();
    }
  });

  it('should reject invalid cron expressions', () => {
    const invalidCronExpressions = [
      '* * * *', // Missing field
      '* * * * * *', // Extra field
      '60 * * * *', // Invalid minute (60)
      '* 24 * * *', // Invalid hour (24)
      '* * 32 * *', // Invalid day of month (32)
      '* * * 13 *', // Invalid month (13)
      '* * * * 7', // Invalid day of week (7)
      '*/32 * * * *', // Invalid step value (32)
      'a * * * *', // Non-numeric character
      '0-60 * * * *', // Invalid range
      '0,60 * * * *', // Invalid value in list
      '0-5-10 * * * *', // Invalid range format
      '0,5,10, * * * *', // Invalid list format
    ];

    for (const expression of invalidCronExpressions) {
      expect(() => validateCronExpression(expression)).toThrow('Invalid cronjob schedule format');
    }
  });
});
