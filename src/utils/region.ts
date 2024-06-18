import { Flags } from '@oclif/core';

import { getAppVersionById } from 'services/app-versions-service';
import { checkIfAppSupportMultiRegion } from 'services/apps-service';
import { PromptService } from 'services/prompt-service';
import { Region } from 'types/general/region';
import { Permissions } from 'types/utils/permissions';
import { isPermitted } from 'utils/permissions';
import { isANumber } from 'utils/validations';

export const addRegionToQuery = (query: object | undefined, region?: Region) => {
  if (region) {
    return { ...query, region };
  }

  return query;
};

export const getRegionFromString = (region?: any): Region | undefined => {
  return region && typeof region === 'string' ? Region[region.toUpperCase() as keyof typeof Region] : undefined;
};

export const regionFlag = {
  region: Flags.string({
    char: 'z',
    description: 'Region to use',
    options: Object.values(Region),
  }),
};

export function addRegionToFlags<T>(flags: T): T {
  if (isPermitted(Permissions.MCODE_MULTI_REGION)) {
    return {
      ...flags,
      ...regionFlag,
    };
  }

  return flags;
}

const regionsPrompt = async () =>
  PromptService.promptList('Choose region', [Region.US, Region.EU, Region.AU], Region.US);

export async function chooseRegionIfNeeded(
  region?: Region,
  options?: { appId?: number; appVersionId?: number },
): Promise<Region | undefined> {
  if (region || !isPermitted(Permissions.MCODE_MULTI_REGION)) {
    return region;
  }

  const { appId, appVersionId } = options || {};

  let isMultiRegionApp = false;

  let _appId = appId;
  if (appVersionId && isANumber(appVersionId)) {
    const appVersion = await getAppVersionById(appVersionId);
    if (!appVersion) throw new Error(`AppVersion with id ${appVersionId} not found.`);
    _appId = appVersion.appId;
    if (appVersion?.mondayCodeConfig?.isMultiRegion) {
      isMultiRegionApp = true;
    }
  }

  if (!isMultiRegionApp && _appId && isANumber(_appId)) {
    const isAppSupportMultiRegion = await checkIfAppSupportMultiRegion(_appId);
    if (isAppSupportMultiRegion) {
      isMultiRegionApp = true;
    }
  }

  if (!isMultiRegionApp) {
    return region;
  }

  const returnedRegion = await regionsPrompt();
  return getRegionFromString(returnedRegion);
}
