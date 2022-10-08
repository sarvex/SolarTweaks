import { exec } from 'child_process';
import extract from 'extract-zip';
import { move } from 'fs-extra';
import fs from 'fs/promises';
import { arch, platform } from 'os';
import { join } from 'path';
import constants from '../constants';
import { downloadAndSaveFile } from './downloader';
import Logger from './logger';
const logger = new Logger('jreDownloader');

/**
 * Download and extract a Java JRE from the given manifest file
 * @param {any} _jre JRE to download
 * @returns {Promise<boolean>} True if successful
 */
export async function downloadJre(_jre) {
  let jre;
  if (platform() === 'win32') {
    arch() === 'x64' ? (jre = _jre['64']) : (jre = _jre['32']);
  } else if (platform() === 'darwin') {
    arch() === 'arm64' ? (jre = _jre['MacX64']) : (jre = _jre['MacArm']);
  } else if (platform() === 'linux') {
    arch() === 'x64' ? (jre = _jre['LinuxX64']) : (jre = _jre['LinuxArm']);
  } else {
    logger.warn(
      'Attempted to download a JRE on a non Windows, MacOS, or Linux Operating System'
    );
    return false;
  }

  if (!jre) {
    logger.error(`Failed to get JRE from JREs List for ${_jre.name}`);
    return false;
  }

  const jresPath = join(constants.SOLARTWEAKS_DIR, 'jres');
  const jrePath = join(jresPath, _jre.name);

  await fs.mkdir(jresPath).catch(() => {
    // Folder already exists, do nothing
  });

  await downloadAndSaveFile(
    jre.url,
    `${jrePath}.${jre.tar ? 'tar.gz' : 'zip'}`,
    'blob',
    jre.checksum,
    'sha256',
    true,
    true
  );

  if (jre.tar) {
    await new Promise((res) =>
      fs
        .mkdir(jrePath + '_temp')
        .then(res)
        .catch(() => {
          logger.warn('JRE Temp Path already exists, deleting...');
          fs.rmdir(jrePath + '_temp').then(res);
        })
    );
    if (
      !(await new Promise((res) =>
        exec(
          `cd ${jresPath}; tar -xzvf ${_jre.name}.tar.gz -C ${
            jrePath + '_temp'
          }`,
          async (err) => {
            if (err) {
              logger.error(`Failed to extract ${jrePath}.tar.gz`, err);
              await fs.rm(`${jrePath}.tar.gz`);
              return res(false);
            }
            res(true);
          }
        )
      ))
    )
      return false;
  } else {
    if (
      !(await new Promise((res) =>
        extract(`${jrePath}.zip`, { dir: jrePath + '_temp' })
          .then(() => res(true))
          .catch(async (err) => {
            logger.error(`Failed to extract ${jrePath}.zip`, err);
            await fs.rm(`${jrePath}.zip`);
            res(false);
          })
      ))
    )
      return false;
  }

  await move(join(jrePath + '_temp', jre.folder), jrePath, { overwrite: true });
  await fs.rmdir(jrePath + '_temp');
  await fs.rm(`${jrePath}.${jre.tar ? 'tar.gz' : 'zip'}`);

  return true;
}

/**
 * Delete a downloaded JRE
 */
export async function removeJre(jreName) {
  await fs.rm(join(constants.SOLARTWEAKS_DIR, 'jres', jreName), {
    recursive: true,
    force: true,
  });
  logger.info(`Removed JRE ${jreName}`);
}
