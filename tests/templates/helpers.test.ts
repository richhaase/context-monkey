import { describe, expect, test } from 'bun:test';

import { createCodexPromptSlug, escapeTomlMultiline } from '../../src/templates/index';

describe('template helper functions', () => {
  test('createCodexPromptSlug normalizes complex paths', () => {
    expect(createCodexPromptSlug('folder/example-command.md')).toBe('cm-folder-example-command');
    expect(createCodexPromptSlug('Example Command.md')).toBe('cm-example-command');
    expect(createCodexPromptSlug('@@special!!command.md')).toBe('cm-special-command');
  });

  test('escapeTomlMultiline escapes triple quotes and backslashes', () => {
    const input = 'Line with """ triple quotes and path C:\\temp\\file';
    const escaped = escapeTomlMultiline(input);
    expect(escaped).toBe('Line with \\\\"\\\\"\\\\" triple quotes and path C:\\\\temp\\\\file');
  });
});
