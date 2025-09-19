import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import type { UninstallOptions } from '../../types/index.js';

const COMMAND_NAMESPACE = 'cm';
const LEGACY_COMMAND_NAMESPACES = ['context-monkey'];
const EXTENSION_NAME = 'cm';
const LEGACY_EXTENSION_NAMES = ['context-monkey'];

export async function uninstallGemini(options: UninstallOptions = {}): Promise<void> {
  const baseDir = resolveGeminiBaseDir(Boolean(options.local));
  const commandsDir = path.join(baseDir, 'commands', COMMAND_NAMESPACE);
  const extensionDir = path.join(baseDir, 'extensions', EXTENSION_NAME);

  console.log(
    `Removing Context Monkey resources from Gemini CLI (${options.local ? 'workspace' : 'user'} scope)...`
  );

  await removeDirIfExists(commandsDir, '🗑️  Removed Gemini custom commands');
  await removeDirIfExists(extensionDir, '🗑️  Removed Gemini extension metadata');

  for (const legacyNamespace of LEGACY_COMMAND_NAMESPACES) {
    const legacyDir = path.join(baseDir, 'commands', legacyNamespace);
    await removeDirIfExists(legacyDir, `🧹 Removed legacy Gemini commands (${legacyNamespace})`);
  }

  for (const legacyExtension of LEGACY_EXTENSION_NAMES) {
    const legacyExtDir = path.join(baseDir, 'extensions', legacyExtension);
    await removeDirIfExists(
      legacyExtDir,
      `🧹 Removed legacy Gemini extension (${legacyExtension})`
    );
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

async function removeDirIfExists(dir: string, message: string): Promise<void> {
  if (!(await fs.pathExists(dir))) {
    return;
  }
  try {
    await fs.remove(dir);
    console.log(message);
  } catch {
    // ignore cleanup errors
  }
}
