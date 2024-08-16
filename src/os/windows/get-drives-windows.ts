import { execSync } from 'child_process';

import { Drive } from '../../interfaces';

export const getDrivesWindows = (): Drive[] => {
  try {
    const output = execSync('wmic logicaldisk get name,volumename').toString();
    const lines = output.split('\n').filter(line => line.trim() !== '');

    const drives = lines.slice(1).map(line => {
      const [drive, ...nameChunks] = line.trim().split(/\s+/);
      const name = nameChunks.join(' ');
      return { drive: drive || '', name: name || 'Local Disk' };
    }).filter(drive => drive.drive);

    return drives;
  } catch (error) {
    console.error('Error finding drives on Windows:', error);
    return [];
  }
};
