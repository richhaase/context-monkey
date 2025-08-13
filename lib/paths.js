const path = require('path');
const os = require('os');
const { directoryExists } = require('./utils');

/**
 * Get potential Claude Code installation paths
 */
function getClaudeCodePaths() {
  const homedir = os.homedir();
  
  return {
    global: path.join(homedir, '.claude'),
    project: path.join(process.cwd(), '.claude')
  };
}

/**
 * Detect if Claude Code is installed
 */
async function detectClaudeCode() {
  const paths = getClaudeCodePaths();
  
  const globalExists = await directoryExists(paths.global);
  const projectExists = await directoryExists(paths.project);
  
  return {
    global: globalExists,
    project: projectExists,
    paths
  };
}

module.exports = {
  getClaudeCodePaths,
  detectClaudeCode
};