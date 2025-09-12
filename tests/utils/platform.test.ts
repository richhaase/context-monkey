import { test, expect, describe } from 'bun:test';
import { isMacOS, getPlatformInfo, checkTerminalNotifierAvailable } from '../../src/utils/platform';
import os from 'os';

describe('platform utilities', () => {
  describe('isMacOS', () => {
    test('returns correct value based on actual platform', () => {
      const expectedResult = os.platform() === 'darwin';
      expect(isMacOS()).toBe(expectedResult);
    });
  });

  describe('getPlatformInfo', () => {
    test('returns valid platform info object', () => {
      const info = getPlatformInfo();
      
      // Test that required properties exist
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('supportsNotifications');
      expect(info).toHaveProperty('requirements');
      expect(info).toHaveProperty('notificationMethod');
      
      // Test property types
      expect(typeof info.platform).toBe('string');
      expect(typeof info.supportsNotifications).toBe('boolean');
      expect(typeof info.requirements).toBe('string');
      expect(info.notificationMethod === null || typeof info.notificationMethod === 'string').toBe(true);
    });

    test('returns macOS info when on darwin platform', () => {
      if (os.platform() === 'darwin') {
        const info = getPlatformInfo();
        expect(info.platform).toBe('macOS');
        expect(info.supportsNotifications).toBe(true);
        expect(info.notificationMethod).toBe('terminal-notifier');
        expect(info.requirements).toContain('terminal-notifier');
      }
    });

    test('returns non-macOS info when on other platforms', () => {
      if (os.platform() !== 'darwin') {
        const info = getPlatformInfo();
        expect(info.platform).not.toBe('macOS');
        expect(info.supportsNotifications).toBe(false);
        expect(info.notificationMethod).toBe(null);
        expect(info.requirements).toBe('Not currently supported');
      }
    });

    test('maps platform names correctly', () => {
      const info = getPlatformInfo();
      const platform = os.platform();
      
      switch (platform) {
        case 'darwin':
          expect(info.platform).toBe('macOS');
          break;
        case 'win32':
          expect(info.platform).toBe('Windows');
          break;
        case 'linux':
          expect(info.platform).toBe('Linux');
          break;
        default:
          expect(info.platform).toBe(platform);
      }
    });
  });

  describe('checkTerminalNotifierAvailable', () => {
    test('returns false on non-macOS platforms', async () => {
      if (os.platform() !== 'darwin') {
        const result = await checkTerminalNotifierAvailable();
        expect(result).toBe(false);
      }
    });

    test('returns boolean on macOS platforms', async () => {
      if (os.platform() === 'darwin') {
        const result = await checkTerminalNotifierAvailable();
        expect(typeof result).toBe('boolean');
      }
    });

    test('handles errors gracefully', async () => {
      // This should always return a boolean, never throw
      const result = await checkTerminalNotifierAvailable();
      expect(typeof result).toBe('boolean');
    });
  });
});