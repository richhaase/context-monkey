const path = require('path');
const fs = require('fs');
const { getInstallPath, copyFile, copyFileWithValidation, exists, remove } = require('../utils/files');
const { confirmInstallation } = require('../utils/prompt');

// Get version from package.json
const packageJson = require('../../package.json');

async function install(options = {}) {
  const { local = false, _skipExistingCheck = false, assumeYes = false } = options;
  
  const installPath = getInstallPath(!local);
  const installType = local ? 'local' : 'global';
  const displayPath = local ? '.claude' : '~/.claude';

  // Check for existing installation
  const existingPath = path.join(installPath, 'commands', 'cm');
  const isUpgrade = exists(existingPath);
  
  console.log(`Context Monkey v${packageJson.version} ${isUpgrade ? 'Upgrade' : 'Installation'}`);
  
  // If this is called internally (like from upgrade command), skip this check
  if (_skipExistingCheck) {
    // This is an internal call, proceed without additional checks
  }

  const resourcesDir = path.join(__dirname, '../../resources');
  
  // Count files to be installed
  const commandsDir = path.join(resourcesDir, 'commands');
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.md'));
  
  const agentsDir = path.join(resourcesDir, 'agents');
  const agentFiles = fs.existsSync(agentsDir) ? fs.readdirSync(agentsDir).filter(file => file.endsWith('.md')) : [];
  
  // Show summary and ask for confirmation (unless this is called internally or --yes is used)
  if (!_skipExistingCheck && !assumeYes) {
    const confirmed = await confirmInstallation(installType, displayPath, commandFiles.length, agentFiles.length, isUpgrade);
    if (!confirmed) {
      console.log(`${isUpgrade ? 'Upgrade' : 'Installation'} cancelled.`);
      return;
    }
  }

  try {
    // If this is an upgrade, clean up existing files first
    if (isUpgrade) {
      console.log('🗑️  Removing existing Context Monkey files...');
      
      // Remove all commands (safe - our subdirectory)
      const commandsPath = path.join(installPath, 'commands', 'cm');
      if (exists(commandsPath)) {
        await remove(commandsPath);
        console.log('   Removed /commands/cm/');
      }
      
      // Remove all cm-prefixed agents (safe - our prefix)
      const agentsPath = path.join(installPath, 'agents');
      if (exists(agentsPath)) {
        const existingAgentFiles = fs.readdirSync(agentsPath).filter(file => file.startsWith('cm-') && file.endsWith('.md'));
        
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

    // Copy command files
    console.log(`🔧 ${isUpgrade ? 'Updating' : 'Installing'} commands...`);
    for (const file of commandFiles) {
      await copyFileWithValidation(
        path.join(commandsDir, file),
        path.join(installPath, 'commands', 'cm', file)
      );
    }

    // Copy agent files
    if (agentFiles.length > 0) {
      console.log(`🤖 ${isUpgrade ? 'Updating' : 'Installing'} subagents with project context...`);
      for (const file of agentFiles) {
        await copyFileWithValidation(
          path.join(agentsDir, file),
          path.join(installPath, 'agents', file)
        );
      }
      
      console.log(`  ${displayPath}/agents/              - Subagents (${agentFiles.length} files)`);
    }

    console.log('');
    console.log(`✅ Context Monkey v${packageJson.version} ${isUpgrade ? 'upgraded' : 'installed'} successfully!`);
    console.log('');
    console.log('Next steps:');
    console.log('• Run \'/cm:intro\' in Claude Code to see all available commands and get started');
    console.log('');
    console.log('Files installed:');
    console.log(`  ${displayPath}/commands/cm/     - Slash commands (${commandFiles.length} files)`);

  } catch (error) {
    console.error(`${isUpgrade ? 'Upgrade' : 'Installation'} failed:`, error.message);
    throw error;
  }
}

module.exports = { install };
