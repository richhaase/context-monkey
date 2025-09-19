import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import type { UninstallOptions } from '../../types/index.js';

const COMMAND_NAMESPACE = 'context-monkey';

export async function uninstallGemini(options: UninstallOptions = {}): Promise<void> {
  const baseDir = resolveGeminiBaseDir(Boolean(options.local));
  const commandsDir = path.join(baseDir, 'commands', COMMAND_NAMESPACE);
  const extensionDir = path.join(baseDir, 'extensions', COMMAND_NAMESPACE);

  console.log(
    `Removing Context Monkey resources from Gemini CLI (${options.local ? 'workspace' : 'user'} scope)...`
  );

  if (await fs.pathExists(commandsDir)) {
    await fs.remove(commandsDir);
    console.log('🗑️  Removed Gemini custom commands');
  }

  if (await fs.pathExists(extensionDir)) {
    await fs.remove(extensionDir);
    console.log('🗑️  Removed Gemini extension metadata');
  }

  // Clean up empty parent directories if necessary
  await cleanupIfEmpty(path.join(baseDir, 'commands'));
  await cleanupIfEmpty(path.join(baseDir, 'extensions'));

  console.log('✅ Gemini CLI resources removed');
}

function resolveGeminiBaseDir(isLocal: boolean): string {
  if (isLocal) {
    return path.join(process.cwd(), '.gemini');
  }
  return path.join(os.homedir(), '.gemini');
}

async function cleanupIfEmpty(dir: string): Promise<void> {
  if (!(await fs.pathExists(dir))) {
    return;
  }
  const entries = await fs.readdir(dir);
  if (entries.length === 0) {
    await fs.remove(dir);
  }
}
