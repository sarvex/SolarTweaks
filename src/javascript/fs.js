import * as _fs from 'fs';
import { promisify } from 'util';

export default {
  exists: promisify(_fs.exists),
  readFile: promisify(_fs.readFile),
  mkdir: promisify(_fs.mkdir),
  writeFile: promisify(_fs.writeFile),
  chmod: promisify(_fs.chmod),
  appendFile: promisify(_fs.appendFile),
  rmdir: promisify(_fs.rmdir),
  readdir: promisify(_fs.readdir),
};
