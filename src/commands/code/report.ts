import fs from 'node:fs';
import path from 'node:path';

import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { StatusCodes } from 'http-status-codes';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER, SECURITY_SCAN_FEEDBACK_MESSAGE, VAR_UNKNOWN } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { getDeploymentSecurityScan } from 'services/push-service';
import { HttpError } from 'types/errors';
import { SecurityScanResponse, SecurityScanResult } from 'types/services/push-service';
import logger from 'utils/logger';
import { addRegionToFlags, chooseRegionIfNeeded, getRegionFromString } from 'utils/region';

const DEBUG_TAG = 'code_report';

const printSecurityScanSummary = (securityScanResults: SecurityScanResult) => {
  const { summary, timestamp, version } = securityScanResults;

  logger.log(`\nSecurity Scan Report (v${version})`);
  logger.log(`Scan timestamp: ${timestamp}\n`);

  const errors = chalk.red(`✖ ${summary.error} errors`);
  const warnings = chalk.yellow(`▲ ${summary.warning} warnings`);
  const notes = chalk.cyan(`ℹ ${summary.note} info`);

  logger.log(`Total findings: ${summary.total}`);
  logger.log(`${errors}\t${warnings}\t${notes}\n`);
};

const writeResultsToFile = (
  securityScanResults: SecurityScanResult,
  appVersionId: number,
  outputDir?: string,
): string => {
  const timestamp = new Date().toISOString().split('.')[0].replaceAll(':', '-');
  const fileName = `security-scan-${appVersionId}-${timestamp}.json`;
  const directory = outputDir || process.cwd();
  const filePath = path.join(directory, fileName);

  fs.writeFileSync(filePath, JSON.stringify(securityScanResults, null, 2), 'utf8');

  return filePath;
};

export default class Report extends AuthenticatedCommand {
  static description = 'Get security scan report for a monday-code deployment.';

  static examples = [
    '<%= config.bin %> <%= command.id %> -i APP_VERSION_ID',
    '<%= config.bin %> <%= command.id %> -i APP_VERSION_ID -o',
    '<%= config.bin %> <%= command.id %> -i APP_VERSION_ID -o -d /path/to/directory',
  ];

  static flags = Report.serializeFlags(
    addRegionToFlags({
      appVersionId: Flags.integer({
        char: 'i',
        aliases: ['v'],
        description: APP_VERSION_ID_TO_ENTER,
      }),
      output: Flags.boolean({
        char: 'o',
        description: 'Save the full report to a JSON file',
        default: false,
      }),
      outputDir: Flags.string({
        char: 'd',
        description: 'Directory to save the report file (requires -o flag)',
        dependsOn: ['output'],
      }),
    }),
  );

  public async run(): Promise<void> {
    const { flags } = await this.parse(Report);
    const { region: strRegion, output, outputDir } = flags;
    const region = getRegionFromString(strRegion);
    let appVersionId = flags.appVersionId;

    try {
      if (!appVersionId) {
        const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion(true, true);
        appVersionId = appAndAppVersion.appVersionId;
      }

      const selectedRegion = await chooseRegionIfNeeded(region, { appVersionId });

      this.preparePrintCommand(this, { appVersionId });

      logger.debug(`Fetching security scan results for appVersionId: ${appVersionId}`, DEBUG_TAG);

      const response: SecurityScanResponse = await getDeploymentSecurityScan(appVersionId, selectedRegion);

      if (!response.securityScanResults) {
        logger.log('\nNo security scan results available for this deployment.');
        logger.log('Security scans are performed when deploying with the --security-scan (-s) flag.');
        return;
      }

      printSecurityScanSummary(response.securityScanResults);

      if (output) {
        const filePath = writeResultsToFile(response.securityScanResults, appVersionId, outputDir);
        logger.log(`Full report saved to: ${filePath}`);
      } else {
        logger.log('Use the -o flag to save the full report to a JSON file.');
      }

      logger.log(chalk.cyan(`\n${SECURITY_SCAN_FEEDBACK_MESSAGE}`));
    } catch (error: unknown) {
      logger.debug({ res: error }, DEBUG_TAG);
      if (error instanceof HttpError) {
        if (error.code === StatusCodes.NOT_FOUND) {
          logger.error(`No deployment found for provided app version id - "${appVersionId || VAR_UNKNOWN}"`);
        } else if (error.code === 400) {
          logger.error(error.message);
        } else {
          logger.error(`Failed to fetch security scan report: ${error.message}`);
        }
      } else {
        logger.error(
          `An unknown error happened while fetching security scan report for app version id - "${
            appVersionId || VAR_UNKNOWN
          }"`,
        );
      }

      process.exit(1);
    }
  }
}
