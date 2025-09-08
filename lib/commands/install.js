const path = require('path');
const fs = require('fs');
const { getInstallPath, copyFile, copyFileWithValidation, exists } = require('../utils/files');

// Get version from package.json
const packageJson = require('../../package.json');

async function install(options = {}) {
  const { force = false, global = false } = options;
  
  const installPath = getInstallPath(global);
  const installType = global ? 'global' : 'local';
  const displayPath = global ? '~/.claude' : '.claude';

  console.log(`Installing Context Monkey v${packageJson.version} (${installType})...`);
  console.log(`📍 Target: ${displayPath}`);

  // Check for existing installation
  const existingPath = path.join(installPath, 'commands', 'monkey');
  if (exists(existingPath) && !force) {
    console.log(`Context Monkey is already installed in ${displayPath}.`);
    console.log('Use --force to overwrite existing installation.');
    return;
  }

  const templatesDir = path.join(__dirname, '../../templates');

  try {
    // Copy command files
    console.log('🔧 Installing commands...');
    const commandsDir = path.join(templatesDir, 'commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.md'));

    for (const file of commandFiles) {
      await copyFileWithValidation(
        path.join(commandsDir, file),
        path.join(installPath, 'commands', 'monkey', file)
      );
    }

    // Copy agent files
    const agentsDir = path.join(templatesDir, 'agents');
    if (fs.existsSync(agentsDir)) {
      console.log('🤖 Installing subagents with project context...');
      const agentFiles = fs.readdirSync(agentsDir).filter(file => file.endsWith('.md'));
      
      for (const file of agentFiles) {
        await copyFileWithValidation(
          path.join(agentsDir, file),
          path.join(installPath, 'agents', file)
        );
      }
      
      console.log(`  ${displayPath}/agents/              - Subagents (${agentFiles.length} files)`);
    }

    console.log('');
    console.log(`✅ Context Monkey v${packageJson.version} installed successfully!`);
    console.log('');
    console.log('Next steps:');
    console.log('• Run \'/monkey:intro\' in Claude Code to see all available commands and get started');
    console.log('');
    console.log('Files installed:');
    console.log(`  ${displayPath}/commands/monkey/     - Slash commands (${commandFiles.length} files)`);

  } catch (error) {
    console.error('Installation failed:', error.message);
    throw error;
  }
}

module.exports = { install };
