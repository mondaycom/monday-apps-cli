import updateNotifier from 'update-notifier';
import argsParser from 'args-parser';
import pkg from './minimal-package.js';
import { spawn } from 'node:child_process';
import chalk from 'chalk';

const AUTO_UPDATE_FLAGS = ['u', 'update'];
const UPDATE_FLAG_REGEX = new RegExp(`^-{1,2}(${AUTO_UPDATE_FLAGS.join('|')})$`);
const VERSION_CHANGE_TYPES = {
  MAJOR: 'major',
  MINOR: 'minor',
  PATCH: 'patch',
};
const VERSION_WHICH_DEMAND_AN_UPDATE = [VERSION_CHANGE_TYPES.MAJOR];

function removeUpdateFlagIfNeeded() {
  const regex = new RegExp(UPDATE_FLAG_REGEX);
  process.argv
    .filter(arg => regex.test(arg))
    .forEach(arg => {
      const updateArgIndex = process.argv.indexOf(arg);
      process.argv.splice(updateArgIndex, 1);
    });
}

function withAutoUpdateFlag() {
  const args = argsParser(process.argv);
  return AUTO_UPDATE_FLAGS.some(updateFlag => !!args[updateFlag]);
}

function autoInstallGlobalPackage(packageName) {
  return new Promise((resolve, reject) => {
    const child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install', '-g', packageName], {
      stdio: 'inherit',
    });
    child.on('error', err => {
      reject(err);
    });
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Failed to install package with. Process exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

export async function handlePackageVersionUpdate() {
  try {
    const notifier = updateNotifier({
      pkg,
      shouldNotifyInNpmScript: true,
      isGlobal: true,
    });
    notifier.update = await notifier.fetchInfo();

    const shouldAutoUpdate =
      withAutoUpdateFlag() &&
      [VERSION_CHANGE_TYPES.PATCH, VERSION_CHANGE_TYPES.MINOR, VERSION_CHANGE_TYPES.MAJOR].includes(
        notifier.update.type,
      );
    if (shouldAutoUpdate) {
      console.log(`Auto updating to latest version - ${notifier.update.latest}`);
      await autoInstallGlobalPackage(pkg.name);

      // skip notify message & continue with command
      notifier.update.type = '';
    }
    removeUpdateFlagIfNeeded();

    if (!!notifier.update.type) {
      const isUpdateRequired = VERSION_WHICH_DEMAND_AN_UPDATE.includes(notifier.update.type);
      notifier.notify({
        defer: false,
        isGlobal: true,
        message: `${isUpdateRequired ? 'Required u' : 'U'}pdate available ${chalk.dim(
          notifier.update.current,
        )} → ${chalk.green(notifier.update.latest)} 
        Please run ${chalk.cyan('npm i -g @mondaycom/apps-cli')} to update
        To update automatically, run ${chalk.cyan('mapps -u <YOUR_COMMAND>')}`,
      });
      if (VERSION_WHICH_DEMAND_AN_UPDATE.includes(notifier.update.type)) {
        process.exit(0);
      }
    }
  } catch (err) {
    console.log(`Failed to check version in the NPM repository. error: ${err.message}`);
  }
}
