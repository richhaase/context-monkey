const path = require('path');
const { getInstallPath, remove, exists } = require('../utils/files');
const { askQuestion, confirmUninstall } = require('../utils/prompt');

async function uninstall(options = {}) {
  const { local = false, assumeYes = false } = options;
  
  const installPath = getInstallPath(!local);
  const installType = local ? 'local' : 'global';
  const displayPath = local ? '.claude' : '~/.claude';
  
  console.log(`Context Monkey Uninstall`);
  
  // Show summary and ask for confirmation (unless --yes is used)
  if (!assumeYes) {
    const confirmed = await confirmUninstall(installType, displayPath);
    if (!confirmed) {
      console.log('Uninstall cancelled.');
      return;
    }
  }
  
  try {
    // Remove command files
    const commandsPath = path.join(installPath, 'commands', 'cm');
    if (exists(commandsPath)) {
      await remove(commandsPath);
      console.log('🗑️  Removed command files');
    }
    
    // Remove subagent files using pattern-based approach
    const agentsPath = path.join(installPath, 'agents');
    if (exists(agentsPath)) {
      const fs = require('fs');
      let removedCount = 0;
      
      // Remove cm-prefixed agents (new naming convention)
      const cmAgentFiles = fs.readdirSync(agentsPath).filter(file => file.startsWith('cm-') && file.endsWith('.md'));
      for (const agentFile of cmAgentFiles) {
        const agentPath = path.join(agentsPath, agentFile);
        if (exists(agentPath)) {
          await remove(agentPath);
          removedCount++;
        }
      }
      
      // Remove legacy agents (old naming convention) for backward compatibility
      const legacyAgents = ['reviewer.md', 'planner.md', 'repo-explainer.md', 'researcher.md', 'stack-profiler.md', 'security-auditor.md'];
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
    
    // Ask about removing .cm directory (contains project context) - only for local uninstalls
    if (local && exists('.cm')) {
      const answer = await askQuestion('Remove .cm/ directory? This contains your project stack and rules. [y/N] ');
      if (answer === 'y' || answer === 'yes') {
        await remove('.cm');
        console.log('🗑️  Removed .cm/ directory');
      } else {
        console.log('📋 Kept .cm/ directory (contains project context)');
      }
    }
    
    console.log('');
    console.log('✅ Context Monkey uninstalled successfully!');
    console.log('');
    console.log('Thanks for using Context Monkey. You can reinstall anytime with:');
    const installCommand = local ? 'npx context-monkey install --local' : 'npx context-monkey install';
    console.log(installCommand);
    
  } catch (error) {
    console.error('Uninstall failed:', error.message);
    throw error;
  }
}

module.exports = { uninstall };