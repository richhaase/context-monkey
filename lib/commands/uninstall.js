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
    
    // Ask about removing CLAUDE.md
    if (exists('CLAUDE.md')) {
      const answer = await askQuestion('Remove CLAUDE.md? This contains your project context. [y/N] ');
      if (answer === 'y' || answer === 'yes') {
        await remove('CLAUDE.md');
        console.log('🗑️  Removed CLAUDE.md');
      } else {
        console.log('📋 Kept CLAUDE.md (contains your project context)');
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