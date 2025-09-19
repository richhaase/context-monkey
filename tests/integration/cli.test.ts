import { test, expect, describe } from 'bun:test';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(require('child_process').exec);
const cliPath = path.join(process.cwd(), 'dist/bin/context-monkey.js');

describe('CLI integration', () => {
  test('CLI executable exists and is accessible', async () => {
    const fs = await import('fs');
    expect(fs.existsSync(cliPath)).toBe(true);
  });

  test('shows version correctly', async () => {
    const { stdout } = await execAsync(`node ${cliPath} --version`);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('shows help when requested', async () => {
    const { stdout } = await execAsync(`node ${cliPath} --help`);
    expect(stdout).toContain('Smart context rules and commands for Claude Code');
    expect(stdout).toContain('Commands:');
    expect(stdout).toContain('install');
    expect(stdout).toContain('uninstall');
  });

  test('shows help for install command', async () => {
    const { stdout } = await execAsync(`node ${cliPath} install --help`);
    expect(stdout).toContain('Interactively install or upgrade Context Monkey');
  });

  test('shows help for uninstall command', async () => {
    const { stdout } = await execAsync(`node ${cliPath} uninstall --help`);
    expect(stdout).toContain('Interactively remove Context Monkey');
  });

  test('handles unknown commands gracefully', async () => {
    try {
      await execAsync(`node ${cliPath} unknown-command`);
    } catch (error: unknown) {
      const execError = error as { stderr: string; stdout: string; code: number };
      expect(execError.stderr).toContain('Unknown command');
      expect(execError.stdout).toContain('Available commands');
      expect(execError.code).toBe(1);
    }
  });

  test('CLI structure and commands are properly defined', () => {
    // Test the compiled CLI file structure
    const fs = require('fs');
    const cliContent = fs.readFileSync(cliPath, 'utf8');

    expect(cliContent).toContain('#!/usr/bin/env node');
    expect(cliContent).toContain('commander');
    expect(cliContent).toContain('install');
    expect(cliContent).toContain('uninstall');
  });
});
