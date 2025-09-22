import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import { CODEX_LEGACY_PROMPT_PREFIXES, stripCodexAgentsBlock } from '../../utils/codex.js';

export async function uninstallCodex(): Promise<void> {
  const homeDir = os.homedir();
  const codexDir = path.join(homeDir, '.codex');
  const promptsDir = path.join(codexDir, 'prompts');
  const agentsFile = path.join(codexDir, 'AGENTS.md');

  console.log('Removing Context Monkey resources from Codex CLI...');

  if (await fs.pathExists(promptsDir)) {
    let removedCount = 0;
    const entries = await fs.readdir(promptsDir);
    await Promise.all(
      entries.map(async name => {
        const fullPath = path.join(promptsDir, name);
        try {
          if (
            CODEX_LEGACY_PROMPT_PREFIXES.some(prefix => name.startsWith(prefix)) &&
            name.toLowerCase().endsWith('.md')
          ) {
            await fs.remove(fullPath);
            removedCount++;
          } else if (name === 'context-monkey' && (await fs.stat(fullPath)).isDirectory()) {
            await fs.remove(fullPath);
            removedCount++;
          }
        } catch {
          // ignore cleanup errors
        }
      })
    );
    if (removedCount > 0) {
      console.log(`🗑️  Removed ${removedCount} Codex prompt artifacts`);
    }
  }

  if (await fs.pathExists(agentsFile)) {
    const existing = await fs.readFile(agentsFile, 'utf8');
    const cleaned = stripCodexAgentsBlock(existing);
    if (cleaned.trim().length === 0) {
      await fs.remove(agentsFile);
      console.log('🗑️  Removed AGENTS.md (no remaining content)');
    } else {
      await fs.writeFile(agentsFile, cleaned.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', 'utf8');
      console.log('🧹 Updated AGENTS.md and removed Context Monkey guidance');
    }
  }

  console.log('✅ Codex CLI resources removed');
}
