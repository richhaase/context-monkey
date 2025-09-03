const { install } = require('./install');

async function upgrade() {
  console.log('Upgrading Context Monkey to latest version...');
  
  // Upgrade is just a forced install
  await install({ force: true });
  
  console.log('✅ Context Monkey upgraded successfully!');
}

module.exports = { upgrade };