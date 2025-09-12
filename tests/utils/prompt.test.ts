import { test, expect, describe } from 'bun:test';
import { confirmHooksInstallation } from '../../src/utils/prompt';
import type { PlatformInfo } from '../../src/types/index';

describe('prompt utilities', () => {
  describe('confirmHooksInstallation', () => {
    test('returns false immediately for unsupported platforms', async () => {
      const windowsPlatform: PlatformInfo = {
        platform: 'Windows',
        supportsNotifications: false,
        requirements: 'Not currently supported',
        notificationMethod: null
      };

      const result = await confirmHooksInstallation(windowsPlatform);
      expect(result).toBe(false);
    });

    test('returns false for linux platform', async () => {
      const linuxPlatform: PlatformInfo = {
        platform: 'Linux',
        supportsNotifications: false,
        requirements: 'Not currently supported',
        notificationMethod: null
      };

      const result = await confirmHooksInstallation(linuxPlatform);
      expect(result).toBe(false);
    });

    test('platform info structure validation', () => {
      const validPlatform: PlatformInfo = {
        platform: 'macOS',
        supportsNotifications: true,
        requirements: 'terminal-notifier (install via: brew install terminal-notifier)',
        notificationMethod: 'terminal-notifier'
      };

      expect(typeof validPlatform.platform).toBe('string');
      expect(typeof validPlatform.supportsNotifications).toBe('boolean');
      expect(typeof validPlatform.requirements).toBe('string');
      expect(validPlatform.notificationMethod === null || typeof validPlatform.notificationMethod === 'string').toBe(true);
    });
  });
});