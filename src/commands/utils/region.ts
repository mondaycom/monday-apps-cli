import { Flags } from '@oclif/core';

// import { checkIfAppSupportMultiRegion, listApps } from 'services/apps-service';
import { PromptService } from 'services/prompt-service';
import { Region } from 'types/general/region';
import { Permissions } from 'types/utils/permissions';
import { isPermitted } from 'utils/permissions';
import { getRegionFromString } from 'utils/region';
// import { isANumber } from 'utils/validations';

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
  if (region) {
    return region;
  }

  console.log({ options });
  const returnedRegion = await regionsPrompt();
  return getRegionFromString(returnedRegion);
  //
  // let isMultiRegionApp = false;
  // if (isANumber(options?.appId)) {
  //   const isAppSupportMultiRegion = await checkIfAppSupportMultiRegion(options?.appId);
  //   if (isAppSupportMultiRegion) {
  //     isMultiRegionApp = true;
  //   }
  // }
  //
  // if (!isMultiRegionApp) {
  //   isMultiRegionApp = true;
  // }
  //
  // if (!isMultiRegionApp) {
  //   return region;
  // }
  //
}
