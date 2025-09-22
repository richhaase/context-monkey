import { describe, expect, test, afterEach, vi } from 'bun:test';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';

import { installClaude } from '../../src/commands/installers/claude';
import * as platformModule from '../../src/utils/platform';
import * as promptModule from '../../src/utils/prompt';
import * as settingsModule from '../../src/utils/settings';

const realHomedir = os.homedir;

async function withTempHome(run: (home: string) => Promise<void>): Promise<void> {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-claude-hooks-'));
  // @ts-expect-error override homedir for tests
  os.homedir = () => tempHome;
  try {
    await run(tempHome);
  } finally {
    // @ts-expect-error restore original homedir
    os.homedir = realHomedir;
    await fs.remove(tempHome);
  }
}

describe('Claude installer hook handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('removes existing commands and agents during upgrade and reports updated hooks', async () => {
    vi.spyOn(platformModule, 'getPlatformInfo').mockReturnValue({
      platform: 'macOS',
      supportsNotifications: true,
      requirements: 'terminal-notifier',
      notificationMethod: 'terminal-notifier',
    });
    vi.spyOn(platformModule, 'isMacOS').mockReturnValue(false);
    vi.spyOn(platformModule, 'checkTerminalNotifierAvailable').mockResolvedValue(true);
    vi.spyOn(promptModule, 'confirmHooksInstallation').mockResolvedValue(true);

    await withTempHome(async home => {
      await installClaude();

      const commandsDir = path.join(home, '.claude', 'commands', 'cm');
      const agentsDir = path.join(home, '.claude', 'agents');
      const staleCommand = path.join(commandsDir, 'stale.txt');
      const staleAgent = path.join(agentsDir, 'cm-stale.md');
      await fs.ensureDir(commandsDir);
      await fs.ensureDir(agentsDir);
      await fs.writeFile(staleCommand, 'old');
      await fs.writeFile(staleAgent, 'legacy');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

      await installClaude();

      expect(await fs.pathExists(staleCommand)).toBe(false);
      expect(await fs.pathExists(staleAgent)).toBe(false);

      const summaryOutput = consoleSpy.mock.calls.flat().join('\n');
      expect(summaryOutput).toContain('Notification hooks (updated');

      consoleSpy.mockRestore();
    });
  });

  test('skips hook installation entirely when platform lacks support', async () => {
    vi.spyOn(platformModule, 'getPlatformInfo').mockReturnValue({
      platform: 'Windows',
      supportsNotifications: false,
      requirements: 'Not supported',
      notificationMethod: null,
    });

    await withTempHome(async home => {
      await installClaude();
      const settingsPath = path.join(home, '.claude', 'settings.json');
      expect(await fs.pathExists(settingsPath)).toBe(false);
    });
  });

  test('skips hook installation when user declines prompt', async () => {
    vi.spyOn(platformModule, 'getPlatformInfo').mockReturnValue({
      platform: 'macOS',
      supportsNotifications: true,
      requirements: 'terminal-notifier',
      notificationMethod: 'terminal-notifier',
    });
    vi.spyOn(promptModule, 'confirmHooksInstallation').mockResolvedValue(false);

    await withTempHome(async home => {
      await installClaude();
      const settingsPath = path.join(home, '.claude', 'settings.json');
      expect(await fs.pathExists(settingsPath)).toBe(false);
    });
  });

  test('installs hooks even when terminal-notifier is unavailable', async () => {
    vi.spyOn(platformModule, 'getPlatformInfo').mockReturnValue({
      platform: 'macOS',
      supportsNotifications: true,
      requirements: 'terminal-notifier',
      notificationMethod: 'terminal-notifier',
    });
    vi.spyOn(platformModule, 'isMacOS').mockReturnValue(true);
    vi.spyOn(platformModule, 'checkTerminalNotifierAvailable').mockResolvedValue(false);
    vi.spyOn(promptModule, 'confirmHooksInstallation').mockResolvedValue(true);

    await withTempHome(async home => {
      await installClaude();
      const settingsPath = path.join(home, '.claude', 'settings.json');
      const settings = await fs.readJson(settingsPath);
      expect(settingsModule.countContextMonkeyHooks(settings)).toBeGreaterThan(0);
    });
  });

  test('continues installation when hook installation fails', async () => {
    vi.spyOn(platformModule, 'getPlatformInfo').mockReturnValue({
      platform: 'Linux',
      supportsNotifications: true,
      requirements: 'terminal-notifier',
      notificationMethod: null,
    });
    vi.spyOn(platformModule, 'isMacOS').mockReturnValue(false);
    vi.spyOn(promptModule, 'confirmHooksInstallation').mockResolvedValue(true);
    vi.spyOn(settingsModule, 'saveSettings').mockImplementation(() => {
      throw new Error('write failure');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await withTempHome(async home => {
      await installClaude();
      const settingsPath = path.join(home, '.claude', 'settings.json');
      expect(await fs.pathExists(settingsPath)).toBe(false);
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Warning: Could not install hooks: write failure')
    );
  });
});
