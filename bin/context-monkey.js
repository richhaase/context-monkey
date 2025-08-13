#!/usr/bin/env node

const { version, description } = require('../package.json');
const path = require('path');

function showHelp() {
  console.log(`
${description}

Usage:
  npx context-monkey <command> [options]

Commands:
  install [options]    Install Context Monkey commands and workflows
  status              Show installation status  
  help                Show this help message
  version             Show version number

Options:
  --help, -h          Show help for a command
  --version, -v       Show version number
  --debug             Enable debug output

Examples:
  npx context-monkey install
  npx context-monkey status
  npx context-monkey --version

For more information, visit: https://github.com/context-monkey/context-monkey
`);
}

function showVersion() {
  console.log(`context-monkey v${version}`);
}

function main() {
  const args = process.argv.slice(2);
  
  // Handle no arguments
  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];
  
  // Handle global flags first
  if (command === '--version' || command === '-v') {
    showVersion();
    return;
  }
  
  if (command === '--help' || command === '-h' || command === 'help') {
    showHelp();
    return;
  }

  // Future command routing will go here
  switch (command) {
    case 'install':
      console.log('Install command not yet implemented');
      console.log('This will be implemented in Phase 3');
      break;
    case 'status':
      console.log('Status command not yet implemented');
      console.log('This will be implemented in Phase 3');
      break;
    default:
      console.error(`Error: Unknown command '${command}'`);
      console.error('');
      console.error('Use "npx context-monkey help" to see available commands');
      process.exit(1);
  }
}

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { showHelp, showVersion, main };