const os = require('os');

/**
 * Check if the current platform is macOS
 * @returns {boolean} true if running on macOS
 */
function isMacOS() {
  return os.platform() === 'darwin';
}

/**
 * Get platform-specific information for notifications
 * @returns {Object} Platform capabilities and requirements
 */
function getPlatformInfo() {
  const platform = os.platform();
  
  switch (platform) {
    case 'darwin':
      return {
        platform: 'macOS',
        supportsNotifications: true,
        requirements: 'terminal-notifier (install via: brew install terminal-notifier)',
        notificationMethod: 'terminal-notifier'
      };
    
    case 'win32':
      return {
        platform: 'Windows',
        supportsNotifications: false,
        requirements: 'Not currently supported',
        notificationMethod: null
      };
    
    case 'linux':
      return {
        platform: 'Linux',
        supportsNotifications: false,
        requirements: 'Not currently supported',
        notificationMethod: null
      };
    
    default:
      return {
        platform: platform,
        supportsNotifications: false,
        requirements: 'Not currently supported',
        notificationMethod: null
      };
  }
}

/**
 * Check if terminal-notifier is available on macOS
 * @returns {Promise<boolean>} true if terminal-notifier is available
 */
async function checkTerminalNotifierAvailable() {
  if (!isMacOS()) {
    return false;
  }
  
  try {
    const { spawn } = require('child_process');
    return new Promise((resolve) => {
      const child = spawn('which', ['terminal-notifier'], { stdio: 'ignore' });
      child.on('close', (code) => {
        resolve(code === 0);
      });
      child.on('error', () => {
        resolve(false);
      });
    });
  } catch (error) {
    return false;
  }
}

module.exports = {
  isMacOS,
  getPlatformInfo,
  checkTerminalNotifierAvailable
};