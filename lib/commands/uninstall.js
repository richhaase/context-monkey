const path = require('path');
const { getInstallPath, remove, exists } = require('../utils/files');
const { askQuestion, confirmUninstall, confirmHooksRemoval } = require('../utils/prompt');
const { loadSettings, removeContextMonkeyHooks, saveSettings, countContextMonkeyHooks } = require('../utils/settings');

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
    
    // Handle hooks removal
    await handleHooksRemoval(installPath, displayPath, assumeYes);
    
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

/**
 * Handle hooks removal process
 * @param {string} installPath - Path to Claude Code directory
 * @param {string} displayPath - Display path for user feedback
 * @param {boolean} assumeYes - Skip prompts if true
 */
async function handleHooksRemoval(installPath, displayPath, assumeYes) {
  try {
    // Load existing settings to check for Context Monkey hooks
    const existingSettings = loadSettings(installPath);
    const hookCount = countContextMonkeyHooks(existingSettings);
    
    if (hookCount === 0) {
      return; // No Context Monkey hooks found
    }
    
    // Ask user if they want to remove hooks (unless --yes is used)
    if (!assumeYes) {
      const removeHooks = await confirmHooksRemoval(hookCount);
      if (!removeHooks) {
        console.log('   Keeping notification hooks');
        return;
      }
    }
    
    // Remove Context Monkey hooks
    console.log('🗑️  Removing notification hooks...');
    const cleanedSettings = removeContextMonkeyHooks(existingSettings);
    
    // Save cleaned settings
    saveSettings(installPath, cleanedSettings);
    
    console.log(`   Removed ${hookCount} Context Monkey notification hooks from ${displayPath}/settings.json`);
    console.log('   Other hooks in your settings have been preserved');
    
  } catch (error) {
    console.warn(`Warning: Could not remove hooks: ${error.message}`);
    console.log('   You may need to manually remove them from your Claude Code settings');
  }
}

module.exports = { uninstall };