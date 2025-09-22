import { describe, expect, test, vi } from 'bun:test';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';

import { installCodex } from '../../src/commands/installers/codex';
import { installGemini } from '../../src/commands/installers/gemini';
import { installClaude } from '../../src/commands/installers/claude';
import * as promptModule from '../../src/utils/prompt';
import * as platformModule from '../../src/utils/platform';

const realHomedir = os.homedir;

async function withTempHome(run: (home: string) => Promise<void>): Promise<void> {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-install-test-'));
  // @ts-expect-error allow reassignment in tests
  os.homedir = () => tempHome;
  try {
    await run(tempHome);
  } finally {
    // @ts-expect-error restore original homedir
    os.homedir = realHomedir;
    await fs.remove(tempHome);
  }
}

describe('agent installers', () => {
  test('Claude installer writes commands and agents', async () => {
    const confirmSpy = vi.spyOn(promptModule, 'confirmHooksInstallation').mockResolvedValue(false);
    const notifierSpy = vi
      .spyOn(platformModule, 'checkTerminalNotifierAvailable')
      .mockResolvedValue(true);

    await withTempHome(async home => {
      await installClaude();

      const commandsDir = path.join(home, '.claude', 'commands', 'cm');
      const commandFiles = await fs.readdir(commandsDir);
      expect(commandFiles.length).toBeGreaterThan(0);

      const agentsDir = path.join(home, '.claude', 'agents');
      const agentFiles = await fs.readdir(agentsDir);
      expect(agentFiles.filter(file => file.startsWith('cm-')).length).toBeGreaterThan(0);
    });

    confirmSpy.mockRestore();
    notifierSpy.mockRestore();
  });

  test('Codex installer writes prompts and guidance', async () => {
    await withTempHome(async home => {
      await installCodex();
      const promptsDir = path.join(home, '.codex', 'prompts');
      const files = await fs.readdir(promptsDir);
      expect(files.length).toBeGreaterThan(0);

      const agentsFile = await fs.readFile(path.join(home, '.codex', 'AGENTS.md'), 'utf8');
      expect(agentsFile).toContain('CONTEXT_MONKEY:BEGIN');
      expect(agentsFile).toContain('Installed prompts:');
    });
  });

  test('Gemini installer writes commands and extension metadata', async () => {
    await withTempHome(async home => {
      await installGemini();
      const commandsDir = path.join(home, '.gemini', 'commands', 'cm');
      const commandFiles = await fs.readdir(commandsDir);
      expect(commandFiles.length).toBeGreaterThan(0);

      const extensionDir = path.join(home, '.gemini', 'extensions', 'cm');
      const files = await fs.readdir(extensionDir);
      expect(files).toContain('gemini-extension.json');
      expect(files).toContain('GEMINI.md');

      const info = await fs.readFile(path.join(extensionDir, 'gemini-extension.json'), 'utf8');
      expect(info).toContain('contextFileName');
    });
  });
});
