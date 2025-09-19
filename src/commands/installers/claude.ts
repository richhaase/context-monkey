import path from 'path';
import fs from 'fs';
import { getInstallPath, copyFileWithValidation, exists, remove } from '../../utils/files.js';
import { confirmInstallation, confirmHooksInstallation } from '../../utils/prompt.js';
import { isMacOS, getPlatformInfo, checkTerminalNotifierAvailable } from '../../utils/platform.js';
import { generateHooks } from '../../config/hooks.js';
import {
  loadSettings,
  mergeHooks,
  saveSettings,
  countContextMonkeyHooks,
} from '../../utils/settings.js';
import { loadCommandTemplates } from '../../utils/resources.js';
import { renderCommandForTarget } from '../../templates/index.js';
import type { InstallOptions, PlatformInfo } from '../../types/index.js';
import { TargetAgent } from '../../types/index.js';

import packageJsonData from '../../../package.json' with { type: 'json' };
const packageJson = packageJsonData;

interface ClaudeInstallOptions extends Pick<InstallOptions, 'local' | 'assumeYes'> {
  skipChecks?: boolean;
}

export async function installClaude(options: ClaudeInstallOptions): Promise<void> {
  const { local = false, assumeYes = false, skipChecks = false } = options;

  const installPath = getInstallPath(!local);
  const installType = local ? 'local' : 'global';
  const displayPath = local ? '.claude' : '~/.claude';

  const existingPath = path.join(installPath, 'commands', 'cm');
  const isUpgrade = exists(existingPath);

  console.log(
    `Context Monkey v${packageJson.version} ${isUpgrade ? 'Claude upgrade' : 'Claude installation'}`
  );

  const resourcesDir = path.join(import.meta.dirname, '../../../resources');
  const commandTemplates = loadCommandTemplates(resourcesDir);

  const agentsDir = path.join(resourcesDir, 'agents');
  const agentFiles = fs.existsSync(agentsDir)
    ? fs.readdirSync(agentsDir).filter(file => file.endsWith('.md'))
    : [];

  if (!skipChecks && !assumeYes) {
    const confirmed = await confirmInstallation(
      installType,
      displayPath,
      commandTemplates.length,
      agentFiles.length,
      isUpgrade
    );
    if (!confirmed) {
      console.log(`${isUpgrade ? 'Upgrade' : 'Installation'} cancelled.`);
      return;
    }
  }

  try {
    if (isUpgrade) {
      console.log('🗑️  Removing existing Context Monkey files...');
      const commandsPath = path.join(installPath, 'commands', 'cm');
      if (exists(commandsPath)) {
        await remove(commandsPath);
        console.log('   Removed /commands/cm/');
      }

      const agentsPath = path.join(installPath, 'agents');
      if (exists(agentsPath)) {
        const existingAgentFiles = fs
          .readdirSync(agentsPath)
          .filter(file => file.startsWith('cm-') && file.endsWith('.md'));

        for (const agentFile of existingAgentFiles) {
          const agentPath = path.join(agentsPath, agentFile);
          if (exists(agentPath)) {
            await remove(agentPath);
          }
        }

        if (existingAgentFiles.length > 0) {
          console.log(`   Removed ${existingAgentFiles.length} Context Monkey agents`);
        }
      }
    }

    console.log(`🔧 ${isUpgrade ? 'Updating' : 'Installing'} Claude commands...`);

    for (const template of commandTemplates) {
      const rendered = renderCommandForTarget(template, TargetAgent.CLAUDE_CODE);
      const destination = path.join(installPath, 'commands', 'cm', rendered.targetRelativePath);
      await fs.promises.mkdir(path.dirname(destination), { recursive: true });
      await fs.promises.writeFile(destination, rendered.content, 'utf8');
    }

    if (agentFiles.length > 0) {
      console.log('🤖 Syncing Claude subagents...');
      for (const file of agentFiles) {
        await copyFileWithValidation(
          path.join(agentsDir, file),
          path.join(installPath, 'agents', file)
        );
      }
      console.log(`  ${displayPath}/agents/              - Subagents (${agentFiles.length} files)`);
    }

    if (!skipChecks) {
      await handleHooksInstallation(installPath, displayPath, assumeYes);
    }

    console.log('');
    console.log(
      `✅ Context Monkey v${packageJson.version} ${
        isUpgrade ? 'Claude upgraded' : 'Claude installed'
      } successfully!`
    );
    console.log('');
    console.log('Next steps:');
    console.log("• Run '/cm:intro' in Claude Code to see all available commands and get started");
    console.log('');
    console.log('Files installed:');
    console.log(
      `  ${displayPath}/commands/cm/     - Slash commands (${commandTemplates.length} files)`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${isUpgrade ? 'Upgrade' : 'Installation'} failed:`, errorMessage);
    throw error;
  }
}

async function handleHooksInstallation(
  installPath: string,
  displayPath: string,
  assumeYes: boolean
): Promise<void> {
  const platformInfo: PlatformInfo = getPlatformInfo();

  if (!platformInfo.supportsNotifications) {
    console.log('');
    console.log('📬 Notification hooks are not supported on this platform');
    console.log('   Continuing without hooks installation');
    return;
  }

  if (!assumeYes) {
    const wantsHooks = await confirmHooksInstallation(platformInfo);
    if (!wantsHooks) {
      console.log('   Skipping hooks installation');
      return;
    }
  }

  try {
    if (isMacOS()) {
      const isAvailable = await checkTerminalNotifierAvailable();
      if (!isAvailable) {
        console.log('');
        console.log('⚠️  Warning: terminal-notifier is not installed');
        console.log('   Install it with: brew install terminal-notifier');
        console.log(
          "   Hooks will be installed but won't work until terminal-notifier is available"
        );
      }
    }

    console.log('📬 Installing notification hooks...');
    const existingSettings = loadSettings(installPath);
    const existingHookCount = countContextMonkeyHooks(existingSettings);

    const contextMonkeyHooks = generateHooks();
    const mergedSettings = mergeHooks(existingSettings, contextMonkeyHooks);

    saveSettings(installPath, mergedSettings);

    const action = existingHookCount > 0 ? 'updated' : 'installed';
    console.log(`   ${action} notification hooks in ${displayPath}/settings.json`);
    console.log("   You'll receive notifications when Claude Code agents finish or need attention");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Warning: Could not install hooks: ${errorMessage}`);
    console.log('   Continuing without hooks installation');
  }
}
