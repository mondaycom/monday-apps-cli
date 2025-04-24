import { appSchedulerUrl } from 'src/consts/urls';
import {
  CreateJobRequest,
  CreateJobResponse,
  ListJobsResponse,
  SchedulerJob,
  UpdateJobRequest,
} from 'src/types/services/scheduler-service';

import { execute } from './api-service';
import { handleHttpErrors } from './scheduler-service.utils';
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

const deleteJob = async (appId: AppId, jobName: string): Promise<void> => {
  try {
    const path = `${appSchedulerUrl(appId)}/${jobName}`;
    const url = appsUrlBuilder(path);

    await execute({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.DELETE,
    });
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to delete scheduler job');
  }
};

const runJob = async (appId: AppId, jobName: string): Promise<void> => {
  try {
    const path = `${appSchedulerUrl(appId)}/${jobName}/run`;
    const url = appsUrlBuilder(path);

    await execute({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.POST,
    });
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to run scheduler job');
  }
};

const updateJob = async (appId: AppId, jobName: string, job: UpdateJobRequest): Promise<SchedulerJob> => {
  try {
    const path = `${appSchedulerUrl(appId)}/${jobName}`;
    const url = appsUrlBuilder(path);

    const response = await execute<CreateJobResponse>({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.PUT,
      body: job,
    });

    return response.job;
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to update scheduler job');
  }
};

export const SchedulerService = {
  listJobs,
  createJob,
  deleteJob,
  runJob,
  updateJob,
};
