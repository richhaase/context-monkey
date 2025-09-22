import readline from 'readline';
import { PlatformInfo } from '../types/index.js';

export function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

export async function confirmHooksInstallation(platformInfo: PlatformInfo): Promise<boolean> {
  console.log('');
  console.log('📬 Notification Hooks Setup:');
  console.log(`   Platform: ${platformInfo.platform}`);

  if (platformInfo.supportsNotifications) {
    console.log('   This will add notification hooks to Claude Code settings');
    console.log("   You'll be notified when agents finish or need attention");
    console.log(`   Requires: ${platformInfo.requirements}`);
    console.log('');

    const answer = await askQuestion('Install notification hooks? [Y/n] ');
    return answer === '' || answer === 'y' || answer === 'yes';
  } else {
    console.log(`   Notification hooks are not supported on ${platformInfo.platform}`);
    console.log('   Skipping hooks installation');
    return false;
  }
}

export async function confirmHooksRemoval(hookCount: number): Promise<boolean> {
  console.log('');
  console.log('🗑️  Remove Notification Hooks:');
  console.log(`   Found ${hookCount} Context Monkey notification hooks`);
  console.log('   This will remove only Context Monkey hooks, preserving your other hooks');
  console.log('');

  const answer = await askQuestion('Remove Context Monkey notification hooks? [y/N] ');
  return answer === 'y' || answer === 'yes';
}
