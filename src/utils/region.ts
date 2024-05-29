import { Flags } from '@oclif/core';

import logger from 'src/utils/logger';
import { HttpError } from 'types/errors';
import { Region } from 'types/general/region';
import { Permissions } from 'types/utils/permissions';
import { isPermitted } from 'utils/permissions';

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
