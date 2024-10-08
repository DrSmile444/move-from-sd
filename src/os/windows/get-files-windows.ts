import fs from 'node:fs';
import path from 'node:path';
import prettyBytes from 'pretty-bytes';

import { getFullDate } from '../../utils';
import { FileList } from '../../interfaces';

import rawList from '../../utils/raw-list.json';
import videoList from '../../utils/video-list.json';

/**
 * @param {string} pathToRead
 * */
export function getFilesWindows(pathToRead: string): FileList {
  const files = fs.readdirSync(pathToRead);

  const updatedFiles = files.map((file, index) => {
    const fullFilePath = path.join(pathToRead, file);
    const stat = fs.statSync(fullFilePath);

    const fileExtension = path.extname(file).toLowerCase();
    const rawName = file.replace(path.extname(file), '');

    const hasRawPhoto = files.some((localFile) => {
      return rawList.some((rawExtension) => {
        const lowerCaseFile = rawName + rawExtension.toLowerCase();
        const upperCaseFile = rawName + rawExtension.toUpperCase();

        return lowerCaseFile === localFile || upperCaseFile === localFile;
      })
    });

    const hasRelatedJpg = files.some((localFile) => rawName + '.JPG' === localFile || rawName + '.jpg' === localFile);
    return {
      stat,
      file: fullFilePath,
      size: stat.size,
      fileName: file,
      fullDate: getFullDate(stat.mtime),
      hasRawPhoto: hasRawPhoto,
      hasRelatedJpg: hasRelatedJpg,
      isRaw: rawList.includes(fileExtension),
      isVideo: videoList.includes(fileExtension),
    };
  });

  const dates = [...new Set(updatedFiles.map((fileMeta) => fileMeta.fullDate))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({
      value: date,
      name:
        date +
        ' (' +
        prettyBytes(
          updatedFiles
            .filter((fileMeta) => fileMeta.fullDate === date)
            .reduce((accumulator, value) => accumulator + value.size, 0),
        ) +
        ')',
    }));

  return {
    files: updatedFiles,
    dates,
  };
}
