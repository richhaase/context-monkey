const readline = require('readline');

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function confirmInstallation(installType, displayPath, commandCount, agentCount, isUpgrade = false) {
  console.log('');
  if (isUpgrade) {
    console.log('📋 Upgrade Summary:');
    console.log(`   Installation type: ${installType}`);
    console.log(`   Target directory: ${displayPath}`);
    console.log(`   Commands to update: ${commandCount} slash commands`);
    console.log(`   Agents to update: ${agentCount} specialized subagents`);
    console.log('   This will replace existing Context Monkey files');
    console.log('');
    
    const answer = await askQuestion('Proceed with upgrade? [Y/n] ');
    return answer === '' || answer === 'y' || answer === 'yes';
  } else {
    console.log('📋 Installation Summary:');
    console.log(`   Installation type: ${installType}`);
    console.log(`   Target directory: ${displayPath}`);
    console.log(`   Commands to install: ${commandCount} slash commands`);
    console.log(`   Agents to install: ${agentCount} specialized subagents`);
    console.log('');
    
    const answer = await askQuestion('Proceed with installation? [Y/n] ');
    return answer === '' || answer === 'y' || answer === 'yes';
  }
}

async function confirmUpgrade(installType, displayPath, commandCount, agentCount) {
  console.log('');
  console.log('📋 Upgrade Summary:');
  console.log(`   Installation type: ${installType}`);
  console.log(`   Target directory: ${displayPath}`);
  console.log(`   Commands to update: ${commandCount} slash commands`);
  console.log(`   Agents to update: ${agentCount} specialized subagents`);
  console.log('');
  
  const answer = await askQuestion('Proceed with upgrade? [Y/n] ');
  return answer === '' || answer === 'y' || answer === 'yes';
}

async function confirmUninstall(installType, displayPath) {
  console.log('');
  console.log('⚠️  Uninstall Summary:');
  console.log(`   Installation type: ${installType}`);
  console.log(`   Target directory: ${displayPath}`);
  console.log('   This will remove all Context Monkey commands and agents');
  console.log('');
  
  const answer = await askQuestion('Proceed with uninstall? [y/N] ');
  return answer === 'y' || answer === 'yes';
}

async function confirmHooksInstallation(platformInfo) {
  console.log('');
  console.log('📬 Notification Hooks Setup:');
  console.log(`   Platform: ${platformInfo.platform}`);
  
  if (platformInfo.supportsNotifications) {
    console.log('   This will add notification hooks to Claude Code settings');
    console.log('   You\'ll be notified when agents finish or need attention');
    console.log(`   Requires: ${platformInfo.requirements}`);
    console.log('');
    
    const answer = await askQuestion('Install notification hooks? [Y/n] ');
    return answer === '' || answer === 'y' || answer === 'yes';
  } else {
    console.log(`   Notification hooks are not supported on ${platformInfo.platform}`);
    console.log('   Skipping hooks installation');
    return false;
  }
}

async function confirmHooksRemoval(hookCount) {
  console.log('');
  console.log('🗑️  Remove Notification Hooks:');
  console.log(`   Found ${hookCount} Context Monkey notification hooks`);
  console.log('   This will remove only Context Monkey hooks, preserving your other hooks');
  console.log('');
  
  const answer = await askQuestion('Remove Context Monkey notification hooks? [y/N] ');
  return answer === 'y' || answer === 'yes';
}

module.exports = {
  askQuestion,
  confirmInstallation,
  confirmUpgrade,
  confirmUninstall,
  confirmHooksInstallation,
  confirmHooksRemoval
};