import checkDiskSpace from 'check-disk-space';
import * as drivelist from 'drivelist';

import { Drive } from '../../interfaces';

/**
 * Gets the list of volumes on macOS.
 * @returns {Drive[]} - An array of volumes with their details.
 */
export const  getVolumesMacOS = async (): Promise<Drive[]> => {
  const drives = await drivelist.list();
  const externalVolumes = drives.filter((drive) => drive.mountpoints.some((mount) => mount.path.startsWith('/Volumes/')));

  const volumes = externalVolumes.map((drive) => Promise.all(drive.mountpoints.map(async (mount) => {
    const diskSpace = await checkDiskSpace(mount.path);

    const newDrive: Drive = ({
      drive: mount.path,
      size: diskSpace.size,
      freeSpace: diskSpace.free,
      driveType: drive.isRemovable ? 'removable' : 'local',
      name: mount.label || 'Local Disk',
    });

    return newDrive;
  })));

  const completeVolumes = await Promise.all(volumes);
  return completeVolumes.flat();
};
