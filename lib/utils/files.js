const fs = require('fs-extra');
const path = require('path');

/**
 * Copy file and ensure directory exists
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 */
async function copyFile(src, dest) {
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}

/**
 * Check if file exists
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
function exists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Remove file or directory
 * @param {string} filePath - Path to remove
 */
async function remove(filePath) {
  await fs.remove(filePath);
}

module.exports = {
  copyFile,
  exists,
  remove
};