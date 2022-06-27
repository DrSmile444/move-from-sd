const fs = require('fs');
const path = require('path');

const config = require('../config.json');

const [, , pathToRead, date] = process.argv;

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
    console.info('Entered date:', date);
    const filesToMove = files.filter((file) => getFullDate(file.stat.atime) === date);
    const destinationFolder = path.join(config.destination, date);

    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }

    filesToMove.forEach((file) => fs.copyFileSync(file.file, path.join(destinationFolder, file.fileName)));

    console.log(filesToMove);
  } else {
    const dates = [...new Set(files.map((stat) => getFullDate(stat.stat.atime)))].sort();

    console.info('*** Select one of the following date for files:');
    console.info('');
    console.info(dates.join('\n'));
    console.info('');
  }
})();
