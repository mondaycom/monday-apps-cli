import { StatusCodes } from 'http-status-codes';

import { appSchedulerUrl } from 'src/consts/urls';

import { execute } from './api-service';
import { HttpError } from '../types/errors';
import { AppId } from '../types/general';
import { BaseResponseHttpMetaData, HttpMethodTypes } from '../types/services/api-service';
import { appsUrlBuilder } from '../utils/urls-builder';

const handleHttpErrors = (error: HttpError) => {
  switch (error.code) {
    case StatusCodes.NOT_FOUND: {
      throw new Error('monday-code deployment not found for the requested app');
    }

    case StatusCodes.FORBIDDEN: {
      throw new Error('You are not authorized to access the requested app');
    }

    default: {
      throw new Error('UNIMPLEMENTED ERROR CASE');
    }
  }
};

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

export const listJobs = async (appId: AppId): Promise<SchedulerJob[]> => {
  try {
    const path = appSchedulerUrl(appId);
    const url = appsUrlBuilder(path);

    const response = await execute<ListJobsResponse>({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.GET,
    });

    return response.jobs;
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to list scheduler jobs');
  }
};

export type CreateJobRequest = {
  schedule: string;
  targetUrl: string;
  retryConfig?: {
    maxRetries?: number;
    minBackoffDuration?: number;
  };
  timeout?: number;
};

export type CreateJobResponse = {
  job: SchedulerJob;
} & BaseResponseHttpMetaData;

export const createJob = async (appId: AppId, job: CreateJobRequest): Promise<SchedulerJob> => {
  try {
    const path = appSchedulerUrl(appId);
    const url = appsUrlBuilder(path);

    const response = await execute<CreateJobResponse>({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.POST,
      body: job,
    });

    return response.job;
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to create scheduler job');
  }
};

export const printJobs = (jobs: SchedulerJob[], logger = console.log): void => {
  if (jobs.length === 0) {
    logger('No scheduler jobs found.');
    return;
  }

  logger('\nScheduler Jobs:');
  for (const job of jobs) {
    logger(`\n-----------------`);
    logger(`Name: ${job.name}`);
    logger(`Schedule: ${job.schedule}`);
    logger(`Target URL: ${job.targetUrl}`);
    if (job.retryConfig) {
      logger(`Retry Config: ${job.retryConfig.maxRetries} retries, ${job.retryConfig.minBackoffDuration}s backoff`);
    }

    if (job.timeout) {
      logger(`Timeout: ${job.timeout}s`);
    }
  }
};

export const SchedulerService = {
  listJobs,
  createJob,
  printJobs,
};
