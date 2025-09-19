import { TargetAgent, DEFAULT_TARGET_AGENT, TargetDescriptor } from '../types/index.js';

export const TARGET_DESCRIPTORS: Record<TargetAgent, TargetDescriptor> = {
  [TargetAgent.CLAUDE_CODE]: {
    id: TargetAgent.CLAUDE_CODE,
    label: 'Claude Code',
    supportsLocalInstall: true,
    supportsHooks: true,
  },
  [TargetAgent.CODEX_CLI]: {
    id: TargetAgent.CODEX_CLI,
    label: 'Codex CLI',
    supportsLocalInstall: false,
    supportsHooks: false,
  },
  [TargetAgent.GEMINI_CLI]: {
    id: TargetAgent.GEMINI_CLI,
    label: 'Gemini CLI',
    supportsLocalInstall: true,
    supportsHooks: false,
  },
};

export function parseTargetAgent(value: string): TargetAgent {
  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case 'claude':
    case 'claude-code':
    case 'claude_code':
      return TargetAgent.CLAUDE_CODE;
    case 'codex':
    case 'codex-cli':
    case 'codex_cli':
      return TargetAgent.CODEX_CLI;
    case 'gemini':
    case 'gemini-cli':
    case 'gemini_cli':
      return TargetAgent.GEMINI_CLI;
    default:
      throw new Error(`Unknown target agent: ${value}`);
  }
}

export function resolveTargets(
  requestedTargets: TargetAgent[] | undefined,
  includeAllTargets: boolean
): TargetAgent[] {
  if (includeAllTargets) {
    return Object.values(TargetAgent);
  }

  if (!requestedTargets || requestedTargets.length === 0) {
    return [DEFAULT_TARGET_AGENT];
  }

  // Deduplicate while preserving order
  const seen = new Set<TargetAgent>();
  const resolved: TargetAgent[] = [];
  requestedTargets.forEach(target => {
    if (!seen.has(target)) {
      seen.add(target);
      resolved.push(target);
    }
  });
  return resolved;
}

export function getTargetLabel(target: TargetAgent): string {
  return TARGET_DESCRIPTORS[target]?.label ?? target;
}
