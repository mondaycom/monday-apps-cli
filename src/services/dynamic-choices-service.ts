import { APP_TEMPLATES_CONFIG } from 'consts/app-templates-config';
import { APP_VERSION_STATUS } from 'consts/app-versions';
import { listAppBuilds } from 'services/app-builds-service';
import { listAppFeaturesByAppVersionId } from 'services/app-features-service';
import { defaultVersionByAppId, listAppVersionsByAppId } from 'services/app-versions-service';
import { listApps } from 'services/apps-service';
import { PromptService } from 'services/prompt-service';
import { LIVE_VERSION_ERROR_LOG } from 'src/consts/messages';
import { AppId } from 'src/types/general';
import { Region } from 'src/types/general/region';
import { AppFeature, AppFeatureType } from 'src/types/services/app-features-service';

import { SchedulerService } from './scheduler-service';

export const DynamicChoicesService = {
  async chooseApp() {
    const apps = await listApps();
    const appChoicesMap: Record<string, number> = {};
    for (const app of apps) {
      appChoicesMap[`${app.id} | ${app.name}`] = app.id;
    }

    const selectedAppKey = await PromptService.promptSelectionWithAutoComplete<string>(
      'Select an app',
      Object.keys(appChoicesMap),
    );

    const selectedAppId = appChoicesMap[selectedAppKey];
    return selectedAppId;
  },

  async chooseAppVersion(appId: number, filterByStatus?: APP_VERSION_STATUS[]) {
    let appVersions = await listAppVersionsByAppId(appId);
    if (filterByStatus) {
      appVersions = appVersions.filter(appVersion => filterByStatus.includes(appVersion.status));
    }

    const appVersionChoicesMap: Record<string, number> = {};
    for (const appVersion of appVersions) {
      appVersionChoicesMap[
        `${appVersion.id} | ${appVersion.versionNumber} | ${appVersion.name} | ${appVersion.status}`
      ] = appVersion.id;
    }

    const selectedAppVersionKey = await PromptService.promptSelectionWithAutoComplete<string>(
      'Select an app version',
      Object.keys(appVersionChoicesMap),
    );

    const selectedAppVersionId = appVersionChoicesMap[selectedAppVersionKey];
    return selectedAppVersionId;
  },

  async chooseAppAndAppVersion(
    useDeprecatedVersion: boolean,
    useLiveVersion: boolean,
    options?: { appId?: number; autoSelectVersion?: boolean },
  ) {
    const { appId, autoSelectVersion = false } = options || {};
    const filterByStatus = [APP_VERSION_STATUS.DRAFT];
    if (useDeprecatedVersion) filterByStatus.push(APP_VERSION_STATUS.DEPRECATED);
    if (useLiveVersion) filterByStatus.push(APP_VERSION_STATUS.LIVE);

    if (appId && autoSelectVersion) {
      const defaultVersion = await defaultVersionByAppId(appId, {
        customLogMessage: LIVE_VERSION_ERROR_LOG,
        useLiveVersion,
      });
      if (!defaultVersion) throw new Error(`No default version found for app id - ${appId}`);

      return { appId, appVersionId: defaultVersion.id };
    }

    const chosenAppId = appId || (await this.chooseApp());
    const appVersionId = await this.chooseAppVersion(chosenAppId, filterByStatus);
    return { appId: chosenAppId, appVersionId };
  },

  async chooseAppFeatureType(excludeTypes?: AppFeatureType[]) {
    const featureTypes = Object.values(AppFeatureType);
    const featureTypeChoicesMap: Record<string, AppFeatureType> = {};
    for (const featureType of featureTypes) {
      if (excludeTypes?.includes(featureType)) continue;
      featureTypeChoicesMap[featureType] = featureType;
    }

    const selectedFeatureTypeKey = await PromptService.promptSelectionWithAutoComplete<string>(
      'Select a feature type',
      Object.keys(featureTypeChoicesMap),
    );

    const selectedFeatureType = featureTypeChoicesMap[selectedFeatureTypeKey];
    return selectedFeatureType;
  },

  async chooseBuild(appVersionId: number) {
    const appReleases = await listAppBuilds(appVersionId);
    const appReleaseChoicesMap: Record<string, number> = {};

    for (const appRelease of appReleases) {
      appReleaseChoicesMap[`${appRelease.id} | ${appRelease.category} | | ${appRelease.data?.url || ' '}`] =
        appRelease.id;
    }

    const selectedAppReleaseKey = await PromptService.promptSelectionWithAutoComplete<string>(
      'Select a build',
      Object.keys(appReleaseChoicesMap),
    );

    const selectedAppReleaseId = appReleaseChoicesMap[selectedAppReleaseKey];
    return selectedAppReleaseId;
  },

  async chooseAppFeature(
    appVersionId: number,
    options?: { excludeTypes?: AppFeatureType[]; includeTypes?: AppFeatureType[] },
  ) {
    const appFeatures = await listAppFeaturesByAppVersionId(appVersionId, options);
    const appFeatureChoicesMap: Record<string, AppFeature> = {};

    for (const appFeature of appFeatures) {
      appFeatureChoicesMap[`${appFeature.id} | ${appFeature.name} | ${appFeature.type}`] = appFeature;
    }

    const selectedAppFeatureKey = await PromptService.promptSelectionWithAutoComplete<string>(
      'Select an app feature',
      Object.keys(appFeatureChoicesMap),
    );

    return appFeatureChoicesMap[selectedAppFeatureKey];
  },

  async chooseAppTemplate() {
    const selectedTemplateName = await PromptService.promptSelectionWithAutoComplete(
      'Select a template to start with',
      APP_TEMPLATES_CONFIG.map(template => template.name),
    );
    return APP_TEMPLATES_CONFIG.find(template => template.name === selectedTemplateName)!;
  },

  async chooseSchedulerJob(appId: AppId, region?: Region) {
    const jobs = await SchedulerService.listJobs(appId, region);
    const jobChoicesMap: Record<string, string> = {};
    for (const job of jobs) {
      jobChoicesMap[`${job.name} (${job.targetUrl})`] = job.name;
    }

    const selectedJobKey = await PromptService.promptSelectionWithAutoComplete<string>(
      'Select a job',
      Object.keys(jobChoicesMap),
    );

    const selectedJobName = jobChoicesMap[selectedJobKey];
    return selectedJobName;
  },
};
