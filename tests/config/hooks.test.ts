import { test, expect, describe } from 'bun:test';
import { HOOK_CONFIGS, CONTEXT_MONKEY_MARKER, generateHooks, createTerminalNotifierHook, isContextMonkeyHook } from '../../src/config/hooks';
import type { HookConfig, HookDefinition } from '../../src/types/index';

describe('hooks configuration', () => {
  describe('HOOK_CONFIGS', () => {
    test('contains required hook configurations', () => {
      expect(HOOK_CONFIGS).toHaveProperty('stop');
      expect(HOOK_CONFIGS).toHaveProperty('subagentStop');
      expect(HOOK_CONFIGS).toHaveProperty('notification');
    });

    test('each hook config has required properties', () => {
      Object.values(HOOK_CONFIGS).forEach(config => {
        expect(config).toHaveProperty('title');
        expect(config).toHaveProperty('message');
        expect(config).toHaveProperty('sound');
        expect(typeof config.title).toBe('string');
        expect(typeof config.message).toBe('string');
        expect(typeof config.sound).toBe('string');
      });
    });
  });

  describe('createTerminalNotifierHook', () => {
    test('creates valid hook definition', () => {
      const config: HookConfig = {
        title: 'Test Title',
        message: 'Test message in {dir}',
        sound: 'TestSound'
      };

      const hook = createTerminalNotifierHook(config);

      expect(hook).toHaveProperty('matcher');
      expect(hook).toHaveProperty('hooks');
      expect(hook.matcher).toBe('');
      expect(Array.isArray(hook.hooks)).toBe(true);
      expect(hook.hooks).toHaveLength(1);
      
      const hookItem = hook.hooks[0];
      expect(hookItem.type).toBe('command');
      expect(hookItem.timeout).toBe(10);
      expect(hookItem[CONTEXT_MONKEY_MARKER]).toBe(true);
      expect(hookItem.command).toContain('terminal-notifier');
    });

    test('replaces {dir} placeholder in message', () => {
      const config: HookConfig = {
        title: 'Test',
        message: 'Finished in {dir}',
        sound: 'Sound'
      };

      const hook = createTerminalNotifierHook(config);
      expect(hook.hooks[0].command).toContain('$dir');
      expect(hook.hooks[0].command).not.toContain('{dir}');
    });
  });

  describe('generateHooks', () => {
    test('generates all required hook types', () => {
      const hooks = generateHooks();

      expect(hooks).toHaveProperty('Stop');
      expect(hooks).toHaveProperty('SubagentStop');
      expect(hooks).toHaveProperty('Notification');
      
      expect(Array.isArray(hooks.Stop)).toBe(true);
      expect(Array.isArray(hooks.SubagentStop)).toBe(true);
      expect(Array.isArray(hooks.Notification)).toBe(true);
    });

    test('each generated hook array contains valid hook definitions', () => {
      const hooks = generateHooks();

      Object.values(hooks).forEach(hookArray => {
        expect(hookArray).toHaveLength(1);
        const hook = hookArray[0];
        expect(hook).toHaveProperty('matcher');
        expect(hook).toHaveProperty('hooks');
        expect(Array.isArray(hook.hooks)).toBe(true);
      });
    });
  });

  describe('isContextMonkeyHook', () => {
    test('returns true for Context Monkey hooks', () => {
      const contextMonkeyHook: HookDefinition = {
        matcher: '',
        hooks: [{
          type: 'command',
          command: 'test',
          timeout: 10,
          [CONTEXT_MONKEY_MARKER]: true
        }]
      };

      expect(isContextMonkeyHook(contextMonkeyHook)).toBe(true);
    });

    test('returns false for non-Context Monkey hooks', () => {
      const regularHook: HookDefinition = {
        matcher: '',
        hooks: [{
          type: 'command',
          command: 'test',
          timeout: 10
        }]
      };

      expect(isContextMonkeyHook(regularHook)).toBe(false);
    });

    test('returns false for empty hooks array', () => {
      const emptyHook: HookDefinition = {
        matcher: '',
        hooks: []
      };

      expect(isContextMonkeyHook(emptyHook)).toBe(false);
    });
  });
});