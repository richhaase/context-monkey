import { describe, expect, test } from 'bun:test';
import { parseTargetAgent, resolveTargets } from '../../src/utils/targets';
import { TargetAgent } from '../../src/types';

describe('target utilities', () => {
  test('parseTargetAgent recognizes aliases', () => {
    expect(parseTargetAgent('claude')).toBe(TargetAgent.CLAUDE_CODE);
    expect(parseTargetAgent('codex-cli')).toBe(TargetAgent.CODEX_CLI);
    expect(parseTargetAgent('gemini_cli')).toBe(TargetAgent.GEMINI_CLI);
  });

  test('resolveTargets defaults to Claude when no input', () => {
    const targets = resolveTargets(undefined, false);
    expect(targets).toEqual([TargetAgent.CLAUDE_CODE]);
  });

  test('resolveTargets deduplicates inputs', () => {
    const targets = resolveTargets(
      [TargetAgent.CODEX_CLI, TargetAgent.CODEX_CLI, TargetAgent.GEMINI_CLI],
      false
    );
    expect(targets).toEqual([TargetAgent.CODEX_CLI, TargetAgent.GEMINI_CLI]);
  });

  test('resolveTargets returns all when requested', () => {
    const targets = resolveTargets([], true);
    expect(targets).toContain(TargetAgent.CLAUDE_CODE);
    expect(targets).toContain(TargetAgent.CODEX_CLI);
    expect(targets).toContain(TargetAgent.GEMINI_CLI);
  });
});
