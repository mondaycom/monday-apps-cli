import { appSchedulerUrl } from 'src/consts/urls';

import { execute } from './api-service';
import {
  CreateJobRequest,
  CreateJobResponse,
  ListJobsResponse,
  SchedulerJob,
  handleHttpErrors,
} from './scheduler-service.utils';
import { HttpError } from '../types/errors';
import { AppId } from '../types/general';
import { HttpMethodTypes } from '../types/services/api-service';
import { appsUrlBuilder } from '../utils/urls-builder';

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

const createJob = async (appId: AppId, job: CreateJobRequest): Promise<SchedulerJob> => {
  try {
    const path = appSchedulerUrl(appId);
    const url = appsUrlBuilder(path);

    console.log('&&&&&');
    console.log(job);
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

export const SchedulerService = {
  listJobs,
  createJob,
};
