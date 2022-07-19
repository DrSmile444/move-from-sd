const fs = require('fs');
const path = require('path');

const config = require('../config.json');

const [, , pathToRead, date, type] = process.argv;

const types = ['delete', 'move'];

/**
 * @param {Date} date
 * @returns {string}
 * */
function getFullDate(date) {
  return date.toISOString().slice(0, 10)
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

  if (date) {
    if (!type || !types.includes(type)) {
      console.error('You need to use one of the following types:', types.join(', '));
      process.exit(1);
    }

    console.info('Entered date:', date);
    const filesToMove = files.filter((file) => getFullDate(file.stat.ctime) === date);
    const destinationFolder = path.join(config.destination, date);

    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }

    switch (type) {
      case 'delete':
        filesToMove.forEach((file) => fs.unlinkSync(file.file));
        break;

      case 'move':
        filesToMove.forEach((file) => fs.copyFileSync(file.file, path.join(destinationFolder, file.fileName)));
        break;

      default:
        throw new Error('Unknown type: ' + type);
    }

    console.log(filesToMove);

    if (type === 'move') {
      console.log('Moved files into:', destinationFolder);
    }
  } else {
    const dates = [...new Set(files.map((stat) => getFullDate(stat.stat.ctime)))].sort();

    console.info('*** Select one of the following date for files:');
    console.info('');
    console.info(dates.join('\n'));
    console.info('');
  }
})();
