import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively fetch all folders up to a specified depth in a given drive.
 * @param {string} drive - The drive letter (e.g., 'C:') or path.
 * @param {number} depth - Current depth of recursion.
 * @param {number} maxDepth - Maximum depth to fetch subfolders.
 * @returns {string[]} - An array of folder paths.
 */
export function getFoldersWindows(drive: string, depth: number = 0, maxDepth: number = 5): string[] {
  // Normalize the drive path and initialize the folders array
  const drivePath = path.resolve(drive);
  const folders: string[] = [];

  try {
    // Read the contents of the current directory
    const items = fs.readdirSync(drivePath, { withFileTypes: true });

    // Iterate through each item in the directory
    for (const item of items) {
      if (item.isDirectory()) {
        const fullPath = path.join(drivePath, item.name);

        // Add the folder path to the list
        folders.push(fullPath);

        // Recursively get folders if we haven't reached the maximum depth
        if (depth < maxDepth) {
          folders.push(...getFoldersWindows(fullPath, depth + 1, maxDepth));
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${drivePath}:`, error);
  }

  return folders;
}

// Example usage:
// const drive = 'F:\\'; // Specify the drive letter or path
// const folders = getFoldersWindows(drive);
// console.log(folders);
