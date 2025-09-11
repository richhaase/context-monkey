import os from 'os';
import { spawn } from 'child_process';
import { PlatformInfo } from '../types/index.js';

/**
 * Check if the current platform is macOS
 * @returns true if running on macOS
 */
export function isMacOS(): boolean {
  return os.platform() === 'darwin';
}

/**
 * Get platform-specific information for notifications
 * @returns Platform capabilities and requirements
 */
export function getPlatformInfo(): PlatformInfo {
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
 * @returns true if terminal-notifier is available
 */
export async function checkTerminalNotifierAvailable(): Promise<boolean> {
  if (!isMacOS()) {
    return false;
  }
  
  try {
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