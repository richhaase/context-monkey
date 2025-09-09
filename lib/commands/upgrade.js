const { install } = require('./install');
const path = require('path');
const { getInstallPath, remove, exists } = require('../utils/files');

async function upgrade(options = {}) {
  const { global = false } = options;
  const installType = global ? 'global' : 'local';
  
  console.log(`Upgrading Context Monkey to latest version (${installType})...`);
  
  const installPath = getInstallPath(global);
  const displayPath = global ? '~/.claude' : '.claude';
  
  try {
    // Remove existing Context Monkey files using pattern-based approach
    console.log('🗑️  Removing existing Context Monkey files...');
    
    // Remove all commands (safe - our subdirectory)
    const commandsPath = path.join(installPath, 'commands', 'monkey');
    if (exists(commandsPath)) {
      await remove(commandsPath);
      console.log('   Removed /commands/monkey/');
    }
    
    // Remove all cm-prefixed agents (safe - our prefix)
    const agentsPath = path.join(installPath, 'agents');
    if (exists(agentsPath)) {
      const fs = require('fs');
      const agentFiles = fs.readdirSync(agentsPath).filter(file => file.startsWith('cm-') && file.endsWith('.md'));
      
      for (const agentFile of agentFiles) {
        const agentPath = path.join(agentsPath, agentFile);
        if (exists(agentPath)) {
          await remove(agentPath);
        }
      }
      
      if (agentFiles.length > 0) {
        console.log(`   Removed ${agentFiles.length} Context Monkey agents`);
      }
    }
    
    // Install fresh version
    console.log('📦 Installing latest version...');
    await install({ global, _skipExistingCheck: true });
    
    console.log('✅ Context Monkey upgraded successfully!');
    
  } catch (error) {
    console.error('Upgrade failed:', error.message);
    throw error;
  }
}

module.exports = { upgrade };