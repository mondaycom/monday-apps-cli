import { appSchedulerUrl } from 'src/consts/urls';
import { execute } from 'src/services/api-service';
import { handleHttpErrors } from 'src/services/scheduler-service.utils';
import { HttpError } from 'src/types/errors';
import { AppId } from 'src/types/general';
import { Region } from 'src/types/general/region';
import { HttpMethodTypes } from 'src/types/services/api-service';
import {
  CreateJobRequest,
  CreateJobResponse,
  ListJobsResponse,
  SchedulerJob,
  UpdateJobRequest,
} from 'src/types/services/scheduler-service';
import { addRegionToQuery } from 'src/utils/region';
import { appsUrlBuilder } from 'src/utils/urls-builder';

export const listJobs = async (appId: AppId, region?: Region): Promise<SchedulerJob[]> => {
  try {
    const path = appSchedulerUrl(appId);
    const url = appsUrlBuilder(path);

    const response = await execute<ListJobsResponse>({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.GET,
      query: addRegionToQuery({}, region),
    });

    return response.jobs;
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to list scheduler jobs');
  }
};

const createJob = async (appId: AppId, job: CreateJobRequest, region?: Region): Promise<SchedulerJob> => {
  try {
    const path = appSchedulerUrl(appId);
    const url = appsUrlBuilder(path);

    const response = await execute<CreateJobResponse>({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.POST,
      body: job,
      query: addRegionToQuery({}, region),
    });

    return response.job;
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to create scheduler job');
  }
};

const deleteJob = async (appId: AppId, jobName: string, region?: Region): Promise<void> => {
  try {
    const path = `${appSchedulerUrl(appId)}/${jobName}`;
    const url = appsUrlBuilder(path);

    await execute({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.DELETE,
      query: addRegionToQuery({}, region),
    });
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to delete scheduler job');
  }
};

const runJob = async (appId: AppId, jobName: string, region?: Region): Promise<void> => {
  try {
    const path = `${appSchedulerUrl(appId)}/${jobName}/run`;
    const url = appsUrlBuilder(path);

    await execute({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.POST,
      query: addRegionToQuery({}, region),
    });
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to run scheduler job');
  }
};

const updateJob = async (
  appId: AppId,
  jobName: string,
  job: UpdateJobRequest,
  region?: Region,
): Promise<SchedulerJob> => {
  try {
    const path = `${appSchedulerUrl(appId)}/${jobName}`;
    const url = appsUrlBuilder(path);

    const response = await execute<CreateJobResponse>({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.PUT,
      body: job,
      query: addRegionToQuery({}, region),
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
