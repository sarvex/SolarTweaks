import axios from 'axios';
import { exec, spawn } from 'child_process';
import { remote } from 'electron';
import settings from 'electron-settings';
import { default as extract, default as extractZip } from 'extract-zip';
import { existsSync } from 'fs';
import { mkdir, readFile, rm, stat, writeFile } from 'fs/promises';
import { machineId as _machineId } from 'node-machine-id';
import { arch as osArch, platform, release } from 'os';
import { join } from 'path';
import process from 'process';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import constants from '../constants';
import store from '../store';
import { downloadLunarAssets } from './assets';
import { disableRPC, login as connectRPC, updateActivity } from './discord';
import { checkHash, downloadAndSaveFile } from './downloader';
import { verifyEngine } from './engine';
import Logger, { createMinecraftLogger } from './logger';
import { getDefaultJREPath, getDotMinecraftDirectory } from './settings';
import { availableVersions } from '../components/Content/Play.vue';

const logger = new Logger('launcher');

/**
 * Checks if the `.lunarclient` directory is valid
 */
export async function setupLunarClientDirectory() {
  logger.info('Checking .lunarclient directory');

  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING LC FOLDER...',
    icon: 'fa-solid fa-folder',
  });

  const folders = ['licenses', 'offline'];

  if (!existsSync(constants.DOTLUNARCLIENT)) {
    logger.debug('Creating .lunarclient directory...');
    await mkdir(constants.DOTLUNARCLIENT)
      .then(() => {
        logger.debug('Created .lunarclient directory');
      })
      .catch((error) => {
        logger.throw("Can't create .lunarclient directory", error);
      });
  }

  logger.debug('Checking .lunarclient subdirectories');

  for (const index in folders) {
    const folder = folders[index];

    // Launch state
    store.commit('setLaunchingState', {
      title: 'LAUNCHING...',
      message: `CHECKING SUBFOLDERS ${parseInt(index) + 1}/${folders.length}`,
      icon: 'fa-solid fa-folder',
    });

    if (!existsSync(join(constants.DOTLUNARCLIENT, folder))) {
      logger.debug(`Creating ${folder} subdirectory...`);
      await mkdir(join(constants.DOTLUNARCLIENT, folder))
        .then(() => {
          logger.debug(`Created ${folder} subdirectory`);
        })
        .catch((error) => {
          logger.throw(`Can't create ${folder} subdirectory`, error);
        });
    } else logger.debug(`${folder} subdirectory already exists, skipping...`);
  }
}
/**
 * Download the Official Lunar JRE
 * @param metadata The LC Launch Metadata
 * @returns Whether the download was successful
 */
export async function downloadDefaultJRE(metadata) {
  const jre = metadata.jre;
  const path = join(constants.DOTLUNARCLIENT, 'jre', jre.folderChecksum);
  await downloadAndSaveFile(
    jre.download.url,
    `${path}.${jre.download.extension}`,
    'blob'
  );
  if (jre.download.extension === 'zip') {
    if (
      !(await new Promise((res) =>
        extract(`${path}.zip`, { dir: path })
          .then(() => res(true))
          .catch(async (err) => {
            logger.throw(`Failed to extract ${path}.zip`, err);
            await rm(`${path}.zip`);
            res(false);
          })
      ))
    )
      return false;
  } else if (jre.download.extension === 'tar.gz') {
    if (
      !(await new Promise((res) =>
        mkdir(path)
          .then(() => res(true))
          .catch(async () => {
            logger.info('JRE Path already exists, skipping download...');
            await rm(`${path}.tar.gz`);
            res(false);
          })
      ))
    )
      return false;
    if (
      !(await new Promise((res) =>
        exec(`tar -xzvf ${path}.tar.gz -C ${path}`, async (err) => {
          if (err) {
            logger.throw(`Failed to extract ${path}.tar.gz`, err);
            await rm(`${path}.tar.gz`);
            res(false);
          } else res(true);
        })
      ))
    )
      return false;
  } else return false;
  await rm(`${path}.${jre.download.extension}`);
  await settings.set(
    'jrePath',
    join(
      path,
      ...jre.executablePathInArchive.splice(
        0,
        jre.executablePathInArchive.length - 1
      )
    )
  );
  return true;
}
/**
 * Deal with an Invalid JRE
 * @param metadata The LC Launch Metadata
 * @returns Whether a valid JRE was selected
 */
export async function invalidJRE(metadata) {
  logger.warn(
    'JRE not found! Showing error dialog and aborting launch process'
  );

  const choice = await remote.dialog.showMessageBox({
    type: 'error',
    title: 'JRE not found',
    message:
      'The JRE you selected was not found or is invalid.\n\nPlease select a valid JRE in the settings page or download one using the JRE downloader.\n\nMake sure you selected the bin folder inside of the JRE.',
    buttons: ['Cancel launch', 'Select JRE', 'Download Default JRE'],
  });

  if (choice.response === 1) {
    store.commit('setLaunchingState', {
      title: `LAUNCHING`,
      message: 'SELECTING JRE...',
      icon: 'fa-solid fa-gamepad',
    });
    store.commit('setLaunching', true);
    // Set new folder
    const folder = await remote.dialog.showOpenDialog({
      title: `Select the new JRE for Lunar Client (Select the bin folder)`,
      defaultPath: await settings.get('jrePath'),
      properties: ['dontAddToRecent', 'openDirectory'],
    });

    if (folder.canceled) {
      store.commit('setLaunchingState', {
        title: `LAUNCH ${await settings.get('version')}`,
        message: 'READY TO LAUNCH',
        icon: 'fa-solid fa-gamepad',
      });
      store.commit('setLaunching', false);
      return;
    }

    await settings.set('jrePath', folder.filePaths[0]);
    return await checkJRE(metadata);
  } else if (choice.response === 2) {
    store.commit('setLaunchingState', {
      title: `LAUNCHING`,
      message: 'DOWNLOADING DEFAULT JRE...',
      icon: 'fa-solid fa-gamepad',
    });
    store.commit('setLaunching', true);
    const path = await getDefaultJREPath();
    if (path == '') {
      logger.info('No JRE Already Installed, Downloading New One...');
      if (!(await downloadDefaultJRE(metadata))) return false;
    } else {
      logger.info('JRE Already Installed');
      await settings.set('jrePath', path);
    }
    return await checkJRE(metadata);
  } else {
    // Cancel launch or closed
    store.commit('setLaunchingState', {
      title: `LAUNCH ${await settings.get('version')}`,
      message: 'READY TO LAUNCH',
      icon: 'fa-solid fa-gamepad',
    });
    store.commit('setLaunching', false);
    logger.error('JRE not found');
    return false;
  }
}

/**
 * Checks if the JRE is valid
 * @param metadata The LC Launch Metadata
 * @returns If the JRE is valid
 */
export async function checkJRE(metadata) {
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING JRE...',
    icon: 'fa-solid fa-folder',
  });

  const jrePath = (await settings.get('jrePath')) ?? '';
  const javaName = process.platform === 'win32' ? 'java.exe' : 'java';

  const exists = {
    jre: await stat(jrePath).catch(() => false), // Bin folder
    java: await stat(join(jrePath, javaName)).catch(() => false), // Java binary
  };

  // If one of them is missing
  if (!exists.jre || !exists.java) return await invalidJRE(metadata);
  else return true;
}

/**
 * Fetches metadata from Lunar's API
 * @param {boolean} [skipLaunchingState=false] Skip or not the launching state
 * @returns {Promise<Object>}
 */
export async function fetchMetadata(skipLaunchingState = false) {
  if (!skipLaunchingState) {
    // Launch state
    store.commit('setLaunchingState', {
      title: 'LAUNCHING...',
      message: 'FETCHING METADATA...',
      icon: 'fa-solid fa-download',
    });
  }

  // Fetch metadata
  logger.info('Fetching metadata...');
  const [
    hwid,
    version,
    hwid_private,
    installation_id,
    module,
    os,
    os_release,
    arch,
  ] = await Promise.all([
    _machineId().catch((err) => {
      logger.error('Failed to fetch Machine ID', err);
    }),
    settings.get('version'),
    getHWIDPrivate(),
    getInstallationID(),
    settings.get('module'),
    platform(),
    release(),
    osArch(),
  ]);
  return new Promise((resolve, reject) => {
    axios
      .post(
        constants.links.LC_METADATA_ENDPOINT,
        {
          hwid,
          installation_id,
          os,
          os_release,
          arch,
          version,
          branch: 'master',
          launch_type: 'OFFLINE',
          module,
          ...(hwid_private ? { hwid_private } : {}),
        },
        { 'Content-Type': 'application/json', 'User-Agent': 'SolarTweaks' }
      )
      .then((response) => {
        logger.debug('Fetched metadata', response.data);
        resolve(response.data);
      })
      .catch((error) => {
        logger.throw('Failed to fetch metadata', error);
        reject(error);
      });
  });
}

/**
 * Checks license (and downloads if needed)
 * @param {Object} metadata Metadata from Lunar's API
 * @returns {Promise<void>}
 */
export async function checkLicenses(metadata) {
  logger.info('Checking licenses...');
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: `CHECKING ${metadata.licenses.length} LICENSES ...`,
    icon: 'fa-solid fa-gavel',
  });
  for (const index in metadata.licenses) {
    const license = metadata.licenses[index];
    logger.debug(
      `Checking license ${parseInt(index) + 1}/${metadata.licenses.length}`
    );
    const licensePath = join(
      constants.DOTLUNARCLIENT,
      'licenses',
      license.file
    );

    if (!existsSync(licensePath)) {
      await downloadAndSaveFile(
        license.url,
        join(constants.DOTLUNARCLIENT, 'licenses', license.file),
        'text',
        license.sha1,
        'sha1'
      ).catch((error) => {
        logger.throw(`Failed to download ${license.file}`, error);
      });
    }
  }
}

/**
 * Checks the game files (and downloads if needed)
 * @param {Object} metadata Metadata from Lunar's API
 * @returns {Promise<void>}
 */
export async function checkGameFiles(metadata) {
  logger.info(`Checking Game Files (MC ${await settings.get('version')})...`);
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: `CHECKING GAMEFILES (${metadata.launchTypeData.artifacts.length})...`,
    icon: 'fa-solid fa-file',
  });

  if (!existsSync(join(constants.DOTLUNARCLIENT, 'offline', 'multiver'))) {
    await mkdir(join(constants.DOTLUNARCLIENT, 'offline', 'multiver')).catch(
      (error) => {
        logger.throw('Failed to create version folder', error);
      }
    );
  }

  for (const index in metadata.launchTypeData.artifacts) {
    const artifact = metadata.launchTypeData.artifacts[index];
    const gameFilePath = join(
      constants.DOTLUNARCLIENT,
      'offline',
      'multiver',
      artifact.name
    );
    logger.debug(
      `Checking game file ${parseInt(index) + 1}/${
        metadata.launchTypeData.artifacts.length
      }`
    );

    if (!(await checkHash(gameFilePath, artifact.sha1, 'sha1', true))) {
      await downloadAndSaveFile(
        artifact.url,
        gameFilePath,
        'blob',
        artifact.sha1,
        'sha1',
        true,
        false
      )
        .then(() => {
          logger.info(`Downloaded ${artifact.name} to ${gameFilePath}`);
        })
        .catch((error) => {
          logger.throw(`Failed to download ${artifact.name}`, error);
        });
    }
  }
}

/**
 * Checks natives (and extract if needed)
 * @param {object} metadata Metadata from Lunar's API
 * @returns {Promise<void>}
 */
export async function checkNatives(metadata) {
  logger.info('Checking natives...');

  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING NATIVES...',
    icon: 'fa-solid fa-file',
  });

  await rm(join(constants.DOTLUNARCLIENT, 'offline', 'multiver', 'natives'))
    .then(() => logger.info('Deleted Natives Directory'))
    .catch(() => logger.info('Natives Directory does not Exist'));

  const artifact = metadata.launchTypeData.artifacts.find(
    (artifact) => artifact.type === 'NATIVES'
  );
  if (
    existsSync(
      join(constants.DOTLUNARCLIENT, 'offline', 'multiver', artifact.name)
    )
  ) {
    await extractZip(
      join(constants.DOTLUNARCLIENT, 'offline', 'multiver', artifact.name),
      {
        dir: join(constants.DOTLUNARCLIENT, 'offline', 'multiver', 'natives'),
      }
    )
      .then(() => {
        logger.debug('Extracted natives');
      })
      .catch((error) => {
        logger.throw('Failed to extract natives', error);
      });
  } else {
    logger.error('Natives not found, this should not happen');
  }
}

/**
 * Check engine (and download if needed)
 * @returns {Promise<void>}
 */
export async function checkEngine() {
  logger.info('Checking engine...');

  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING ENGINE...',
    icon: 'fa-solid fa-file',
  });

  await verifyEngine();
}

/**
 * Check engine config file (and download if needed)
 * @returns {Promise<void>}
 */
export async function checkEngineConfig() {
  const configPath = join(constants.SOLARTWEAKS_DIR, constants.ENGINE.CONFIG);
  await stat(configPath).catch(async () => {
    logger.info('Creating config file');
    await downloadAndSaveFile(
      constants.ENGINE.CONFIG_EXAMPLE_URL,
      configPath,
      'text'
    ).catch((err) => {
      logger.throw('Failed to download default engine config', err);
    });
    logger.info('Created default engine config');
  });
}

/**
 * Get the Java arguments to launch the game
 * @param {Object} metadata Metadata from Lunar's API
 * @param {string} [serverIp=null] Server IP to connect to
 * @param {string} [overrideVersion=null] Version to use (overrides settings)
 * @param {boolean} [shortcut=false] Whether or not the arguments are for a shortcut
 */
export async function getJavaArguments(
  metadata,
  serverIp = null,
  overrideVersion = null,
  shortcut = false
) {
  const natives = join(
    constants.DOTLUNARCLIENT,
    'offline',
    'multiver',
    'natives'
  );

  const args = [...metadata.jre.extraArguments];

  const nativesArgument = args.findIndex((value) => value.includes('natives'));
  args[nativesArgument] = args[nativesArgument].replace(
    'natives',
    `"${natives}"`
  );

  const version = overrideVersion ?? (await settings.get('version'));

  // eslint-disable-next-line no-unused-vars
  const lunarJarFile = (filename) =>
    `"${join(constants.DOTLUNARCLIENT, 'offline', 'multiver', filename)}"`;

  const gameDir =
    (await settings.get('launchDirectories')).find(
      (directory) =>
        directory.version ===
        (version.split('.').length === 3
          ? version.split('.').splice(0, 2).join('.')
          : version)
    )?.path || getDotMinecraftDirectory();

  const resolution = await settings.get('resolution');
  const enginePath = join(constants.SOLARTWEAKS_DIR, constants.ENGINE.ENGINE);

  // Make sure the engine exists, or else the game will crash (jvm init error)
  await stat(enginePath)
    .then(() => {
      args.push(
        `-javaagent:"${enginePath}"="${join(
          constants.DOTLUNARCLIENT,
          'solartweaks',
          constants.ENGINE.CONFIG
        )}"`
      );
    })
    .catch((e) =>
      logger.warn(
        `Not adding engine in arguments; ${enginePath} does not exist!`,
        e
      )
    );

  const classPath = metadata.launchTypeData.artifacts
    .filter((a) => a.type === 'CLASS_PATH')
    .map((artifact) => artifact.name);

  if (version === '1.7.10') classPath.push('OptiFine_1.7.10_HD_U_E7');

  const ram = await settings.get('ram');

  args.push(
    ...(await settings.get('jvmArguments'))
      .split(' ')
      .filter((arg) => arg?.length),
    `-Xmx${ram}m`,
    `-Xmn${ram}m`,
    `-Xms${ram}m`,
    `-Djava.library.path="${natives}"`,
    `-Dsolar.launchType=${shortcut ? 'shortcut' : 'launcher'}`,
    '-cp',
    classPath.join(process.platform === 'win32' ? ';' : ':'),
    metadata.launchTypeData.mainClass,
    '--version',
    version,
    '--accessToken',
    '0',
    '--assetIndex',
    availableVersions
      .find((i) => i.id == version.split('.').slice(0, 2).join('.'))
      .subversions.find((i) => i.id == version).assets.id,
    '--userProperties',
    '{}',
    '--gameDir',
    `"${gameDir}"`,
    '--assetsDir',
    `"${join(gameDir, 'assets')}"`,
    '--texturesDir',
    `"${join(constants.DOTLUNARCLIENT, 'textures')}"`,
    '--width',
    resolution.width,
    '--height',
    resolution.height,
    '--ichorClassPath',
    classPath.join(','),
    '--ichorExternalFiles',
    metadata.launchTypeData.artifacts
      .filter((a) => a.type === 'EXTERNAL_FILE')
      .map((artifact) => artifact.name)
      .join(','),
    '--workingDirectory',
    '.',
    '--classpathDir',
    join(constants.DOTLUNARCLIENT, 'offline', 'multiver'),
    '--installationId',
    await getInstallationID()
  );

  const machineId = await _machineId().catch((err) => {
    logger.error('Failed to fetch Machine ID', err);
  });
  if (machineId) args.push('--hwid', machineId);

  if (serverIp) args.push('--server', `"${serverIp}"`);

  return args.map((arg) => (!shortcut ? `${arg}`.replace(/"/g, '') : arg));
}
/**
 * Get the HWID Private file from the .lunarclient/launcher-cache folder or make one if it doesn't exist
 * @returns {Promise<string>} The HWID Private
 */
export async function getHWIDPrivate() {
  const path = join(
    constants.DOTLUNARCLIENT,
    'launcher-cache',
    'hwid-private-do-not-share'
  );
  try {
    return await readFile(path, { encoding: 'utf-8' });
  } catch {
    const chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let hwid_private = '';
    for (let i = 0; i < 512; i++)
      hwid_private += chars.charAt(Math.floor(Math.random() * chars.length));
    await mkdir(join(constants.DOTLUNARCLIENT, 'launcher-cache'), {
      recursive: true,
    });
    await writeFile(path, hwid_private, { encoding: 'utf-8' });
    return hwid_private;
  }
}
/**
 * Get the Installation ID file from the .lunarclient/launcher-cache folder or make one if it doesn't exist
 * @returns {Promise<string>} The Installation ID
 */
export async function getInstallationID() {
  const path = join(
    constants.DOTLUNARCLIENT,
    'launcher-cache',
    'installation-id'
  );
  let installationID;
  try {
    installationID = await readFile(path, { encoding: 'utf-8' });
    if (!validateUUID(installationID))
      throw new Error('Invalid Installation ID, Regenerating...');
  } catch {
    installationID = uuidv4();
    await mkdir(join(constants.DOTLUNARCLIENT, 'launcher-cache'), {
      recursive: true,
    });
    await writeFile(path, installationID, { encoding: 'utf-8' });
  }
  return installationID;
}
/**
 * Launch the game
 * @param {Object} metadata Metadata from Lunar's API
 * @param {string} [serverIp=null] Server IP to connect to
 * @param {boolean} [debug=false] Launch in debug mode (show console)
 */
export async function launchGame(metadata, serverIp = null, debug = false) {
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'STARTING JVM...',
    icon: 'fa-solid fa-gamepad',
  });

  const version = await settings.get('version');
  const args = await getJavaArguments(metadata, serverIp).catch((error) => {
    store.commit('setLaunchingState', {
      title: 'Error',
      message: error.message,
      icon: 'fa-solid fa-exclamation-triangle',
    });
    logger.throw('Failed to get Java Arguments', error);
  });

  if (!args) return logger.error('No Java Arguments');

  logger.debug('Launching game with args\n\n', args.join('\n'));

  const javaPath = join(await settings.get('jrePath'), 'java');
  const proc = spawn(javaPath, args, {
    cwd: join(constants.DOTLUNARCLIENT, 'offline', 'multiver'),
    detached: true,
    shell: debug,
  });

  proc.on('error', (error) => {
    if (error.message.includes('ENOENT') || error.message.includes('EACCES')) {
      proc.kill();
      invalidJRE(metadata).then((valid) => {
        if (valid) launchGame(...arguments);
      });
    } else logger('Game Launch Error', error);
  });

  function commitLaunch() {
    updateActivity('In Game');
    store.commit('setLaunchingState', {
      title: `LAUNCHED`,
      message: 'GAME IS RUNNING',
      icon: 'fa-solid fa-gamepad',
    });
    store.commit('setLaunching', true);
  }

  const minecraftLogger = await createMinecraftLogger(version);
  logger.debug(
    `Created Minecraft Logger for version ${version}. Log file path: ${minecraftLogger.path}`
  );
  proc.stdout.pipe(minecraftLogger);
  proc.stderr.pipe(minecraftLogger);

  if (debug) await remote.shell.openPath(minecraftLogger.path);

  proc.stdout.once('end', () => {
    updateActivity('In the launcher');
    store.commit('setLaunchingState', {
      title: `LAUNCH ${version}`,
      message: 'READY TO LAUNCH',
      icon: 'fa-solid fa-gamepad',
    });
    store.commit('setLaunching', false);
    if (debug) return;
    remote.getCurrentWindow().show();
    connectRPC();
  });

  async function waitForLaunch(data) {
    if (!data.toString('utf8').includes('Starting game!')) return;
    proc.stdout.removeListener('data', waitForLaunch);
    await new Promise((res) => setTimeout(res, 3000));
    commitLaunch();
    if (debug) return;
    await disableRPC();
    switch (await settings.get('actionAfterLaunch')) {
      case 'close':
      default:
        remote.getCurrentWindow().close();
        break;
      case 'hide':
        remote.getCurrentWindow().hide();
        break;
      case 'keep':
        break;
    }
  }

  proc.stdout.on('data', waitForLaunch);

  proc.stdout.on('error', (error) =>
    logger.throw('Failed to launch game', error)
  );

  proc.stderr.on('error', (error) =>
    logger.throw('Failed to launch game', error)
  );
}

/**
 * Run all the checks and launch the game
 * @param {string} [serverIp=null] Server IP to connect to
 */
export async function checkAndLaunch(serverIp = null) {
  store.commit('setLaunching', true);
  updateActivity('In the launcher', 'Launching game');

  const version = await settings.get('version');
  const skipChecks = await settings.get('skipChecks');

  let success = true;

  function error(action, err) {
    success = false;
    store.commit('setErrorMessage', `${action} Error: ` + (err.stack ?? err));
    store.commit('setErrorModal', true);
    logger.throw(`Failed to ${action}`, err);
  }

  // Fetching metadata
  const metadata = await fetchMetadata().catch((err) =>
    error('Fetch Metadata', err)
  );

  if (!metadata) return logger.error('No Metadata for Launch');

  if (!skipChecks) {
    // Check JRE
    if (!(await checkJRE(metadata).catch((err) => error('Check JRE', err))))
      return;

    // Check game directory
    await setupLunarClientDirectory().catch((err) =>
      error('Setup .lunarclient', err)
    );

    // Check licenses
    await checkLicenses(metadata).catch((err) => error('Check Licenses', err));

    // Check game files
    await checkGameFiles(metadata).catch((err) =>
      error('Check Game Files', err)
    );

    // Check natives
    await checkNatives(metadata).catch((err) => error('Check Natives', err));

    // Check LC assets
    await downloadLunarAssets(metadata).catch((err) =>
      error('Check LC Assets', err)
    );

    // Engine config
    await checkEngineConfig().catch((err) => error('Check Engine Config', err));

    // Check engine
    await checkEngine().catch((err) => error('Check Engine', err));
  }

  if (!success) {
    remote.getCurrentWindow().setProgressBar(-1);
    store.commit('setLaunching', false);
    return store.commit('setLaunchingState', {
      title: `LAUNCH ${version}`,
      message: 'READY TO LAUNCH',
      icon: 'fa-solid fa-gamepad',
    });
  }

  // Launch game
  await launchGame(metadata, serverIp, await settings.get('debugMode')).catch(
    (err) => error('Launch Game', err)
  );

  // Trackers
  await axios
    .post(`${constants.API_URL}${constants.ENDPOINTS.LAUNCH}`, {
      item: 'launcher',
      version,
    })
    .catch((error) =>
      logger.warn(
        "Failed to track launcher launch, ignoring it, it's not important.",
        error
      )
    );
}
