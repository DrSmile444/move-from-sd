import * as os from 'os';

import { BaseMethods } from './base-methods';
import { windowsMethods } from './windows';
import { macosMethods } from './macos';

export const osUtils: BaseMethods = (() => {
  const platform = os.platform();

  if (platform === 'win32') {
    return windowsMethods;
  } else if (platform === 'darwin') {
    return macosMethods;
  } else {
    throw new Error('Unsupported platform: ' + platform);
  }
})();
