import { listAppVersionsByAppId } from 'services/app-versions-service';
import { listApps } from 'services/apps-service';
import { PromptService } from 'services/prompt-service';

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

  async chooseAppVersion(appId: number) {
    const appVersions = await listAppVersionsByAppId(appId);
    const appVersionChoicesMap: Record<string, number> = {};
    for (const appVersion of appVersions) {
      appVersionChoicesMap[`${appVersion.versionNumber} | ${appVersion.status} | ${appVersion.name}`] = appVersion.id;
    }

    const selectedAppVersionKey = await PromptService.promptSelectionWithAutoComplete<string>(
      'Select an app version',
      Object.keys(appVersionChoicesMap),
    );

    const selectedAppVersionId = appVersionChoicesMap[selectedAppVersionKey];
    return selectedAppVersionId;
  },

  async chooseAppAndAppVersion() {
    const appId = await this.chooseApp();
    const appVersionId = await this.chooseAppVersion(appId);
    return { appId, appVersionId };
  },
};
