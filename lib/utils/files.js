const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * Get installation path based on global flag
 * @param {boolean} isGlobal - Whether to use global installation path
 * @returns {string} Installation path
 */
function getInstallPath(isGlobal = false) {
  if (!isGlobal) {
    return '.claude'; // Local installation
  }
  
  // Global installation to user's home directory
  const homeDir = os.homedir();
  return path.join(homeDir, '.claude');
}

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


/**
 * Validate that a file path is within allowed directory
 * @param {string} filePath - Path to validate
 * @param {string} allowedDirectory - Base directory that path must be within
 * @returns {boolean} True if path is safe
 */
function validatePath(filePath, allowedDirectory) {
  const resolved = path.resolve(filePath);
  const allowed = path.resolve(allowedDirectory);
  return resolved.startsWith(allowed);
}

/**
 * Copy file with validation and ensure directory exists
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 */
async function copyFileWithValidation(src, dest) {
  // Validate source path is within project template directory
  const resourcesDir = path.join(__dirname, '../../resources');
  if (!validatePath(src, resourcesDir)) {
    throw new Error(`Invalid source path: ${src} is outside allowed resources directory`);
  }
  
  // Validate destination path is within allowed directories
  const cwd = process.cwd();
  const homeClaudeDir = path.join(require('os').homedir(), '.claude');
  const isValidDest = validatePath(dest, cwd) || validatePath(dest, homeClaudeDir);
  if (!isValidDest) {
    throw new Error(`Invalid destination path: ${dest} is outside allowed directories`);
  }
  
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}

module.exports = {
  getInstallPath,
  copyFile,
  exists,
  remove,
  copyFileWithValidation
};