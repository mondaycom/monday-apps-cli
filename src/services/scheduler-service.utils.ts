import { StatusCodes } from 'http-status-codes';

import { SchedulerJob } from 'src/types/services/scheduler-service';
import { isDefinedAndNotEmpty } from 'src/utils/validations';
import logger from 'utils/logger';

import { HttpError } from '../types/errors';

export const printJobs = (jobs: SchedulerJob[]): void => {
  if (jobs.length === 0) {
    logger.log('No scheduler jobs found.');
    return;
  }

  logger.table(jobs);
};

export const validateCronExpression = (schedule: string | undefined): void => {
  if (!isDefinedAndNotEmpty(schedule)) {
    throw new Error('Cron expression is required');
  }

  const cronRegex =
    // eslint-disable-next-line unicorn/better-regex -- matching the backend regex which is correct and more strict in its format
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-1])|(\*\/([0-9]|1[0-9]|2[0-9]|3[0-1]))) (\*|([0-9]|1[0-9]|2[0-3])|(\*\/([0-9]|1[0-9]|2[0-3]))) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|(\*\/([1-9]|1[0-9]|2[0-9]|3[0-1]))) (\*|([1-9]|1[0-2])|(\*\/([1-9]|1[0-2]))) (\*|([0-6])|(\*\/([0-6])))$/;
  if (!cronRegex.test(schedule)) {
    throw new Error('Invalid cronjob schedule format');
  }
};

export const validateTargetUrl = (targetUrl: string | undefined): void => {
  if (!targetUrl) {
    throw new Error('Target URL is required');
  }

  if (!targetUrl.startsWith('/')) {
    throw new Error('Target URL must start with a slash');
  }

  // validate that the value after / is not an empty string
  if (targetUrl.split('/')[1] === '') {
    throw new Error('Target URL must not be empty');
  }
};

export const handleHttpErrors = (error: HttpError) => {
  switch (error.code) {
    case StatusCodes.NOT_FOUND: {
      throw new Error('monday-code deployment not found for the requested app');
    }

    case StatusCodes.FORBIDDEN: {
      throw new Error('You are not authorized to access the requested app');
    }

    case StatusCodes.BAD_REQUEST: {
      throw new Error('Invalid request');
    }

    case StatusCodes.INTERNAL_SERVER_ERROR: {
      throw new Error('Internal server error');
    }

    default: {
      throw new Error('Unknown error');
    }
  }
};
