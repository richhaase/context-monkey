import { describe, expect, test } from 'bun:test';

import { stripCodexAgentsBlock } from '../../src/utils/codex';

describe('codex utilities', () => {
  test('stripCodexAgentsBlock returns empty string for falsy content', () => {
    expect(stripCodexAgentsBlock('')).toBe('');
  });

  test('stripCodexAgentsBlock returns original content when markers are absent', () => {
    const input = '# Agents\nNo Context Monkey block here';
    expect(stripCodexAgentsBlock(input)).toBe(input);
  });

  test('stripCodexAgentsBlock removes Context Monkey block and trims surrounding whitespace', () => {
    const content = `Intro section\n\n<!-- CONTEXT_MONKEY:BEGIN -->\nOld summary\n<!-- CONTEXT_MONKEY:END -->\n\nFooter section`;
    const result = stripCodexAgentsBlock(content);

    expect(result).toBe('Intro section\n\nFooter section');
  });
});
