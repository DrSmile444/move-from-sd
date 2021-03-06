#!/usr/bin/env node
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import prettyBytes from 'pretty-bytes';
import inquirer from 'inquirer';
import inquirerFuzzyPath from 'inquirer-fuzzy-path';
import ora from 'ora';

const config = JSON.parse(fs.readFileSync('./config.json').toString());

console.log(config);

// Const fileTypes = ['.CR2', '.CR3', '']
const types = ['move', 'delete'];
const rootPath = '/Volumes/';

inquirer.registerPrompt('fuzzypath', inquirerFuzzyPath);

/**
 * @param {Date} date
 * @returns {string}
 * */
function getFullDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * @param {any[]} paths
 */
function deleteFiles(paths) {
  return Promise.all(paths.map((file) => fsp.unlink(file.file)));
}

/**
 * @param {string} destinationFolder
 * @param {any[]} paths
 */
function moveFiles(destinationFolder, paths) {
  return Promise.all(
    paths.map((file) =>
      fsp.copyFile(file.file, path.join(destinationFolder, file.fileName)),
    ),
  );
}

/**
 * @param {string} pathToRead
 * */
function getFiles(pathToRead) {
  const files = fs.readdirSync(pathToRead).map((file) => {
    const fullFilePath = path.join(pathToRead, file);
    const stat = fs.statSync(fullFilePath);

    return {
      stat,
      file: fullFilePath,
      size: stat.size,
      fileName: file,
      fullDate: getFullDate(stat.ctime),
    };
  });

  const dates = [...new Set(files.map((fileMeta) => fileMeta.fullDate))]
    .sort()
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

(async () => {
  const { root } = await inquirer.prompt([
    {
      type: 'fuzzypath',
      name: 'root',
      itemType: 'directory',
      rootPath,
      message: 'Select a volume:',
      suggestOnly: false,
      depthLimit: 0,
      excludeFilter(nodePath) {
        return nodePath === rootPath;
      },
    },
  ]);

  inquirer
    .prompt([
      {
        type: 'fuzzypath',
        name: 'pathToRead',
        itemType: 'directory',
        rootPath: root,
        message: 'Select a target directory for your photos:',
        suggestOnly: false,
        depthLimit: 5,
      },
      {
        type: 'list',
        name: 'date',
        message: 'Select files date:',
        choices(questions) {
          const { dates } = getFiles(questions.pathToRead);
          return dates;
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'Select type to process:',
        choices: types,
      },
      {
        type: 'input',
        name: 'name',
        message: 'Enter name for the folder:',
        when: (questions) => questions.type === 'move',
      },
      {
        type: 'confirm',
        name: 'deleteMoved',
        message: 'Delete photos after move?',
        default: true,
        when: (questions) => questions.type === 'move',
      },
      {
        type: 'confirm',
        name: 'confirmDelete',
        message: 'Are you sure you want to delete the photos?',
        default: false,
        when: (questions) =>
          questions.type === 'delete' || questions.deleteMoved,
      },
    ])
    .then(async (questions) => {
      const sanitizedQuestions = JSON.parse(JSON.stringify(questions));

      if (sanitizedQuestions.name) {
        sanitizedQuestions.name = sanitizedQuestions.name
          .toLowerCase()
          .replace(/ /g, '-');
      }

      const { pathToRead, confirmDelete, date, deleteMoved, type } =
        sanitizedQuestions;

      if (!pathToRead) {
        console.error('You need to provide the path in argv.');
        process.exit(1);
      }

      if (!fs.existsSync(pathToRead)) {
        console.error('Provided path is not valid:', pathToRead);
        process.exit(1);
      }

      const { files } = getFiles(pathToRead);

      if (deleteMoved && !confirmDelete) {
        console.info('*** Aborted.');
        return;
      }

      const filesToMove = files.filter(
        (file) => getFullDate(file.stat.ctime) === date,
      );
      const destinationFolder = path.join(
        config.destination,
        date + (sanitizedQuestions.name ? '-' + sanitizedQuestions.name : ''),
      );

      if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder);
      }

      switch (type) {
        case 'delete': {
          const spinner = ora(`Deleting files`);
          spinner.color = 'red';
          spinner.start();
          await deleteFiles(filesToMove);
          spinner.succeed();
          break;
        }

        case 'move': {
          const spinner = ora(`Moving files`);
          spinner.color = 'yellow';
          spinner.start();
          await moveFiles(destinationFolder, filesToMove);
          spinner.succeed();
          break;
        }

        default:
          throw new Error('Unknown type: ' + type);
      }

      if (deleteMoved) {
        const spinner = ora(`Deleting files`);
        spinner.color = 'red';
        spinner.start();
        await deleteFiles(filesToMove);
        spinner.succeed();
      }

      if (type === 'move') {
        console.log('Moved files into:', destinationFolder);
      }

      if (deleteMoved) {
        console.log('Deleted files');
      }
    });
})();
