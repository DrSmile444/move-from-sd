import fs from 'fs';
import path from 'path';

import inquirer from 'inquirer';

const config = fs.readFileSync('./config.json');

const [, , pathToRead, date, type] = process.argv;

const types = ['move', 'delete'];

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
  paths.forEach((file) => fs.unlinkSync(file.file));
}

/**
 * @param {string} destinationFolder
 * @param {any[]} paths
 */
function moveFiles(destinationFolder, paths) {
  paths.forEach((file) => fs.copyFileSync(file.file, path.join(destinationFolder, file.fileName)));
}

(async () => {
  if (!pathToRead) {
    console.error('You need to provide the path in argv.');
    process.exit(1);
  }

  if (!fs.existsSync(pathToRead)) {
    console.error('Provided path is not valid:', pathToRead);
    process.exit(1);
  }

  const files = fs.readdirSync(pathToRead).map((file) => ({ stat: fs.statSync(path.join(pathToRead, file)), file: path.join(pathToRead, file), fileName: file }));
  const dates = [...new Set(files.map((stat) => getFullDate(stat.stat.ctime)))].sort();

  inquirer.prompt([
    {
      type: 'list',
      name: 'date',
      message: 'Select files date:',
      choices: dates,
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
      when: (questions) => questions.type === 'move'
    },
    {
      type: 'confirm',
      name: 'confirmDelete',
      message: 'Are you sure you want to delete the photos?',
      default: false,
      when: (questions) => questions.type === 'delete' || questions.deleteMoved
    }
  ]).then((questions) => {
    const sanitizedQuestions = JSON.parse(JSON.stringify(questions));

    if (sanitizedQuestions.name) {
      sanitizedQuestions.name = sanitizedQuestions.name.toLowerCase().replace(/ /g, '-');
    }

    if (!sanitizedQuestions.confirmDelete) {
      console.info('*** Aborted.');
      return;
    }

    const filesToMove = files.filter((file) => getFullDate(file.stat.ctime) === date);
    const destinationFolder = path.join(config.destination, date);

    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }

    switch (type) {
      case 'delete':
        deleteFiles(filesToMove);
        break;

      case 'move':
        moveFiles(destinationFolder, filesToMove);
        break;

      default:
        throw new Error('Unknown type: ' + type);
    }

    if (sanitizedQuestions.deleteMoved) {
      deleteFiles(filesToMove);
    }

    if (type === 'move') {
      console.log('Moved files into:', destinationFolder);
    }

    if (sanitizedQuestions.deleteMoved) {
      console.log('Deleted files');
    }
  });
})();
