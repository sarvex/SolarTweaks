import { mkdir, stat } from 'fs/promises';
import Logger from './logger';

const logger = new Logger('directories');

/**
 * Check if the given path is a directory and exists (creates it if it doesn't exist)
 * @param {string} path Path of the directory to check
 */
export function checkDirectory(path) {
  return new Promise((res, rej) => {
    stat(path)
      .then(() => {
        logger.info('Folder ' + path + ' Exists');
        res();
      })
      .catch(() => {
        mkdir(path)
          .then(() => {
            logger.info('Created Folder ' + path);
            res();
          })
          .catch((err) => {
            const error = 'Failed to Create Folder ' + path + ' ' + err;
            logger.throw(error);
            rej(error);
          });
      });
  });
}
