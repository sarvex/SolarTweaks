import { existsSync } from 'fs';
import { mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import constants from '../constants';
import store from '../store';
import { checkHash, downloadAndSaveFile } from './downloader';
import Logger from './logger';

const logger = new Logger('launcher');

/**
 * Check asset file hash + other stuff (I totally remember what I done here + I'm not lazy to read it)
 * @param {Object} metadata Metadata from Lunar's API
 * @param {string} data
 * @param {string} index
 * @returns {Promise<void>}
 */
async function checkAsset(metadata, data, index) {
  const asset = data.split('\n')[index];
  if (!/[0-9a-f]{40}/.test(asset.split(' ')[1].toLowerCase())) {
    logger.warn(`Invalid line in index file (line ${index + 1})\n${asset}`);
    return;
  }

  const path = join(constants.DOTLUNARCLIENT, 'textures', asset.split(' ')[0]);
  const sha1 = asset.split(' ')[1].toLowerCase();

  const exists = existsSync(path);
  if (exists) {
    const match = await checkHash(path, sha1, 'sha1', false);
    if (match) return;
    else
      await downloadAndSaveFile(
        metadata.textures.baseUrl + sha1,
        path,
        'blob',
        sha1,
        'sha1',
        false
      );
  } else {
    await downloadAndSaveFile(
      metadata.textures.baseUrl + sha1,
      path,
      'blob',
      sha1,
      'sha1',
      false
    );
  }
}

/**
 * Downloads Lunar Client Assets (cosmetics) with the given metadata
 * @param {Object} metadata Metadata from Lunar's API
 * @returns {Promise<void>}
 */
export async function downloadLunarAssets(metadata) {
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING LC ASSETS...',
    icon: 'fa-solid fa-folder',
  });
  return new Promise((resolve, reject) => {
    const postFolderCheck = (resolve, reject) => {
      const indexPath = join(constants.DOTLUNARCLIENT, 'launcher-cache', 'texturesIndex.txt');
      downloadAndSaveFile(
        metadata.textures.indexUrl,
        indexPath,
        'blob',
        metadata.textures.indexSha1,
        'sha1',
        true,
        true
      )
        .then(async () => {
          const data = await readFile(indexPath, 'utf8');
          const assets = data.split('\n');
          logger.info(`Checking ${assets.length} Total Assets`);
          while (assets.length) {
            const group = assets.splice(0, 2500);
            logger.info(`Checking ${group.length} Assets`);
            await Promise.all(
              group.map((i) =>
                checkAsset(metadata, data, data.split('\n').indexOf(i))
              )
            );
          }
          logger.info('Completed Checking Assets');
          resolve();
        })
        .catch(reject);
    };
    mkdir(join(constants.DOTLUNARCLIENT, 'textures'))
      .then(() => {
        postFolderCheck(resolve, reject);
      })
      .catch((error) => {
        if (error.code === 'EEXIST') postFolderCheck(resolve, reject);
        else reject(error);
      });
  });
}
