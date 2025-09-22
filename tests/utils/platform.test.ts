import { describe, expect, test, beforeEach, afterEach, vi } from 'bun:test';
import os from 'os';
import * as childProcess from 'child_process';

import { isMacOS, getPlatformInfo, checkTerminalNotifierAvailable } from '../../src/utils/platform';
import * as platformModule from '../../src/utils/platform';

describe('platform utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isMacOS', () => {
    test('returns true when os.platform reports darwin', () => {
      vi.spyOn(os, 'platform').mockReturnValue('darwin');
      expect(isMacOS()).toBe(true);
    });

    test('returns false on non-darwin platforms', () => {
      vi.spyOn(os, 'platform').mockReturnValue('linux');
      expect(isMacOS()).toBe(false);
    });
  });

  describe('getPlatformInfo', () => {
    test('returns macOS info when running on darwin', () => {
      vi.spyOn(os, 'platform').mockReturnValue('darwin');
      const info = getPlatformInfo();
      expect(info.platform).toBe('macOS');
      expect(info.supportsNotifications).toBe(true);
      expect(info.notificationMethod).toBe('terminal-notifier');
      expect(info.requirements).toContain('terminal-notifier');
    });

    test('returns Windows info when running on win32', () => {
      vi.spyOn(os, 'platform').mockReturnValue('win32');
      const info = getPlatformInfo();
      expect(info.platform).toBe('Windows');
      expect(info.supportsNotifications).toBe(false);
    });

    test('returns Linux info when running on linux', () => {
      vi.spyOn(os, 'platform').mockReturnValue('linux');
      const info = getPlatformInfo();
      expect(info.platform).toBe('Linux');
      expect(info.supportsNotifications).toBe(false);
    });

    test('falls back to raw platform name for unknown platforms', () => {
      vi.spyOn(os, 'platform').mockReturnValue('freebsd');
      const info = getPlatformInfo();
      expect(info.platform).toBe('freebsd');
      expect(info.supportsNotifications).toBe(false);
    });
  });

  describe('checkTerminalNotifierAvailable', () => {
    const createFakeSpawn = (
      trigger: (handlers: Record<string, Array<(value: unknown) => void>>) => void
    ) => {
      return vi.spyOn(childProcess, 'spawn').mockImplementation(() => {
        const handlers: Record<string, Array<(value: unknown) => void>> = {};
        const fakeProcess: Partial<childProcess.ChildProcessWithoutNullStreams> = {
          on(event: string, handler: (value: unknown) => void) {
            handlers[event] = handlers[event] || [];
            handlers[event]!.push(handler);
            return fakeProcess as childProcess.ChildProcessWithoutNullStreams;
          },
        };

        globalThis.setTimeout(() => {
          trigger(handlers);
        }, 0);

        return fakeProcess as childProcess.ChildProcessWithoutNullStreams;
      });
    };

    test('returns false immediately on non-macOS platforms', async () => {
      vi.spyOn(platformModule, 'isMacOS').mockReturnValue(false);
      const spawnSpy = vi.spyOn(childProcess, 'spawn');

      const result = await checkTerminalNotifierAvailable();

      expect(result).toBe(false);
      expect(spawnSpy).not.toHaveBeenCalled();
    });

    test('resolves true when terminal-notifier is found', async () => {
      vi.spyOn(platformModule, 'isMacOS').mockReturnValue(true);

      const spawnSpy = createFakeSpawn(handlers => {
        handlers['close']?.forEach(cb => cb(0));
      });

      const result = await checkTerminalNotifierAvailable();

      expect(result).toBe(true);
      expect(spawnSpy).toHaveBeenCalledWith('which', ['terminal-notifier'], { stdio: 'ignore' });
    });

    test('resolves false when terminal-notifier is missing', async () => {
      vi.spyOn(platformModule, 'isMacOS').mockReturnValue(true);

      createFakeSpawn(handlers => {
        handlers['close']?.forEach(cb => cb(1));
      });

      const result = await checkTerminalNotifierAvailable();
      expect(result).toBe(false);
    });

    test('resolves false when spawn emits an error', async () => {
      vi.spyOn(platformModule, 'isMacOS').mockReturnValue(true);

      createFakeSpawn(handlers => {
        handlers['error']?.forEach(cb => cb(new Error('spawn failure')));
      });

      const result = await checkTerminalNotifierAvailable();
      expect(result).toBe(false);
    });
  });
});
