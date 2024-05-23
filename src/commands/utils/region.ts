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

export function addRegionToFlags<T>(flags: T): T {
  if (isPermitted(Permissions.MCODE_MULTI_REGION)) {
    return {
      ...flags,
      ...regionFlag,
    };
  }

  return flags;
}
