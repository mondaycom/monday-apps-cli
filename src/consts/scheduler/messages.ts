import { APP_ID_TO_ENTER } from 'src/consts/messages';

export const SchedulerMessages = {
  appId: APP_ID_TO_ENTER,
  name: 'Scheduled job name (no whitespace)',
  description: 'Scheduled job description (optional)',
  schedule: 'Cron expression for the job schedule (relative to UTC)',
  targetUrl: 'Target URL path for the job (must start with /, will be relative to /mndy-cronjob)',
  maxRetries: 'Maximum number of retries for failed jobs (optional)',
  minBackoffDuration: 'Minimum backoff duration in seconds between retries (optional)',
  timeout: 'Job execution timeout in seconds (optional)',
};
