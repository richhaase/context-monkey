const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const Mustache = require('mustache');

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
 * Load project context from .monkey files
 * @returns {Object} Object with context data for templates
 */
function loadProjectContext() {
  const stackPath = '.monkey/stack.md';
  const rulesPath = '.monkey/rules.md';
  const packageJson = require('../../package.json');
  
  let stackInfo = '';
  let projectRules = '';
  
  if (exists(stackPath)) {
    stackInfo = fs.readFileSync(stackPath, 'utf8').trim();
  }
  
  if (exists(rulesPath)) {
    projectRules = fs.readFileSync(rulesPath, 'utf8').trim();
  }
  
  return {
    version: packageJson.version,
    stackInfo,
    projectRules,
    hasStack: !!stackInfo,
    hasRules: !!projectRules,
    noStack: !stackInfo,
    noRules: !projectRules
  };
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
 * Copy file with template processing and ensure directory exists
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 * @param {Object} context - Template context data
 */
async function copyFileWithTemplate(src, dest, context = {}) {
  // Validate source path is within project template directory
  const templateDir = path.join(__dirname, '../../templates');
  if (!validatePath(src, templateDir)) {
    throw new Error(`Invalid source path: ${src} is outside allowed template directory`);
  }
  
  // Validate destination path is within allowed directories
  const cwd = process.cwd();
  const homeClaudeDir = path.join(require('os').homedir(), '.claude');
  const isValidDest = validatePath(dest, cwd) || validatePath(dest, homeClaudeDir);
  if (!isValidDest) {
    throw new Error(`Invalid destination path: ${dest} is outside allowed directories`);
  }
  
  await fs.ensureDir(path.dirname(dest));
  
  const templateContent = fs.readFileSync(src, 'utf8');
  const processedContent = Mustache.render(templateContent, context);
  
  await fs.writeFile(dest, processedContent);
}

module.exports = {
  getInstallPath,
  copyFile,
  exists,
  remove,
  loadProjectContext,
  copyFileWithTemplate
};