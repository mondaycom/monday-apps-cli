import { pbbSchemaManager } from 'services/pbb-schema-manager';
import { AppFeatureType } from 'types/services/app-features-service';

export const getValidAppFeatureTypes = (): string[] => {
  const enumTypes = Object.values(AppFeatureType) as string[];
  const pbbTypes = pbbSchemaManager.getActiveTypeNames();
  return [...new Set([...enumTypes, ...pbbTypes])];
};
