const path = require('path');
const fs = require('fs');
const { copyFile, exists } = require('../utils/files');

async function install(options = {}) {
  const { force = false } = options;

  console.log('Installing Context Monkey...');

  // Check for existing installation
  if (exists('.claude/commands/monkey') && !force) {
    console.log('Context Monkey is already installed.');
    console.log('Use --force to overwrite existing installation.');
    return;
  }

  const templatesDir = path.join(__dirname, '../../templates');

  try {
    // Copy main context file
    console.log('📋 Installing main context file...');
    await copyFile(
      path.join(templatesDir, 'context.md'),
      'CLAUDE.md'
    );

    // Copy command files
    console.log('🔧 Installing commands...');
    const commandsDir = path.join(templatesDir, 'commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.md'));

    for (const file of commandFiles) {
      await copyFile(
        path.join(commandsDir, file),
        `.claude/commands/monkey/${file}`
      );
    }

    console.log('');
    console.log('✅ Context Monkey installed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run \'/stack-scan\' in Claude Code to detect your tech stack');
    console.log('2. Use \'/add-rule\' to create project-specific development rules');
    console.log('3. Use \'/plan-change\' for deep planning of complex changes');
    console.log('');
    console.log('Files installed:');
    console.log('  CLAUDE.md                    - Main context file');
    console.log(`  .claude/commands/monkey/     - Slash commands (${commandFiles.length} files)`);

  } catch (error) {
    console.error('Installation failed:', error.message);
    throw error;
  }
}

module.exports = { install };
