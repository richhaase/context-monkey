import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { getInstallPath, validatePath, exists } from '../../src/utils/files';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('files utilities', () => {
  describe('getInstallPath', () => {
    test('returns .claude for local installation', () => {
      const result = getInstallPath(false);
      expect(result).toBe('.claude');
    });

    test('returns global path for global installation', () => {
      const result = getInstallPath(true);
      const expected = path.join(os.homedir(), '.claude');
      expect(result).toBe(expected);
    });
  });

  describe('validatePath', () => {
    test('returns true when path is within allowed directory', () => {
      const allowedDir = '/tmp/test';
      const filePath = '/tmp/test/subdir/file.txt';
      
      const result = validatePath(filePath, allowedDir);
      expect(result).toBe(true);
    });

    test('returns false when path is outside allowed directory', () => {
      const allowedDir = '/tmp/test';
      const filePath = '/tmp/other/file.txt';
      
      const result = validatePath(filePath, allowedDir);
      expect(result).toBe(false);
    });

    test('handles relative paths correctly', () => {
      const allowedDir = process.cwd();
      const filePath = './test/file.txt';
      
      const result = validatePath(filePath, allowedDir);
      expect(result).toBe(true);
    });

    test('prevents path traversal attacks', () => {
      const allowedDir = '/tmp/test';
      const filePath = '/tmp/test/../../../etc/passwd';
      
      const result = validatePath(filePath, allowedDir);
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    const tempDir = path.join(os.tmpdir(), 'context-monkey-test');
    const testFile = path.join(tempDir, 'test-file.txt');

    beforeEach(async () => {
      await fs.ensureDir(tempDir);
      await fs.writeFile(testFile, 'test content');
    });

    afterEach(async () => {
      await fs.remove(tempDir);
    });

    test('returns true for existing file', () => {
      const result = exists(testFile);
      expect(result).toBe(true);
    });

    test('returns true for existing directory', () => {
      const result = exists(tempDir);
      expect(result).toBe(true);
    });

    test('returns false for non-existing file', () => {
      const nonExistentFile = path.join(tempDir, 'does-not-exist.txt');
      const result = exists(nonExistentFile);
      expect(result).toBe(false);
    });
  });
});