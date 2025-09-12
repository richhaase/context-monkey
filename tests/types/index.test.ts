import { test, expect, describe } from 'bun:test';
import type {
  InstallOptions,
  UninstallOptions,
  PlatformInfo,
  HookConfig,
  ClaudeSettings,
  HookDefinition,
  ValidationResult,
} from '../../src/types/index';

describe('TypeScript type definitions', () => {
  test('InstallOptions interface works correctly', () => {
    const validOptions: InstallOptions = {
      local: true,
      assumeYes: false,
      _skipExistingCheck: true,
    };

    expect(typeof validOptions.local).toBe('boolean');
    expect(typeof validOptions.assumeYes).toBe('boolean');
    expect(typeof validOptions._skipExistingCheck).toBe('boolean');

    // All properties are optional
    const emptyOptions: InstallOptions = {};
    expect(typeof emptyOptions).toBe('object');
  });

  test('UninstallOptions interface works correctly', () => {
    const validOptions: UninstallOptions = {
      local: false,
      assumeYes: true,
    };

    expect(typeof validOptions.local).toBe('boolean');
    expect(typeof validOptions.assumeYes).toBe('boolean');
  });

  test('PlatformInfo interface works correctly', () => {
    const validPlatform: PlatformInfo = {
      platform: 'macOS',
      supportsNotifications: true,
      requirements: 'terminal-notifier required',
      notificationMethod: 'terminal-notifier',
    };

    expect(typeof validPlatform.platform).toBe('string');
    expect(typeof validPlatform.supportsNotifications).toBe('boolean');
    expect(typeof validPlatform.requirements).toBe('string');
    expect(
      validPlatform.notificationMethod === null ||
        typeof validPlatform.notificationMethod === 'string'
    ).toBe(true);
  });

  test('HookConfig interface works correctly', () => {
    const validConfig: HookConfig = {
      title: 'Test Hook',
      message: 'Test message',
      sound: 'Ping',
    };

    expect(typeof validConfig.title).toBe('string');
    expect(typeof validConfig.message).toBe('string');
    expect(typeof validConfig.sound).toBe('string');
  });

  test('ValidationResult interface works correctly', () => {
    const validResult: ValidationResult = {
      isValid: true,
      issues: [],
    };

    const invalidResult: ValidationResult = {
      isValid: false,
      issues: ['Error 1', 'Error 2'],
    };

    expect(typeof validResult.isValid).toBe('boolean');
    expect(Array.isArray(validResult.issues)).toBe(true);
    expect(typeof invalidResult.isValid).toBe('boolean');
    expect(Array.isArray(invalidResult.issues)).toBe(true);
  });

  test('HookDefinition interface structure', () => {
    const validHook: HookDefinition = {
      matcher: '',
      hooks: [
        {
          type: 'command',
          command: 'echo test',
          timeout: 10,
          __context_monkey_hook__: true,
        },
      ],
    };

    expect(typeof validHook.matcher).toBe('string');
    expect(Array.isArray(validHook.hooks)).toBe(true);
    expect(validHook.hooks.length).toBeGreaterThan(0);

    const hook = validHook.hooks[0];
    expect(typeof hook.type).toBe('string');
    expect(typeof hook.command).toBe('string');
    expect(typeof hook.timeout).toBe('number');
  });

  test('ClaudeSettings interface flexibility', () => {
    const minimalSettings: ClaudeSettings = {};
    expect(typeof minimalSettings).toBe('object');

    const fullSettings: ClaudeSettings = {
      model: 'claude-3',
      hooks: {
        Stop: [
          {
            matcher: '',
            hooks: [
              {
                type: 'command',
                command: 'test',
                timeout: 10,
              },
            ],
          },
        ],
      },
      customProperty: 'custom value',
    };

    expect(typeof fullSettings.model).toBe('string');
    expect(typeof fullSettings.hooks).toBe('object');
    expect(typeof fullSettings.customProperty).toBe('string');
  });
});
