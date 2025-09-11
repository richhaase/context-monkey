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

module.exports = {
  askQuestion,
  confirmInstallation,
  confirmUpgrade,
  confirmUninstall
};