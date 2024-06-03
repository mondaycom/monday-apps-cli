import { getIsSupportMultiRegion } from 'services/env-service';
import { Permissions } from 'types/utils/permissions';

export const isPermitted = (permission: Permissions): boolean => {
  if (!permission) {
    return false;
  }

  if (permission === Permissions.MCODE_MULTI_REGION) {
    return getIsSupportMultiRegion();
  }

  return false;
};
