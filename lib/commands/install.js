const path = require('path');
const fs = require('fs');
const { copyFile, copyFileWithTemplate, exists, loadProjectContext } = require('../utils/files');

// Get version from package.json
const packageJson = require('../../package.json');

async function install(options = {}) {
  const { force = false } = options;

  console.log(`Installing Context Monkey v${packageJson.version}...`);

  // Check for existing installation
  if (exists('.claude/commands/monkey') && !force) {
    console.log('Context Monkey is already installed.');
    console.log('Use --force to overwrite existing installation.');
    return;
  }

  const templatesDir = path.join(__dirname, '../../templates');
  
  // Load project context for template injection
  const context = loadProjectContext();

  try {
    // Copy command files with template processing
    console.log('🔧 Installing commands...');
    const commandsDir = path.join(templatesDir, 'commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.md'));

    for (const file of commandFiles) {
      await copyFileWithTemplate(
        path.join(commandsDir, file),
        `.claude/commands/monkey/${file}`,
        context
      );
    }

    // Copy agent files with template processing
    const agentsDir = path.join(templatesDir, 'agents');
    if (fs.existsSync(agentsDir)) {
      console.log('🤖 Installing subagents with project context...');
      const agentFiles = fs.readdirSync(agentsDir).filter(file => file.endsWith('.md'));
      
      for (const file of agentFiles) {
        await copyFileWithTemplate(
          path.join(agentsDir, file),
          `.claude/agents/${file}`,
          context
        );
      }
      
      console.log(`  .claude/agents/              - Subagents (${agentFiles.length} files)`);
    }

    console.log('');
    console.log(`✅ Context Monkey v${packageJson.version} installed successfully!`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Run \'/stack-scan\' in Claude Code to detect your tech stack');
    console.log('2. Use \'/review-code\' to get comprehensive code reviews via subagent');
    console.log('3. Use \'/plan\' for deep planning of complex changes');
    console.log('');
    console.log('Files installed:');
    console.log(`  .claude/commands/monkey/     - Slash commands (${commandFiles.length} files)`);

  } catch (error) {
    console.error('Installation failed:', error.message);
    throw error;
  }
}

module.exports = { install };
