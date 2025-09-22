import { describe, expect, test } from 'bun:test';
import { detectAgentStatuses, getTargetLabel } from '../../src/utils/targets';
import { TargetAgent } from '../../src/types';

describe('target utilities', () => {
  test('getTargetLabel returns friendly name', () => {
    expect(getTargetLabel(TargetAgent.CLAUDE_CODE)).toBe('Claude Code');
    expect(getTargetLabel(TargetAgent.CODEX_CLI)).toBe('Codex CLI');
    expect(getTargetLabel(TargetAgent.GEMINI_CLI)).toBe('Gemini CLI');
  });

  test('detectAgentStatuses reports all supported agents', () => {
    const statuses = detectAgentStatuses();
    const agents = statuses.map(status => status.agent);
    expect(agents).toContain(TargetAgent.CLAUDE_CODE);
    expect(agents).toContain(TargetAgent.CODEX_CLI);
    expect(agents).toContain(TargetAgent.GEMINI_CLI);
  });
});
