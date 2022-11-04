import settings from 'electron-settings';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import * as process from 'process';
import { platform } from 'process';
import constants from '../constants';
import Logger from './logger';
const logger = new Logger('settings');

/**
 * Setup settings for the application.
 * Also check if the settings need to be reseted to default.
 */
export default async function setupSettings() {
  logger.info(`Setting up settings at file path ${settings.file()}...`);

  // User's submitted servers
  if (!(await settings.has('servers')))
    await settings.set('servers', defaultSettings.servers);

  // User's selected customizations
  if (!(await settings.has('customizations')))
    await settings.set('customizations', defaultSettings.customizations);

  // User's selected version
  if (!(await settings.has('version')))
    await settings.set('version', defaultSettings.version);

  if (!(await settings.has('module')))
    await settings.set('module', defaultSettings.module);

  // User's selected launch directories
  if (!(await settings.has('launchDirectories')))
    await settings.set('launchDirectories', defaultSettings.launchDirectories);
  else {
    const directories = await settings.get('launchDirectories');
    let launchDirectory = directories.find((d) => d.version === '1.8');
    if (launchDirectory) launchDirectory.version = '1.8.9';
    launchDirectory = directories.find((d) => d.version === '1.18');
    if (launchDirectory) launchDirectory.version = '1.18.2';
    launchDirectory = directories.find((d) => d.version === '1.17');
    if (launchDirectory) launchDirectory.version = '1.17.1';
    launchDirectory = directories.find((d) => d.version === '1.16');
    if (launchDirectory) launchDirectory.version = '1.16.5';
    launchDirectory = directories.find((d) => d.version === '1.12');
    if (launchDirectory) launchDirectory.version = '1.12.2';
    launchDirectory = directories.find(
      (d) => d.version === '1.7' || d.version === '1.17.10'
    );
    if (launchDirectory) launchDirectory.version = '1.7.10';
    if (!directories.find((d) => d.version === '1.19.2'))
      directories.push({
        version: '1.19.2',
        directory: join(process.env.APPDATA, '.minecraft'),
      });

    await settings.set('launchDirectories', directories);
  }

  // User's selected ram
  if (!(await settings.has('ram')))
    await settings.set('ram', defaultSettings.ram);

  // User's selected resolution
  if (!(await settings.has('resolution')))
    await settings.set('resolution', defaultSettings.resolution);

  // User's selected action after launch
  if (!(await settings.has('actionAfterLaunch')))
    await settings.set('actionAfterLaunch', defaultSettings.actionAfterLaunch);

  // User's custom JVM arguments
  if (!(await settings.has('jvmArguments')))
    await settings.set('jvmArguments', defaultSettings.jvmArguments);

  // User's selected JRE Path
  if (!(await settings.has('jrePath')) || (await settings.get('jrePath')) == '')
    await settings.set('jrePath', await getDefaultJREPath());

  // Launch in debug mode
  if (!(await settings.has('debugMode')))
    await settings.set('debugMode', defaultSettings.debugMode);

  // Skip launch checks
  if (!(await settings.has('skipChecks')))
    await settings.set('skipChecks', defaultSettings.skipChecks);

  // Downloaded JREs
  if (!(await settings.has('downloadedJres')))
    await settings.set(
      'downloadedJres',
      (
        await readdir(join(constants.SOLARTWEAKS_DIR, 'jres'), {
          withFileTypes: true,
        })
      )
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
    );

  logger.info(`Settings Setup at ${settings.file()}`);
}

export function getDotMinecraftDirectory() {
  switch (platform) {
    case 'win32':
      return join(process.env.APPDATA, '.minecraft');
    case 'darwin':
      return join(
        process.env.HOME,
        'Library',
        'Application Support',
        'minecraft'
      );
    case 'linux':
      return join(process.env.HOME, '.minecraft');
    default:
      break;
  }
}

export async function getDefaultJREPath() {
  const LCJresPath = join(
    platform === 'win32' ? process.env.USERPROFILE : process.env.HOME,
    '.lunarclient',
    'jre'
  );
  const dir1 = await readdir(LCJresPath);
  if (!dir1) {
    logger.warn(
      'Please run normal Lunar Client to setup `jre` folder inside `.lunarclient`'
    );
    return '';
  }
  const jreName = dir1.find((i) => !i.includes('.'));
  if (!jreName) return '';
  const dir2 = join(LCJresPath, jreName);
  if (!dir2) return '';
  const dir3 = join(
    dir2,
    (await readdir(dir2))?.find((i) => i.startsWith('zulu')) || ''
  );
  if (!dir3 || dir3 == dir2) return '';
  if (existsSync(join(dir3, 'bin'))) {
    return join(dir3, 'bin');
  } else if (existsSync(join(dir3, 'Contents'))) {
    return join(dir3, 'Contents/Home/bin');
  } else return '';
}

export const defaultSettings = {
  servers: [
    { name: 'Hypixel', ip: 'hypixel.net', background: 7 },
    { name: 'Minemen Club', ip: 'na.minemen.club', background: 3 },
    { name: 'Lunar Network', ip: 'lunar.gg', background: 1 },
    { name: 'ViperMC', ip: 'play.vipermc.net', background: 5 },
    { name: 'BWHub', ip: 'bwhub.net', background: 4 },
  ],
  customizations: [],
  version: '1.8.9',
  module: 'lunar',
  launchDirectories: [
    { version: '1.7.10', path: getDotMinecraftDirectory() },
    { version: '1.8.9', path: getDotMinecraftDirectory() },
    { version: '1.12.2', path: getDotMinecraftDirectory() },
    { version: '1.16.5', path: getDotMinecraftDirectory() },
    { version: '1.17.1', path: getDotMinecraftDirectory() },
    { version: '1.18.2', path: getDotMinecraftDirectory() },
    { version: '1.19.2', path: getDotMinecraftDirectory() },
  ],
  ram: 2048,
  resolution: {
    width: 854,
    height: 480,
  },
  actionAfterLaunch: 'close',
  jvmArguments: '-XX:+DisableAttachMechanism',
  jrePath: '',
  debugMode: false,
  skipChecks: false,
};
