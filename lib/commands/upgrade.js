const { install } = require('./install');

async function upgrade(options = {}) {
  const { global = false } = options;
  const installType = global ? 'global' : 'local';
  
  console.log(`Upgrading Context Monkey to latest version (${installType})...`);
  
  // Upgrade is just a forced install with the same global option
  await install({ force: true, global });
  
  console.log('✅ Context Monkey upgraded successfully!');
}

module.exports = { upgrade };