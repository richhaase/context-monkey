import { describe, expect, test, afterEach, vi } from 'bun:test';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';

import { installCodex } from '../../src/commands/installers/codex';
import { CODEX_AGENTS_BEGIN_MARKER, CODEX_AGENTS_END_MARKER } from '../../src/utils/codex';

const realHomedir = os.homedir;

async function withTempHome(run: (home: string) => Promise<void>): Promise<void> {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-codex-cleanup-'));
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

describe('Codex installer cleanup', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('removes legacy prompts and replaces Context Monkey block', async () => {
    await withTempHome(async home => {
      const promptsDir = path.join(home, '.codex', 'prompts');
      const legacyDir = path.join(promptsDir, 'context-monkey');
      await fs.ensureDir(legacyDir);
      await fs.writeFile(path.join(legacyDir, 'legacy.md'), '# legacy');
      await fs.writeFile(path.join(promptsDir, 'context-monkey-legacy.md'), 'old');
      await fs.writeFile(path.join(promptsDir, 'cm-old.md'), 'old');
      await fs.writeFile(path.join(promptsDir, 'custom.md'), 'keep');

      const agentsFile = path.join(home, '.codex', 'AGENTS.md');
      const existing = [
        '# Overview',
        '',
        CODEX_AGENTS_BEGIN_MARKER,
        'Old Context Monkey section',
        CODEX_AGENTS_END_MARKER,
        '',
        '# Footer',
      ].join('\n');
      await fs.outputFile(agentsFile, existing);

      await installCodex();

      expect(await fs.pathExists(legacyDir)).toBe(false);
      expect(await fs.pathExists(path.join(promptsDir, 'context-monkey-legacy.md'))).toBe(false);
      expect(await fs.pathExists(path.join(promptsDir, 'cm-old.md'))).toBe(false);
      expect(await fs.readFile(path.join(promptsDir, 'custom.md'), 'utf8')).toBe('keep');

      const updatedAgents = await fs.readFile(agentsFile, 'utf8');
      expect(updatedAgents).toContain('Installed prompts: 10');
      expect(updatedAgents).not.toContain('Old Context Monkey section');
      expect(updatedAgents.startsWith('# Overview')).toBe(true);
      expect(updatedAgents).toContain('# Footer');
      expect(updatedAgents).toContain('Context Monkey prompts are available as slash commands');
    });
  });
});
