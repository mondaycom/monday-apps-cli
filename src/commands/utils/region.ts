import { Flags } from '@oclif/core';

import { getAppVersionById } from 'services/app-versions-service';
import { checkIfAppSupportMultiRegion } from 'services/apps-service';
import { PromptService } from 'services/prompt-service';
import { Region } from 'types/general/region';
import { getRegionFromString } from 'utils/region';
import { isANumber } from 'utils/validations';

export const regionFlag = {
  region: Flags.string({
    char: 'z',
    description: 'Region to use',
    options: Object.values(Region),
  }),
};

const regionsPrompt = async () =>
  PromptService.promptList('Choose region', [Region.US, Region.EU, Region.AU], Region.US);

export async function chooseRegionIfNeeded(
  region?: Region,
  options?: { appId?: number; appVersionId?: number },
): Promise<Region | undefined> {
  if (region) {
    return region;
  }

  const { appId, appVersionId } = options || {};

  let isMultiRegionApp = false;
  if (appId && isANumber(appId)) {
    const isAppSupportMultiRegion = await checkIfAppSupportMultiRegion(appId);
    if (isAppSupportMultiRegion) {
      isMultiRegionApp = true;
    }
  }

  if (!isMultiRegionApp && appVersionId && isANumber(appVersionId)) {
    const appVersion = await getAppVersionById(appVersionId);
    if (!appVersion) throw new Error(`AppVersion with id ${appVersionId} not found.`);
    if (appVersion?.mondayCodeConfig?.isMultiRegion) {
      isMultiRegionApp = true;
    } else {
      const isAppSupportMultiRegion = await checkIfAppSupportMultiRegion(appVersion.appId);
      if (isAppSupportMultiRegion) {
        isMultiRegionApp = true;
      }
    }
  }

  if (!isMultiRegionApp) {
    return region;
  }

  const returnedRegion = await regionsPrompt();
  return getRegionFromString(returnedRegion);
}
