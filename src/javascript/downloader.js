import axios from 'axios';
import { createHash } from 'crypto';
import { createWriteStream, existsSync } from 'fs';
// import { DownloaderHelper } from 'node-downloader-helper';

import { mkdir, readFile, writeFile } from 'fs/promises';
import Logger from './logger';
const logger = new Logger('downloader');

/**
 * Downloads and saves a file from a URL to the given path
 * @param {string} url URL of the file to download
 * @param {string} path Path where to save the file
 * @param {'text'|'blob'} fileType Type of the file to download
 * @param {string} [hash=null] SHA1 or SHA256 hash of the file to make sure it's the same
 * @param {'sha1'|'sha256'} [algorithm='sha1'] Hash algorithm to use
 * @param {boolean} [logging=true] Whether or not to log
 * @param {boolean} [skipFolderCheck=false] Whether or not to check if the folder exists
 */
export async function downloadAndSaveFile(
  url,
  path,
  fileType,
  hash = null,
  algorithm = 'sha1',
  logging = true,
  skipFolderCheck = false
) {
  if (logging) logger.info(`Downloading ${url}...`);

  const response = await axios.get(url, { responseType: fileType });

  if (logging) {
    logger.info(`Downloaded ${url}`);
    logger.debug(`Saving to ${path}...`);
  }

  if (!skipFolderCheck) {
    const folderPath = path.includes('\\')
      ? path.substring(0, path.lastIndexOf('\\'))
      : path.substring(0, path.lastIndexOf('/'));
    await mkdir(folderPath, {
      recursive: true,
    });
  }

  if (fileType === 'text') {
    await writeFile(
      path,
      typeof response.data === 'object'
        ? JSON.stringify(response.data)
        : response.data,
      'utf8'
    );
    if (logging) logger.debug(`Saved to ${path}`);
    if (hash) {
      // eslint-disable-next-line no-unused-vars
      const isMatching = await checkHash(path, hash, algorithm, logging);
      // Handle hash mismatch
    }
  }

  if (fileType === 'blob') {
    const output = createWriteStream(path);
    const ws = new WritableStream(output);

    let blob = new Blob([response.data], { type: 'application/zip' });

    /** @type {ReadableStream} */
    const stream = blob.stream();

    await stream.pipeTo(ws);
    if (hash) {
      // eslint-disable-next-line no-unused-vars
      const isMatching = await checkHash(path, hash, algorithm, logging);
      // Handle hash mismatch
    }
  }
}

/**
 * Checks if the given hash is matching with the given file
 * @param {string} path Path of the file to check
 * @param {string} hash Hash to check
 * @param {'sha1'|'sha256'} algorithm Algorithm to use
 * @param {boolean} [logging=true] Whether or not to log
 * @returns {Promise<boolean>}
 */
export async function checkHash(path, hash, algorithm, logging = true) {
  if (logging) logger.debug(`Checking hash of ${path}...`);

  if (!existsSync(path)) return false;

  const fileBuffer = await readFile(path);
  const hashSum = createHash(algorithm);
  hashSum.update(fileBuffer);
  const fileHash = hashSum.digest('hex');
  if (fileHash !== hash) {
    if (logging)
      logger.error(
        `Hash mismatch for ${path}\nExpected: ${hash}\nGot: ${fileHash}\nAlgorithm: ${algorithm}`
      );
    return false;
  } else {
    if (logging) logger.debug(`Hash matches for ${path}`);
    return true;
  }
}
