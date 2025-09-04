const fs = require('fs-extra');
const path = require('path');
const Mustache = require('mustache');

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
 * Copy file with template processing and ensure directory exists
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 * @param {Object} context - Template context data
 */
async function copyFileWithTemplate(src, dest, context = {}) {
  await fs.ensureDir(path.dirname(dest));
  
  const templateContent = fs.readFileSync(src, 'utf8');
  const processedContent = Mustache.render(templateContent, context);
  
  await fs.writeFile(dest, processedContent);
}

module.exports = {
  copyFile,
  exists,
  remove,
  loadProjectContext,
  copyFileWithTemplate
};