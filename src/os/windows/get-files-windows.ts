import fs from 'node:fs';
import path from 'node:path';
import prettyBytes from 'pretty-bytes';

import { getFullDate } from '../../utils';
import { FileList } from '../../interfaces';

/**
 * @param {string} pathToRead
 * */
export function getFilesWindows(pathToRead: string): FileList {
  const files = fs.readdirSync(pathToRead).map((file, index) => {
    const fullFilePath = path.join(pathToRead, file);
    const stat = fs.statSync(fullFilePath);

    return {
      stat,
      file: fullFilePath,
      size: stat.size,
      fileName: file,
      fullDate: getFullDate(stat.atimeMs),
    };
  });

  const dates = [...new Set(files.map((fileMeta) => fileMeta.fullDate))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({
      value: date,
      name:
        date +
        ' (' +
        prettyBytes(
          files
            .filter((fileMeta) => fileMeta.fullDate === date)
            .reduce((accumulator, value) => accumulator + value.size, 0),
        ) +
        ')',
    }));

  return {
    files,
    dates,
  };
}

