import { exec } from 'child_process';
import extract from 'extract-zip';
import { existsSync } from 'fs';
import { move } from 'fs-extra';
import { mkdir, readdir, rm, rmdir } from 'fs/promises';
import { arch, platform } from 'os';
import { join } from 'path';
import constants from '../constants';
import { downloadAndSaveFile } from './downloader';
import Logger from './logger';
const logger = new Logger('jreDownloader');

/**
 * Download and extract a Java JRE from the given manifest file
 * @typedef {{url: string, checksum: string, folder?: string, tar?: boolean}} JREPlatform
 * @param {{
 *  name: string,
 *  32: JREPlatform,
 *  64: JREPlatform,
 *  MacArm: JREPlatform,
 *  MacX64: JREPlatform,
 *  LinuxArm: JREPlatform,
 *  LinuxX64: JREPlatform
 * }} _jre JRE to download
 * @returns {Promise<boolean>} True if successful
 */
export async function downloadJre(_jre) {
  /** @type {JREPlatform} */
  let jre;
  /** @type {'aix' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32'} */
  const plat = platform();
  /** @type {'arm' | 'arm64' | 'ia32' | 'mips' | 'mipsel' | 'ppc' | 'ppc64' | 's390' | 's390x' | 'x64'} */
  const a = arch();
  if (plat === 'win32') {
    jre = _jre[a === 'x64' ? '64' : '32'];
  } else if (plat === 'darwin') {
    jre = _jre[a === 'x64' ? 'MacX64' : 'MacArm'];
  } else if (plat === 'linux') {
    jre = _jre[a === 'x64' ? 'LinuxX64' : 'LinuxArm'];
  } else {
    logger.warn(
      'Attempted to download a JRE on a non Windows, MacOS, or Linux Operating System!'
    );
    return false;
  }

  if (!jre) {
    logger.throw(
      `Failed to get JRE from JREs List for ${_jre.name}`,
      JSON.stringify(_jre)
    );
    return false;
  }

  const jresPath = join(constants.SOLARTWEAKS_DIR, 'jres');
  const jrePath = join(jresPath, _jre.name);

  await mkdir(jresPath).catch(() => {
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

  await rmdir(jrePath).catch(() => {
    // Folder doesn't exist, do nothing
  });
  await rmdir(jrePath + '_temp').catch(() => {
    // Folder doesn't exist, do nothing
  });

  if (jre.tar) {
    await new Promise((res) =>
      mkdir(jrePath + '_temp')
        .then(res)
        .catch(async () => {
          logger.info('JRE Temp Path already exists, clearing...');
          await rm(jrePath + '_temp', {
            recursive: true,
          });
          await mkdir(jrePath + '_temp', {
            recursive: true,
          });
        })
    );
    if (
      !(await new Promise((res) =>
        exec(
          `tar -xzvf ${jrePath}.tar.gz -C ${jrePath + '_temp'}`,
          async (err) => {
            if (err) {
              logger.throw(`Failed to extract ${jrePath}.tar.gz`, err);
              await rm(`${jrePath}.tar.gz`);
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
            logger.throw(`Failed to extract ${jrePath}.zip`, err);
            await rm(`${jrePath}.zip`);
            res(false);
          })
      ))
    )
      return false;
  }

  let jreFolder = (await readdir(join(jrePath + '_temp')))?.[0] || jre.folder;
  if (!jreFolder) {
    logger.error(
      `Failed to find JRE directory in \`.lunarclient/solartweaks/jres/${jrePath}_temp\``
    );
    await rmdir(jrePath + '_temp', {
      recursive: true,
    });
    await rm(`${jrePath}.${jre.tar ? 'tar.gz' : 'zip'}`);
    return false;
  }
  if (existsSync(join(jrePath + '_temp', jreFolder, 'Contents')))
    jreFolder = join(jreFolder, '/Contents/Home');
  await move(join(jrePath + '_temp', jreFolder), jrePath, { overwrite: true });
  await rmdir(jrePath + '_temp', {
    recursive: true,
  });
  await rm(`${jrePath}.${jre.tar ? 'tar.gz' : 'zip'}`);

  return true;
}

/**
 * Delete a downloaded JRE
 */
export async function removeJre(jreName) {
  await rm(join(constants.SOLARTWEAKS_DIR, 'jres', jreName), {
    recursive: true,
    force: true,
  });
  logger.info(`Removed JRE ${jreName}`);
}
