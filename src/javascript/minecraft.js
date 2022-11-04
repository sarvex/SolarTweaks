import axios from 'axios';
import { spawn } from 'child_process';
import { remote } from 'electron';
import settings from 'electron-settings';
import extractZip from 'extract-zip';
import { existsSync } from 'fs';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
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
import Logger, { createMinecraftLogger } from './logger';
import { getDotMinecraftDirectory } from './settings';

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
 * Checks if the JRE is valid
 */
export async function checkJRE() {
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING JRE...',
    icon: 'fa-solid fa-folder',
  });

  const jrePath = await settings.get('jrePath');
  const javaName = process.platform === 'win32' ? 'java.exe' : 'java';

  const exists = {
    jre: await stat(jrePath).catch(() => false), // Bin folder
    java: await stat(join(jrePath, javaName)).catch(() => false), // Java binary
  };

  // If one of them is missing
  if (!exists.jre || !exists.java) {
    logger.warn(
      'JRE not found! Showing error dialog and aborting launch process'
    );

    const choice = await remote.dialog.showMessageBox({
      type: 'error',
      title: 'JRE not found',
      message:
        'The JRE you selected was not found or is invalid.\n\nPlease select a valid JRE in the settings page or download one using the JRE downloader.\n\nMake sure you selected the bin folder inside of the JRE.',
      buttons: ['Select JRE', 'Cancel launch'],
    });

    if (choice.response === 0) {
      // Set new folder
      const folder = await remote.dialog.showOpenDialog({
        title: `Select the new JRE for Lunar Client (Select the bin folder)`,
        defaultPath: jrePath,
        properties: ['dontAddToRecent', 'openDirectory'],
      });

      if (folder.canceled) return;

      await settings.set('jrePath', folder.filePaths[0]);
      await checkJRE();
    } else {
      // Cancel launch or closed
      store.commit('setLaunchingState', {
        title: `LAUNCH ${await settings.get('version')}`,
        message: 'READY TO LAUNCH',
        icon: 'fa-solid fa-gamepad',
      });
      store.commit('setLaunching', false);
      throw new Error('JRE not found');
    }
  }
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
    _machineId(),
    settings.get('version'),
    getHWIDPrivate(),
    getInstallationID(),
    // All versions have a module called "lunar"
    // Special modules:
    // 1.8.9 = neu
    // 1.16.5, 1.17.1, 1.18.2, 1.19.2 = sodium
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
          hwid_private,
          os,
          os_release,
          arch,
          version,
          branch: 'master',
          launch_type: 'OFFLINE',
          module,
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

  const artifact = metadata.launchTypeData.artifacts.find(
    (artifact) => artifact.type === 'NATIVES'
  );
  if (
    existsSync(
      join(constants.DOTLUNARCLIENT, 'offline', 'multiver', artifact.name)
    )
  ) {
    if (
      !existsSync(
        join(constants.DOTLUNARCLIENT, 'offline', 'multiver', 'natives')
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
      logger.debug('Natives already extracted');
    }
  } else {
    logger.error('Natives not found, this should not happen');
  }
}

/**
 * Check patcher (and download if needed)
 * @returns {Promise<void>}
 */
export async function checkPatcher() {
  logger.info('Checking patcher...');

  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING PATCHER...',
    icon: 'fa-solid fa-file',
  });

  const release = await axios
    .get(`${constants.API_URL}${constants.UPDATERS.INDEX}`)
    .catch((reason) => {
      logger.throw('Failed to fetch updater index', reason);
    });

  if (!release) return;

  const patcherPath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    'solar-patcher.jar'
  );

  // Check if file solar-patcher.jar exists
  if (
    !(await stat(
      join(constants.SOLARTWEAKS_DIR, constants.PATCHER.PATCHER)
    ).catch(() => false))
  ) {
    await downloadAndSaveFile(
      `${constants.API_URL}${constants.UPDATERS.PATCHER.replace(
        '{version}',
        release.data.index.stable.patcher
      )}`,
      patcherPath,
      'blob'
    );
    await settings.set('patcherVersion', release.data.index.stable.patcher);
    return; // No need to check for updates, we just downloaded the latest version
  }

  const patcherVer = await settings.get('patcherVersion');
  const latestVer = release.data.index.stable.patcher;

  if (patcherVer === latestVer)
    return logger.info(`Patcher is up to date ${patcherVer}`);

  await downloadAndSaveFile(
    `${constants.API_URL}${constants.UPDATERS.PATCHER.replace(
      '{version}',
      release.data.index.stable.patcher
    )}`,
    patcherPath,
    'blob'
  );

  logger.info(`Patcher updated to ${latestVer}`);
  await settings.set('patcherVersion', latestVer);

  logger.debug('Updating config.json file to match new patcher config...');
  const defaultConfigFile = (
    await axios.get(constants.PATCHER.CONFIG_EXAMPLE_URL)
  ).data;

  const configPath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    constants.PATCHER.CONFIG
  );

  function merge(obj1, obj2) {
    const newObj = { ...obj1, ...obj2 };
    for (const key in newObj)
      if (typeof newObj[key] === 'object')
        newObj[key] = merge(obj1[key], obj2[key]);

    return newObj;
  }

  const newConfig = merge(
    defaultConfigFile,
    JSON.parse(await readFile(configPath, 'utf8'))
  );
  await writeFile(configPath, JSON.stringify(newConfig, null, 2));
}

/**
 * Check patcher config file (and download if needed)
 * @returns {Promise<void>}
 */
export async function checkPatcherConfig() {
  const configPath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    constants.PATCHER.CONFIG
  );
  await stat(configPath).catch(async () => {
    logger.info('Creating config file');
    await downloadAndSaveFile(
      constants.PATCHER.CONFIG_EXAMPLE_URL,
      configPath,
      'text'
    ).catch((err) => {
      logger.throw('Failed to download default patcher config', err);
    });
    logger.info('Created default patcher config');
  });
}

/**
 * Edit the `config.json` file for the Java Agent
 * @returns {Promise<void>}
 */
export async function patchGame() {
  logger.info('Patching game...');

  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'PATCHING GAME...',
    icon: 'fa-solid fa-cog',
  });

  const filePath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    constants.PATCHER.CONFIG
  );

  logger.debug(`Reading ${filePath}`);
  const configRaw = await readFile(filePath).catch((reason) => {
    logger.throw('Failed to read config.json', reason);
  });
  if (!configRaw) return;

  const config = JSON.parse(configRaw);
  const customizations = await settings.get('customizations');

  config.metadata.removeCalls = [];
  config.metadata.isEnabled = true;

  customizations.forEach((customization) => {
    // Privacy module
    if (Object.prototype.hasOwnProperty.call(customization, 'privacyModules')) {
      customization.privacyModules.forEach((module) => {
        if (!Object.prototype.hasOwnProperty.call(config, module)) return;
        config[module].isEnabled = customization.enabled;
      });
      return;
    }

    if (!Object.keys(config).includes(customization.internal)) return;

    // Metadata module
    if (customization.internal === 'metadata') {
      config.metadata.removeCalls.push(customization.call);
      return;
    }

    config[customization.internal].isEnabled = customization.enabled;
    if (Object.prototype.hasOwnProperty.call(customization, 'values')) {
      for (const key in customization.values) {
        config[customization.internal][key] = customization.values[key];
      }
    }
  });

  logger.debug(`Writing ${filePath}`);
  await writeFile(filePath, JSON.stringify(config, null, 2))
    .then(() => {
      logger.debug('Successfully wrote config.json');
    })
    .catch((reason) => {
      logger.throw('Failed to write config.json', reason);
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
      (directory) => directory.version === version
    )?.path || getDotMinecraftDirectory();

  const resolution = await settings.get('resolution');
  const patcherPath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    constants.PATCHER.PATCHER
  );

  // Make sure the patcher exists, or else the game will crash (jvm init error)
  await stat(patcherPath)
    .then(() => {
      args.push(
        `-javaagent:"${patcherPath}"="${join(
          constants.DOTLUNARCLIENT,
          'solartweaks',
          constants.PATCHER.CONFIG
        )}"`
      );
    })
    .catch((e) =>
      logger.warn(
        `Not adding patcher in arguments; ${patcherPath} does not exist!`,
        e
      )
    );

  const classPath = metadata.launchTypeData.artifacts
    .filter((a) => a.type === 'CLASS_PATH')
    .map((artifact) => artifact.name);

  if (version === '1.7.10') classPath.push('OptiFine_1.7.10_HD_U_E7');

  const ram = await settings.get('ram');

  args.push(
    ...(await settings.get('jvmArguments')).split(' '),
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
    version === '1.7'
      ? '1.7.10'
      : version === '1.8.9'
      ? '1.8'
      : version === '1.18.2'
      ? '1.18'
      : version === '1.17.1'
      ? '1.17'
      : version === '1.16.5'
      ? '1.16'
      : version === '1.12.2'
      ? '1.12'
      : version === '1.19.2'
      ? '1.19'
      : version,
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
    '--hwid',
    await _machineId(),
    '--installationId',
    await getInstallationID()
  );

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

  function commitLaunch() {
    updateActivity('In the launcher');
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

  if (debug) {
    await remote.shell.openPath(minecraftLogger.path);
  }

  proc.stdout.once('end', () => {
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

  proc.stdout.once('data', async (/* data */) => {
    setTimeout(commitLaunch, 2500);
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
  });

  proc.on('error', (error) => logger.error(error));

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

  let success = true;

  function error(action, err) {
    store.commit('setLaunchingState', {
      title: action + 'Error',
      message: err.message,
      icon: 'fa-solid fa-exclamation-triangle',
    });
    success = false;
    logger.throw(`Failed to ${action}`, err);
  }

  // Fetching metadata
  const metadata = await fetchMetadata().catch((err) =>
    error('Fetch Metadata', err)
  );

  if (!metadata) return logger.error('No Metadata for Launch');

  if (!(await settings.get('skipChecks'))) {
    // Check JRE
    await checkJRE().catch((err) => error('Check JRE', err));

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

    // Check patcher
    await checkPatcher().catch((err) => error('Check Patcher', err));

    // Patcher config
    await checkPatcherConfig().catch((err) =>
      error('Check Patcher Config', err)
    );
  }

  // Update patcher config file
  await patchGame().catch((err) => error('Patch Game', err));

  if (!success) return;

  // Launch game
  await launchGame(metadata, serverIp, await settings.get('debugMode')).catch(
    (err) => error('Launch Game', err)
  );

  // Trackers
  const version = await settings.get('version');
  await axios
    .post(`${constants.API_URL}${constants.ENDPOINTS.LAUNCH}`, {
      item: 'launcher',
      version: version.split('.').splice(0, 2).join('.'),
    })
    .catch((error) =>
      logger.warn(
        "Failed to track launcher launch, ignoring it, it's not important.",
        error
      )
    );
}
