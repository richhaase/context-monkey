import path from 'path';
import fs from 'fs';
import { getInstallPath, remove, exists } from '../../utils/files.js';
import { askQuestion, confirmUninstall, confirmHooksRemoval } from '../../utils/prompt.js';
import {
  loadSettings,
  removeContextMonkeyHooks,
  saveSettings,
  countContextMonkeyHooks,
} from '../../utils/settings.js';
import type { UninstallOptions } from '../../types/index.js';

export async function uninstallClaude(options: UninstallOptions = {}): Promise<void> {
  const { local = false, assumeYes = false } = options;

  const installPath = getInstallPath(!local);
  const installType = local ? 'local' : 'global';
  const displayPath = local ? '.claude' : '~/.claude';

  console.log(`Context Monkey Claude uninstall`);

  if (!assumeYes) {
    const confirmed = await confirmUninstall(installType, displayPath);
    if (!confirmed) {
      console.log('Uninstall cancelled.');
      return;
    }
  }

  try {
    const commandsPath = path.join(installPath, 'commands', 'cm');
    if (exists(commandsPath)) {
      await remove(commandsPath);
      console.log('🗑️  Removed command files');
    }

    const agentsPath = path.join(installPath, 'agents');
    if (exists(agentsPath)) {
      let removedCount = 0;
      const cmAgentFiles = fs
        .readdirSync(agentsPath)
        .filter(file => file.startsWith('cm-') && file.endsWith('.md'));
      for (const agentFile of cmAgentFiles) {
        const agentPath = path.join(agentsPath, agentFile);
        if (exists(agentPath)) {
          await remove(agentPath);
          removedCount++;
        }
      }

      const legacyAgents = [
        'reviewer.md',
        'planner.md',
        'repo-explainer.md',
        'researcher.md',
        'stack-profiler.md',
        'security-auditor.md',
      ];
      for (const agentFile of legacyAgents) {
        const agentPath = path.join(agentsPath, agentFile);
        if (exists(agentPath)) {
          await remove(agentPath);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        console.log(`🗑️  Removed ${removedCount} Context Monkey subagents`);
      }
    }

    await handleHooksRemoval(installPath, displayPath, assumeYes);

    if (local && exists('.cm')) {
      const answer = await askQuestion(
        'Remove .cm/ directory? This contains your project stack and rules. [y/N] '
      );
      if (answer === 'y' || answer === 'yes') {
        await remove('.cm');
        console.log('🗑️  Removed .cm/ directory');
      } else {
        console.log('📋 Kept .cm/ directory (contains project context)');
      }
    }

    console.log('');
    console.log('✅ Context Monkey uninstalled from Claude!');
    console.log('');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Uninstall failed:', errorMessage);
    throw error;
  }
}

async function handleHooksRemoval(
  installPath: string,
  displayPath: string,
  assumeYes: boolean
): Promise<void> {
  try {
    const existingSettings = loadSettings(installPath);
    const hookCount = countContextMonkeyHooks(existingSettings);

    if (hookCount === 0) {
      return;
    }

    if (!assumeYes) {
      const removeHooks = await confirmHooksRemoval(hookCount);
      if (!removeHooks) {
        console.log('   Keeping notification hooks');
        return;
      }
    }

    console.log('🗑️  Removing notification hooks...');
    const cleanedSettings = removeContextMonkeyHooks(existingSettings);
    saveSettings(installPath, cleanedSettings);

    console.log(
      `   Removed ${hookCount} Context Monkey notification hooks from ${displayPath}/settings.json`
    );
    console.log('   Other hooks in your settings have been preserved');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Warning: Could not remove hooks: ${errorMessage}`);
    console.log('   You may need to manually remove them from your Claude Code settings');
  }
}
