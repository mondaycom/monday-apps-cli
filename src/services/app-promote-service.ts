import { ListrTaskWrapper } from 'listr2';

import { DEFAULT_DELAY_POLLING_MS } from 'consts/app-promote';
import { APP_VERSION_STATUS } from 'consts/app-versions';
import { promoteAppUrl, pullPromoteStatusUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { PromoteCommandTasksContext } from 'types/commands/promote';
import { HttpMethodTypes } from 'types/services/api-service';
import { PromoteStatusResponse } from 'types/services/promote-service';
import logger from 'utils/logger';
import { TIME_IN_MILLISECONDS, sleep } from 'utils/time-utils';
import { appsUrlBuilder } from 'utils/urls-builder';

import { PromptService } from './prompt-service';

export const shouldPromoteLatestDraftVersion = async () => {
  const PROMOTE_LATEST_DRAFT_VERSION = 'Promote the latest draft version';
  const CHOOSE_VERSION = 'Choose a specific version to promote';
  const userChoice = await PromptService.promptList(
    'How would you like to promote the app?',
    [PROMOTE_LATEST_DRAFT_VERSION, CHOOSE_VERSION],
    PROMOTE_LATEST_DRAFT_VERSION,
  );
  return userChoice === PROMOTE_LATEST_DRAFT_VERSION;
};

export const promoteAppTask = async (ctx: PromoteCommandTasksContext): Promise<void> => {
  const { appId, appVersionId } = ctx;
  const path = promoteAppUrl(appId);
  const url = appsUrlBuilder(path);

  const response = await execute({
    url,
    headers: { Accept: 'application/json' },
    method: HttpMethodTypes.POST,
    body: { ...(appVersionId && { appVersionId: appVersionId.toString() }) },
  });
  const location = response.headers.location as string;
  const retryAfter = response.headers['retry-after'];
  if (!location) {
    logger.error(
      'The promotion was triggered, ' +
        'but we encountered an issue and are unable to display the promotion status. ' +
        `Please use the following command to check the application status: mapps app-version:list -i ${appId}`,
    );
    throw new Error('Invalid response headers');
  }

  ctx.retryAfter = Number(retryAfter) || DEFAULT_DELAY_POLLING_MS / TIME_IN_MILLISECONDS.SECOND;
  ctx.urlToPull = appsUrlBuilder(pullPromoteStatusUrl(location));
};

const fetchPromotionStatus = async (urlToPull: string): Promise<PromoteStatusResponse> => {
  return execute<PromoteStatusResponse>({
    url: urlToPull,
    headers: { Accept: 'application/json' },
    method: HttpMethodTypes.GET,
  });
};

const handleStatusUpdate = (
  task: ListrTaskWrapper<PromoteCommandTasksContext, any>,
  status: APP_VERSION_STATUS,
): void => {
  switch (status) {
    case APP_VERSION_STATUS.DRAFT: {
      task.title = 'Failed to promote the app, rolling back to a draft version';
      process.exit(1);
      break;
    }

    case APP_VERSION_STATUS.PROMOTING: {
      task.title = 'Promoting app...';
      task.output = `App is still in ${status} status`;
      break;
    }

    case APP_VERSION_STATUS.LIVE: {
      task.title = 'App promoted successfully';
      task.output = `App is now in ${status} status`;
      process.exit(0);
      break;
    }
  }
};

const pollPromotionStatus = async (
  urlToPull: string,
  task: ListrTaskWrapper<PromoteCommandTasksContext, any>,
): Promise<void> => {
  const response = await fetchPromotionStatus(urlToPull);
  handleStatusUpdate(task, response.status);
  await sleep(DEFAULT_DELAY_POLLING_MS);
  return pollPromotionStatus(urlToPull, task);
};

export const pullPromoteStatusTask = async (
  ctx: PromoteCommandTasksContext,
  task: ListrTaskWrapper<PromoteCommandTasksContext, any>,
): Promise<void> => {
  const { urlToPull, retryAfter } = ctx;
  await sleep(retryAfter! * TIME_IN_MILLISECONDS.SECOND);
  await pollPromotionStatus(urlToPull!, task);
};
