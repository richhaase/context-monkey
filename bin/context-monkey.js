#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');

// Import command handlers
const { install } = require('../lib/commands/install');
const { upgrade } = require('../lib/commands/upgrade');
const { uninstall } = require('../lib/commands/uninstall');

const packageJson = require('../package.json');

program
  .name('context-monkey')
  .description('Smart context rules and commands for Claude Code')
  .version(packageJson.version);

program
  .command('install')
  .description('Install Context Monkey to current git repository')
  .option('-f, --force', 'Overwrite existing files')
  .option('-g, --global', 'Install to ~/.claude instead of ./.claude')
  .action(async (options) => {
    try {
      await install(options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('upgrade')
  .description('Upgrade Context Monkey to latest version')
  .option('-g, --global', 'Upgrade global installation in ~/.claude')
  .action(async (options) => {
    try {
      await upgrade(options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('uninstall')
  .description('Remove Context Monkey from current repository')
  .option('-g, --global', 'Uninstall from ~/.claude instead of ./.claude')
  .action(async (options) => {
    try {
      await uninstall(options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', function (operands) {
  console.error(`Unknown command: ${operands[0]}`);
  console.log('Available commands:');
  console.log('  install   - Install Context Monkey');
  console.log('  upgrade   - Upgrade to latest version');
  console.log('  uninstall - Remove Context Monkey');
  process.exit(1);
});

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

program.parse();