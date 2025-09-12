import fs from 'fs-extra';
import path from 'path';
import os from 'os';

/**
 * Get installation path based on global flag
 * @param isGlobal - Whether to use global installation path
 * @returns Installation path
 */
export function getInstallPath(isGlobal = false): string {
  if (!isGlobal) {
    return '.claude'; // Local installation
  }

  // Global installation to user's home directory
  const homeDir = os.homedir();
  return path.join(homeDir, '.claude');
}

/**
 * Copy file and ensure directory exists
 * @param src - Source path
 * @param dest - Destination path
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}

/**
 * Check if file exists
 * @param filePath - Path to check
 * @returns true if file exists
 */
export function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Remove file or directory
 * @param filePath - Path to remove
 */
export async function remove(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

/**
 * Validate that a file path is within allowed directory
 * @param filePath - Path to validate
 * @param allowedDirectory - Base directory that path must be within
 * @returns True if path is safe
 */
export function validatePath(filePath: string, allowedDirectory: string): boolean {
  const resolved = path.resolve(filePath);
  const allowed = path.resolve(allowedDirectory);
  return resolved.startsWith(allowed);
}

/**
 * Copy file with validation and ensure directory exists
 * @param src - Source path
 * @param dest - Destination path
 */
export async function copyFileWithValidation(src: string, dest: string): Promise<void> {
  // Validate source path is within project template directory
  const resourcesDir = path.join(import.meta.dirname, '../../resources');
  if (!validatePath(src, resourcesDir)) {
    throw new Error(`Invalid source path: ${src} is outside allowed resources directory`);
  }

  // Validate destination path is within allowed directories
  const cwd = process.cwd();
  const homeClaudeDir = path.join(os.homedir(), '.claude');
  const isValidDest = validatePath(dest, cwd) || validatePath(dest, homeClaudeDir);
  if (!isValidDest) {
    throw new Error(`Invalid destination path: ${dest} is outside allowed directories`);
  }

  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}
