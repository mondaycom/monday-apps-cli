import { Region } from 'types/general/region';

export const queryBuilderAddRegion = (query: object | undefined, region?: Region) => {
  if (region) {
    return { ...query, region };
  }

  return query;
};
