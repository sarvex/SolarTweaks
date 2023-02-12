import fs from 'fs';
import os from 'os';
import path from 'path';
import Logger from '../javascript/logger';

const logger = new Logger('LunarChecker');

/**
 * Check if the Lunar Client is installed
 * @returns {Boolean}
 */
export function doesLunarExists() {
  logger.info('Checking for Lunar Client...');
  logger.info(`Platform: ${os.platform()}`);
  let lunarPath = '';
  let lunarExists = false;
  switch (os.platform()) {
    case 'win32':
      lunarPath = path.join(
        os.homedir(),
        'AppData',
        'Local',
        'Programs',
        'lunarclient',
        'Lunar Client.exe'
      );
      logger.info(`Checking for Lunar Client in ${lunarPath}`);
      lunarExists = fs.existsSync(lunarPath);
      if (lunarExists) logger.info('Lunar Client found');
      return lunarExists;
    case 'darwin':
      lunarPath = path.join('/', 'Applications', 'Lunar Client.app');
      logger.info(`Checking for Lunar Client in ${lunarPath}`);
      lunarExists = fs.existsSync(lunarPath);
      if (lunarExists) logger.info('Lunar Client found');
      return lunarExists;
    case 'linux':
      logger.error('Unsupported platform (Linux)');
      return lunarExists;
    default:
      logger.error(`Unsupported platform (${os.platform()})`);
      return lunarExists;
  }
}
