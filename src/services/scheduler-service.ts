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

export const SchedulerService = {
  listJobs,
};
