import { getAppFeaturesUrl, getCreateAppFeatureReleaseUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { createAppFeatureReleaseSchema, listAppFeaturesSchema } from 'services/schemas/app-features-schemas';
import {
  AppFeature,
  BUILD_TYPES,
  CreateAppFeatureReleaseResponse,
  ListAppFeatureResponse,
} from 'src/types/services/app-features-service';
import logger from 'src/utils/logger';
import { HttpError } from 'types/errors';
import { AppId, AppVersionId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { appsUrlBuilder } from 'utils/urls-builder';

export const listAppFeaturesByAppVersionId = async (appVersionId: AppVersionId): Promise<Array<AppFeature>> => {
  try {
    const path = getAppFeaturesUrl(appVersionId);
    const url = appsUrlBuilder(path);

    const response = await execute<ListAppFeatureResponse>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      listAppFeaturesSchema,
    );

    const sortedAppFeatures = response.appFeatures?.sort((a, b) => b.id - a.id);
    return sortedAppFeatures;
  } catch (error: any) {
    if (error instanceof HttpError) {
      logger.error(error.message);
      throw error;
    }

    throw new Error('Failed to list app features.');
  }
};

const prepareReleaseByBuildType = (buildType: BUILD_TYPES, customUrl?: string) => {
  switch (buildType) {
    case BUILD_TYPES.CUSTOM_URL: {
      return {
        kind: 'iframe',
        data: {
          url: customUrl,
        },
      };
    }

    case BUILD_TYPES.MONDAY_CODE: {
      return {
        kind: 'single_build',
        appReleaseCategory: BUILD_TYPES.MONDAY_CODE,
        data: {
          url: customUrl,
        },
      };
    }

    default: {
      throw new Error('Invalid build type');
    }
  }
};

export const createAppFeatureRelease = async ({
  appId,
  appVersionId,
  appFeatureId,
  customUrl,
  buildType,
}: {
  appVersionId: AppVersionId;
  appId: AppId;
  appFeatureId: number;
  buildType: BUILD_TYPES;
  customUrl?: string;
}): Promise<AppFeature> => {
  try {
    const path = getCreateAppFeatureReleaseUrl(appId, appVersionId, appFeatureId);
    const url = appsUrlBuilder(path);
    const release = prepareReleaseByBuildType(buildType, customUrl);
    const response = await execute<CreateAppFeatureReleaseResponse>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.POST,
        body: release,
      },
      createAppFeatureReleaseSchema,
    );

    const updatedAppFeature = response.app_feature;
    return updatedAppFeature;
  } catch (error: any) {
    if (error instanceof HttpError) {
      logger.error(error.message);
      throw error;
    }

    throw new Error('Failed to list app features.');
  }
};
