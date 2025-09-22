import { describe, expect, test, beforeEach, afterEach, vi } from 'bun:test';
import fs from 'fs';
import path from 'path';
import os from 'os';

import {
  loadSettings,
  mergeHooks,
  removeContextMonkeyHooks,
  saveSettings,
  countContextMonkeyHooks,
  validateSettings,
} from '../../src/utils/settings';
import { generateHooks } from '../../src/config/hooks';
import type { ClaudeSettings } from '../../src/types/index';

const settingsFile = 'settings.json';

describe('settings utilities', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-settings-test-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('loadSettings returns parsed settings when file exists', () => {
    const data: ClaudeSettings = { hooks: { Stop: [] } };
    fs.writeFileSync(path.join(tempDir, settingsFile), JSON.stringify(data), 'utf8');

    const result = loadSettings(tempDir);
    expect(result).toEqual(data);
  });

  test('loadSettings returns empty object when file is missing', () => {
    const result = loadSettings(tempDir);
    expect(result).toEqual({});
  });

  test('loadSettings backs up malformed file and returns empty object', () => {
    fs.writeFileSync(path.join(tempDir, settingsFile), '{malformed-json', 'utf8');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    const result = loadSettings(tempDir);

    expect(result).toEqual({});
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Warning: Could not parse existing settings.json')
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Created backup: settings.json.backup.1700000000000')
    );

    const backupPath = path.join(tempDir, 'settings.json.backup.1700000000000');
    expect(fs.existsSync(backupPath)).toBe(true);

    warnSpy.mockRestore();
    logSpy.mockRestore();
    nowSpy.mockRestore();
  });

  test('mergeHooks removes old Context Monkey hooks before adding new ones', () => {
    const hooks = generateHooks();
    const existing: ClaudeSettings = {
      hooks: {
        Stop: [
          { matcher: '', hooks: [{ type: 'command', command: 'echo existing', timeout: 5 }] },
          hooks.Stop[0],
        ],
        Custom: [{ matcher: '', hooks: [{ type: 'command', command: 'custom', timeout: 1 }] }],
      },
    };

    const merged = mergeHooks(existing, hooks);

    expect(merged.hooks?.Stop?.length).toBe(2);
    expect(merged.hooks?.Stop?.[0].hooks?.[0].command).toBe('echo existing');
    expect(merged.hooks?.Stop?.[1].hooks?.[0].command).toContain('terminal-notifier');
    expect(merged.hooks?.Custom).toEqual(existing.hooks.Custom);
  });

  test('removeContextMonkeyHooks strips Context Monkey hooks and cleans empty arrays', () => {
    const hooks = generateHooks();
    const settings: ClaudeSettings = {
      hooks: {
        Stop: [
          hooks.Stop[0],
          { matcher: '', hooks: [{ type: 'command', command: 'keep', timeout: 1 }] },
        ],
        Notification: [hooks.Notification[0]],
      },
    };

    const cleaned = removeContextMonkeyHooks(settings);

    expect(cleaned.hooks?.Stop?.length).toBe(1);
    expect(cleaned.hooks?.Stop?.[0].hooks?.[0].command).toBe('keep');
    expect(cleaned.hooks?.Notification).toBeUndefined();
  });

  test('saveSettings writes formatted JSON and ensures directory exists', () => {
    const targetDir = path.join(tempDir, 'nested');
    const data: ClaudeSettings = { hooks: {} };

    saveSettings(targetDir, data);

    const saved = fs.readFileSync(path.join(targetDir, settingsFile), 'utf8');
    expect(JSON.parse(saved)).toEqual(data);
  });

  test('saveSettings throws with descriptive message on write failure', () => {
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('disk full');
    });

    const emptySettings: ClaudeSettings = {};

    expect(() => saveSettings(tempDir, emptySettings)).toThrow(
      'Failed to save settings.json: disk full'
    );

    writeSpy.mockRestore();
  });

  test('countContextMonkeyHooks only counts hooks marked as Context Monkey hooks', () => {
    const hooks = generateHooks();
    const settings: ClaudeSettings = {
      hooks: {
        Stop: [
          hooks.Stop[0],
          { matcher: '', hooks: [{ type: 'command', command: 'keep', timeout: 1 }] },
        ],
        Notification: [hooks.Notification[0]],
      },
    };

    expect(countContextMonkeyHooks(settings)).toBe(2);
  });

  test('validateSettings returns issues for invalid structures', () => {
    const nonObject = validateSettings(null);
    expect(nonObject.isValid).toBe(false);
    expect(nonObject.issues).toContain('Settings must be an object');

    const invalidHooksType = validateSettings({ hooks: 'not-an-object' });
    expect(invalidHooksType.isValid).toBe(false);
    expect(invalidHooksType.issues).toContain('hooks property must be an object');

    const invalidHookEntries = validateSettings({ hooks: { Stop: 'not-array' } });
    expect(invalidHookEntries.isValid).toBe(false);
    expect(invalidHookEntries.issues).toContain('hooks.Stop must be an array');
  });

  test('validateSettings accepts well-formed settings', () => {
    const hooks = generateHooks();
    const valid = validateSettings({ hooks });
    expect(valid.isValid).toBe(true);
    expect(valid.issues).toEqual([]);
  });
});
