import { Permissions } from 'types/utils/permissions';

export const isPermitted = (permission: Permissions): boolean => {
  if (!permission) {
    return false;
  }

  // add granular permission check here

  return false;
};
