import { BaseMethods } from '../base-methods';

import { getDrivesWindows } from './get-drives-windows';
import { getFilesWindows } from './get-files-windows';
import { getFoldersWindows } from './get-folders-windows';

export const windowsMethods: BaseMethods = {
  getDrives: getDrivesWindows,
  getFolders: getFoldersWindows,
  getFiles: getFilesWindows,
}
