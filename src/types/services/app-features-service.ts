import { z } from 'zod';

import {
  appFeatureSchema,
  createAppFeatureReleaseSchema,
  listAppFeaturesSchema,
} from 'src/services/schemas/app-features-schemas';

export type AppFeature = z.infer<typeof appFeatureSchema>;
export type ListAppFeatureResponse = z.infer<typeof listAppFeaturesSchema>;
export type CreateAppFeatureReleaseResponse = z.infer<typeof createAppFeatureReleaseSchema>;

export enum BUILD_TYPES {
  CUSTOM_URL = 'custom_url',
  MONDAY_CODE = 'monday_code',
  MONDAY_CODE_CDN = 'monday_code_cdn',
}

export enum AppReleaseSingleBuildCategory {
  MondayCode = 'monday_code',
  view = 'view',
}

export enum AppFeatureType {
  AppFeatureOauth = 'AppFeatureOauth',
  AppFeatureBoardView = 'AppFeatureBoardView',
  AppFeatureIntegration = 'AppFeatureIntegration',
  AppFeatureSolution = 'AppFeatureSolution',
  AppFeatureItemView = 'AppFeatureItemView',
  AppFeatureDashboardWidget = 'AppFeatureDashboardWidget',
  AppFeatureAccountSettingsView = 'AppFeatureAccountSettingsView',
  AppFeatureDocActions = 'AppFeatureDocActions',
  AppFeatureObject = 'AppFeatureObject',
  AppFeatureWorkspaceView = 'AppFeatureWorkspaceView',
  AppFeatureAI = 'AppFeatureAI',
  AppFeatureAiBoardMainMenuHeader = 'AppFeatureAiBoardMainMenuHeader',
  AppFeatureAiItemUpdateActions = 'AppFeatureAiItemUpdateActions',
  AppFeatureAiDocSlashCommand = 'AppFeatureAiDocSlashCommand',
  AppFeatureAiDocContextualMenu = 'AppFeatureAiDocContextualMenu',
  AppFeatureAiDocQuickStart = 'AppFeatureAiDocQuickStart',
  AppFeatureAiDocTopBar = 'AppFeatureAiDocTopBar',
  AppFeatureColumnTemplate = 'AppFeatureColumnTemplate',
  AppFeatureAiIcAssistantHelpCenter = 'AppFeatureAiIcAssistantHelpCenter',
  AppFeatureAppWizard = 'AppFeatureAppWizard',
  AppFeatureGroupMenuAction = 'AppFeatureGroupMenuAction',
  AppFeatureItemMenuAction = 'AppFeatureItemMenuAction',
  AppFeatureNotificationKind = 'AppFeatureNotificationKind',
  AppFeatureBlock = 'AppFeatureBlock',
  AppFeatureItemBatchAction = 'AppFeatureItemBatchAction',
  AppFeatureAiFormula = 'AppFeatureAiFormula',
  AppFeatureAiItemEmailsAndActivitiesActions = 'AppFeatureAiItemEmailsAndActivitiesActions',
  AppFeatureFieldType = 'AppFeatureFieldType',
  AppFeatureProduct = 'AppFeatureProduct',
}
