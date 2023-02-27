import axios from 'axios';
import { execSync } from 'child_process';
import { remote } from 'electron';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { platform } from 'process';
import constants from '../constants';
import { downloadAndSaveFile } from './downloader';
import Logger from './logger';

const logger = new Logger('updater');

/**
 * Checks for updates (for the launcher)
 */
export async function checkForUpdates() {
  if (platform !== 'win32') return;

  logger.info('Checking for updates...');
  const release = await axios
    .get(`${constants.API_URL}${constants.UPDATERS.INDEX}`)
    .catch((reason) => {
      logger.throw('Failed to fetch updater index', reason);
    });

  const launcherVer = parseInt(remote.app.getVersion().replace(/[^0-9]+/g, ''));
  const latestVer = parseInt(
    release.data.index.stable.launcher.replace(/[^0-9]+/g, '')
  );

  if (launcherVer < latestVer) {
    logger.info(
      `Launcher is out of date. Latest version is ${release.data.index.stable.launcher}`
    );

    const choice = await remote.dialog.showMessageBox({
      type: 'question',
      title: 'Update available',
      message: `A new version of the launcher is available.\n\nCurrent version: ${remote.app.getVersion()}\nLatest version: ${
        release.data.index.stable.launcher
      }\n\nWould you like to update now?`,
      buttons: ['Later', 'Update'],
    });

    if (choice.response !== 1) return; // Later or closed

    remote.dialog.showMessageBox({
      type: 'info',
      title: 'Downloading update...',
      message:
        'Downloading update in the background. Please wait.\n\nThis may take a while depending on your internet speed. You can close this window and use the launcher, we will notify you when the update is ready.',
    });

    const updateReady = async () => {
      const choice2 = await remote.dialog.showMessageBox({
        type: 'question',
        title: 'Update ready',
        message: `The update is ready to be installed.`,
        buttons: ['Cancel update', 'Install update'],
      });

      if (choice2.response === 1) return true;
      else return false; // Cancel update or closed
    };

    if (platform === 'win32') {
      const filename = `launcher-${release.data.index.stable.launcher}-update-temp.exe`;
      const filePath = join(constants.SOLARTWEAKS_DIR, filename);

      await downloadAndSaveFile(
        `${constants.API_URL}${constants.UPDATERS.LAUNCHER.replace(
          '{version}',
          release.data.index.stable.launcher
        )}`,
        filePath,
        'blob'
      );

      if (!(await updateReady())) return;

      execSync(filePath);

      await unlink(filePath);
    }

    remote.app.quit();
  } else logger.info('Launcher up to date');
}
