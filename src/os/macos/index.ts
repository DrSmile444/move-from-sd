import { BaseMethods } from '../base-methods';

import { getVolumesMacOS } from './get-drives-macos';
import { getFoldersWindows } from '../windows/get-folders-windows';
import { getFilesWindows } from '../windows/get-files-windows';

export const macosMethods: BaseMethods = {
  getDrives: getVolumesMacOS,
  getFolders: getFoldersWindows,
  getFiles: getFilesWindows,
}
