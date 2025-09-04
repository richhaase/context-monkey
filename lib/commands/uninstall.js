const { remove, exists } = require('../utils/files');
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

async function uninstall() {
  console.log('Uninstalling Context Monkey...');
  
  try {
    // Remove command files
    if (exists('.claude/commands/monkey')) {
      await remove('.claude/commands/monkey');
      console.log('🗑️  Removed command files');
    }
    
    // Remove subagent files
    if (exists('.claude/agents')) {
      const agentsToRemove = ['reviewer.md', 'planner.md', 'repo-explainer.md', 'researcher.md', 'stack-profiler.md'];
      let removedCount = 0;
      
      for (const agentFile of agentsToRemove) {
        const agentPath = `.claude/agents/${agentFile}`;
        if (exists(agentPath)) {
          await remove(agentPath);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        console.log(`🗑️  Removed ${removedCount} Context Monkey subagents`);
      }
    }
    
    // Ask about removing .monkey directory (contains project context)
    if (exists('.monkey')) {
      const answer = await askQuestion('Remove .monkey/ directory? This contains your project stack and rules. [y/N] ');
      if (answer === 'y' || answer === 'yes') {
        await remove('.monkey');
        console.log('🗑️  Removed .monkey/ directory');
      } else {
        console.log('📋 Kept .monkey/ directory (contains project context)');
      }
    }
    
    console.log('');
    console.log('✅ Context Monkey uninstalled successfully!');
    console.log('');
    console.log('Thanks for using Context Monkey. You can reinstall anytime with:');
    console.log('npx context-monkey install');
    
  } catch (error) {
    console.error('Uninstall failed:', error.message);
    throw error;
  }
}

module.exports = { uninstall };