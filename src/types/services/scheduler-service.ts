import { BaseResponseHttpMetaData } from './api-service';

export type SchedulerJob = {
  name: string;
  schedule: string;
  targetUrl: string;
  retryConfig?: {
    maxRetries: number;
    minBackoffDuration: number;
  };
  timeout?: number;
};

export type ListJobsResponse = {
  jobs: SchedulerJob[];
} & BaseResponseHttpMetaData;

export type CreateJobRequest = {
  name: string;
  description?: string;
  schedule: string;
  targetUrl: string;
  retryConfig?: {
    maxRetries?: number;
    minBackoffDuration?: number;
  };
  timeout?: number;
};

export type UpdateJobRequest = Partial<Omit<CreateJobRequest, 'name'>>;

export type CreateJobResponse = {
  job: SchedulerJob;
} & BaseResponseHttpMetaData;
