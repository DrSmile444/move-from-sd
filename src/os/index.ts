import * as os from 'os';

import { BaseMethods } from './base-methods';
import { windowsMethods } from './windows';

export const osUtils: BaseMethods = (() => {
  const platform = os.platform();

  if (platform === 'win32') {
    return windowsMethods;
//   } else if (platform === 'darwin') {
//     return getVolumesMac();
  } else {
    throw new Error('Unsupported platform: ' + platform);
  }
})();
