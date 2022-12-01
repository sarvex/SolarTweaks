import axios from 'axios';
import settings from 'electron-settings';
import { rm, stat, writeFile } from 'fs/promises';
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

  logger.debug('Clearing past config.example.json and metadata.json files...');
  await Promise.all([
    rm(configExamplePath).catch(() => {}),
    rm(metadataPath).catch(() => {}),
  ]);
  logger.debug('Updating config.example.json and metadata.json files...');
  await Promise.all([
    downloadAndSaveFile(
      constants.ENGINE.CONFIG_EXAMPLE_URL,
      configExamplePath,
      'text'
    )
      .then(() => logger.debug('Updated config.example.json file'))
      .catch((err) =>
        logger.throw('Failed to download Config Example file', err)
      ),

    downloadAndSaveFile(constants.ENGINE.METADATA_URL, metadataPath, 'text')
      .then(() => logger.debug('Updated metadata.json file'))
      .catch((err) => logger.throw('Failed to download Metadata file', err)),
  ]);

  const release = await axios
    .get(`${constants.API_URL}${constants.UPDATERS.INDEX}`)
    .catch((reason) => {
      logger.throw('Failed to fetch updater index', reason);
    });
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
    !(await stat(configExamplePath).catch(() => false)) || // Config Example doesn't exist, download
    !(await stat(metadataPath).catch(() => false)) || // Metadata doesn't exist, download
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
    await settings.set('engineVersion', release.data.index.stable.engine);
  }
}
