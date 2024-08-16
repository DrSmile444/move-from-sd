import { BaseMethods } from '../base-methods';

import { getDrivesWindows } from './get-drives-windows';
import { getFilesWindows } from './get-files-windows';

export const windowsMethods: BaseMethods = {
  getDrives: getDrivesWindows,
  getFiles: getFilesWindows,
}
