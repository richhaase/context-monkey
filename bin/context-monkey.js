#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');

// Import command handlers
const { install } = require('../lib/commands/install');
const { uninstall } = require('../lib/commands/uninstall');

const packageJson = require('../package.json');

program
  .name('context-monkey')
  .description('Smart context rules and commands for Claude Code')
  .version(packageJson.version);

program
  .command('install')
  .description('Install or upgrade Context Monkey (global: ~/.claude/ or local: .claude/)')
  .option('-l, --local', 'Install to ./.claude instead of ~/.claude')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(async (options) => {
    try {
      await install({ local: options.local, assumeYes: options.yes });
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('uninstall')
  .description('Remove Context Monkey (global: ~/.claude/ or local: .claude/)')
  .option('-l, --local', 'Uninstall from ./.claude instead of ~/.claude')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(async (options) => {
    try {
      await uninstall({ local: options.local, assumeYes: options.yes });
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', function (operands) {
  console.error(`Unknown command: ${operands[0]}`);
  console.log('Available commands:');
  console.log('  install   - Install or upgrade Context Monkey');
  console.log('  uninstall - Remove Context Monkey');
  process.exit(1);
});

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

program.parse();