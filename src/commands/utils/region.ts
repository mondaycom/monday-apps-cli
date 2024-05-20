import { Flags } from '@oclif/core';

import { Region } from 'types/general/region';
import { Permissions } from 'types/utils/permissions';
import { isPermitted } from 'utils/permissions';

export const regionFlag = {
  region: Flags.string({
    char: 'z',
    description: 'Region to use',
    options: Object.values(Region),
  }),
};

export function addToRegionToFlags<T>(flags: T): T {
  if (isPermitted(Permissions.MULTI_REGION)) {
    return {
      ...flags,
      ...regionFlag,
    };
  }

  return flags;
}
