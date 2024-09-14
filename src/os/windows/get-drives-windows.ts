import { execSync } from 'child_process';

import { Drive } from '../../interfaces';

function parseDriveInfo(fileContent: string): Drive[] {
  // Split the content into lines
  const lines = fileContent.trim().split('\n');

  // Extract headers and remove extra whitespace
  const headers = lines[0].split(/\s+/);

  // Find index positions for each header to dynamically access values
  const driveTypeIndex = headers.indexOf('DriveType');
  const freeSpaceIndex = headers.indexOf('FreeSpace');
  const nameIndex = headers.indexOf('Name');
  const sizeIndex = headers.indexOf('Size');
  const volumeNameIndex = headers.indexOf('VolumeName');

  // Initialize an array to hold parsed drive information
  const drives: Drive[] = [];

  // Iterate over each line after the header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue; // Skip empty lines

    // Split the line into fields using whitespace
    const fields = line.split(/\s+/);

    // Convert DriveType to 'local', 'removable', or 'unknown'
    let driveType: Drive['driveType'];
    switch (Number(fields[driveTypeIndex])) {
      case 3:
        driveType = 'local';
        break;
      case 2:
        driveType = 'removable';
        break;
      default:
        driveType = 'unknown';
        break;
    }

    // Create an object representing the drive information mapped to the Drive interface
    const driveInfo: Drive = {
      drive: fields[nameIndex],
      size: Number(fields[sizeIndex]),
      freeSpace: Number(fields[freeSpaceIndex]),
      driveType,
      name: volumeNameIndex !== -1 ? fields[volumeNameIndex] || 'Local Disk' : 'Local Disk',
    };

    // Add the drive info object to the array
    drives.push(driveInfo);
  }

  return drives;
}

export const getDrivesWindows = (): Drive[] => {
  try {
    const output = execSync('wmic logicaldisk get name,volumename,drivetype,freespace,size').toString();

    return parseDriveInfo(output);
  } catch (error) {
    console.error('Error finding drives on Windows:', error);
    return [];
  }
};
