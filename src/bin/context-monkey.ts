#!/usr/bin/env node

import { program } from 'commander';
import { install } from '../commands/install.js';
import { uninstall } from '../commands/uninstall.js';
import { InstallOptions, UninstallOptions } from '../types/index.js';

import packageJsonData from '../../package.json' with { type: 'json' };
const packageJson = packageJsonData;

program
  .name('context-monkey')
  .description('Smart context rules and commands for Claude Code')
  .version(packageJson.version);

program
  .command('install')
  .description('Install or upgrade Context Monkey (global: ~/.claude/ or local: .claude/)')
  .option('-l, --local', 'Install to ./.claude instead of ~/.claude')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(async options => {
    try {
      const installOptions: InstallOptions = {
        local: options.local,
        assumeYes: options.yes,
      };
      await install(installOptions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error:', errorMessage);
      process.exit(1);
    }
  });

program
  .command('uninstall')
  .description('Remove Context Monkey (global: ~/.claude/ or local: .claude/)')
  .option('-l, --local', 'Uninstall from ./.claude instead of ~/.claude')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(async options => {
    try {
      const uninstallOptions: UninstallOptions = {
        local: options.local,
        assumeYes: options.yes,
      };
      await uninstall(uninstallOptions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error:', errorMessage);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', function (operands: string[]) {
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
