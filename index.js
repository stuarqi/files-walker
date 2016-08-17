'use strict';
const fs = require('fs');
const path = require('path');

const co = require('co');

function fileStat(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stat) => {
      resolve(stat);
    });
  });
}

function fileAccess(path) {
  return new Promise((resolve, reject) => {
    fs.access(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function readDir(dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

/**
 * Files in the specified directory traversal
 * @param {string} dirPath The directory path
 * @param {function} filter File filter, Will use the [processor] to processing file when returns [True] and otherwise skip
 * @param {function} processor File processor, must be returns a Promise object
 * @returns {Promise}
 */
function walk(dirPath, filter, processor) {
  return new Promise((resolve, reject) => {
    fileAccess(dirPath)
      .then(() => readDir(dirPath))
      .then(files => co(walkFile(dirPath, files, filter, processor)))
      .then(() => resolve())
      .catch(err => console.log(err));
  });
}

function walkFile(dirPath, files, filter, processor) {
  return function* () {
    for (let file of files) {
      const filePath = path.resolve(dirPath, file);
      const stat = yield fileStat(filePath);
      if (stat) {
        if (stat.isDirectory()) {
          yield walk(filePath, filter, processor);
        } else {
          if (filter(file)) {
            yield processor(filePath);
          }
        }
      }
    }
  };
}

module.exports = {
  walk
};