import axios from 'axios';
import settings from 'electron-settings';
import { stat, writeFile } from 'fs/promises';
import { join } from 'path';
import constants from '../constants';
import { downloadAndSaveFile } from '../javascript/downloader';
import Logger from '../javascript/logger';

const logger = new Logger('Engine');

/**
 * Verify the Engine and all files it needs exist
 * @returns {Promise<void>}
 */
export async function verifyEngine() {
  const enginePath = join(constants.SOLARTWEAKS_DIR, constants.ENGINE.ENGINE);
  const configExamplePath = join(
    constants.SOLARTWEAKS_DIR,
    constants.ENGINE.CONFIG_EXAMPLE
  );
  const metadataPath = join(
    constants.SOLARTWEAKS_DIR,
    constants.ENGINE.METADATA
  );
  const configPath = join(constants.SOLARTWEAKS_DIR, constants.ENGINE.CONFIG);

  logger.debug('Verifying Config Exists...');
  await stat(configPath).catch(
    async () => await writeFile(configPath, '{}', 'utf-8')
  );

  logger.debug('Fetching Updater Index');
  const release = await axios
    .get(`${constants.API_URL}${constants.UPDATERS.INDEX}`)
    .catch((reason) => {
      logger.throw('Failed to Fetch Updater Index', reason);
    });

  await Promise.all([
    await axios
      .get(
        `${constants.API_URL}${constants.UPDATERS.CONFIG_EXAMPLE.replace(
          '{version}',
          release?.data?.index?.stable?.config ?? 'example'
        )}`
      )
      .then((res) => {
        logger.debug(`Fetched Config Example:`, res.data);
        if (res.status == 200)
          return writeFile(
            configExamplePath,
            JSON.stringify(res.data),
            'utf-8'
          );
      })
      .catch((err) => logger.throw('Failed to Fetch Config Example:', err)),
    await axios
      .get(
        `${constants.API_URL}${constants.UPDATERS.METADATA.replace(
          '{version}',
          release?.data?.index?.stable?.metadata ?? '1.0.0'
        )}`
      )
      .then((res) => {
        logger.debug(`Fetched Metadata:`, res.data);
        if (res.status == 200)
          return writeFile(metadataPath, JSON.stringify(res.data), 'utf-8');
      })
      .catch((err) => logger.throw('Failed to Fetch Metadata:', err)),
  ]);

  if (!release) return;

  const newest = release.data.index.stable.engine;
  if (!newest)
    return logger.throw(
      'Unable to get newest engine version from data',
      JSON.stringify(release.data)
    );
  const current = await settings.get('engineVersion');
  // Check if file solar-engine.jar exists
  if (
    !current || // Not installed (first usage)
    !(await stat(enginePath).catch(() => false)) || // Engine doesn't exist, download
    newest !== current // Out of Date
  ) {
    logger.info(
      `Downloading Engine v${newest}, current is ${
        current ? `v${current}` : '"not installed"'
      }...`
    );
    await downloadAndSaveFile(
      `${constants.API_URL}${constants.UPDATERS.ENGINE.replace(
        '{version}',
        newest
      )}`,
      enginePath,
      'blob'
    ).catch((err) => logger.throw('Failed to download Engine', err));
    if (current && newest) {
      if (!current.toString().startsWith(newest.toString().charAt(0)))
        await writeFile(configPath, '{}', 'utf-8');
    } else if (!current) await writeFile(configPath, '{}', 'utf-8');
    await settings.set('engineVersion', release.data.index.stable.engine);
  }
}
