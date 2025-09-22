import { describe, expect, test, beforeEach, afterEach, vi } from 'bun:test';
import readline from 'readline';

import * as promptModule from '../../src/utils/prompt';
import type { PlatformInfo } from '../../src/types/index';

const { askQuestion, confirmHooksInstallation, confirmHooksRemoval } = promptModule;

describe('prompt utilities', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('askQuestion normalizes answers to lowercase and trims whitespace', async () => {
    const close = vi.fn();
    const question = vi.fn((_prompt: string, handler: (answer: string) => void) => {
      handler('  Yes  ');
    });

    const createInterface = vi
      .spyOn(readline, 'createInterface')
      .mockReturnValue({ question, close } as unknown as readline.Interface);

    const result = await askQuestion('Confirm? ');

    expect(result).toBe('yes');
    expect(createInterface).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  test('confirmHooksInstallation returns false when platform does not support notifications', async () => {
    const platformInfo: PlatformInfo = {
      platform: 'Windows',
      supportsNotifications: false,
      requirements: 'Not currently supported',
      notificationMethod: null,
    };

    const result = await confirmHooksInstallation(platformInfo);
    expect(result).toBe(false);
  });

  test('confirmHooksInstallation returns true for affirmative responses on supported platforms', async () => {
    const platformInfo: PlatformInfo = {
      platform: 'macOS',
      supportsNotifications: true,
      requirements: 'terminal-notifier',
      notificationMethod: 'terminal-notifier',
    };

    const askSpy = vi.spyOn(promptModule, 'askQuestion').mockResolvedValue('');

    const emptyResult = await confirmHooksInstallation(platformInfo);
    expect(emptyResult).toBe(true);

    askSpy.mockResolvedValueOnce('y');
    const yesResult = await confirmHooksInstallation(platformInfo);
    expect(yesResult).toBe(true);

    askSpy.mockResolvedValueOnce('yes');
    const fullYesResult = await confirmHooksInstallation(platformInfo);
    expect(fullYesResult).toBe(true);

    askSpy.mockRestore();
  });

  test('confirmHooksInstallation returns false when user declines', async () => {
    const platformInfo: PlatformInfo = {
      platform: 'macOS',
      supportsNotifications: true,
      requirements: 'terminal-notifier',
      notificationMethod: 'terminal-notifier',
    };

    const askSpy = vi.spyOn(promptModule, 'askQuestion').mockResolvedValue('no');

    const result = await confirmHooksInstallation(platformInfo);
    expect(result).toBe(false);

    askSpy.mockRestore();
  });

  test('confirmHooksRemoval confirms only affirmative responses', async () => {
    const askSpy = vi.spyOn(promptModule, 'askQuestion').mockResolvedValue('y');

    const positive = await confirmHooksRemoval(3);
    expect(positive).toBe(true);

    askSpy.mockResolvedValueOnce('yes');
    const fullYes = await confirmHooksRemoval(1);
    expect(fullYes).toBe(true);

    askSpy.mockResolvedValueOnce('n');
    const negative = await confirmHooksRemoval(2);
    expect(negative).toBe(false);

    askSpy.mockRestore();
  });
});
