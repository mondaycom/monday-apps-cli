import { Region } from 'types/general/region';

export const addRegionToQuery = (query: object | undefined, region?: Region) => {
  if (region) {
    return { ...query, region };
  }

  return query;
};

export const getRegionFromString = (region?: any): Region | undefined => {
  return region && typeof region === 'string' ? Region[region.toUpperCase() as keyof typeof Region] : undefined;
};
