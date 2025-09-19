import { TargetAgent } from '../types/index.js';

export type AgentRenderMode = 'skip' | 'inline';

export interface AgentRenderRule {
  mode: AgentRenderMode;
  headingLevel?: number; // Markdown heading depth (e.g., 2 => ##)
  dropHeadings?: RegExp[];
  replacements?: Array<{ pattern: RegExp; replace: string }>;
}

const replaceProjectDocs = /@\.cm\/[\w\-.]+/g;
const replaceSubagent = /\bsubagent(s)?\b/gi;
const replaceTaskTool = /Task tool/gi;
const replaceUseTask = /Use Task tool/gi;

export const AGENT_RENDER_RULES: Record<TargetAgent, AgentRenderRule> = {
  [TargetAgent.CLAUDE_CODE]: {
    mode: 'skip',
  },
  [TargetAgent.CODEX_CLI]: {
    mode: 'inline',
    headingLevel: 2,
    dropHeadings: [/^Execution/i],
    replacements: [
      { pattern: replaceProjectDocs, replace: 'project documentation' },
      { pattern: replaceSubagent, replace: 'assistant workflow$1' },
      { pattern: replaceUseTask, replace: 'Run workspace tools' },
      { pattern: replaceTaskTool, replace: 'workspace tools' },
    ],
  },
  [TargetAgent.GEMINI_CLI]: {
    mode: 'inline',
    headingLevel: 3,
    dropHeadings: [/^Execution/i],
    replacements: [
      { pattern: replaceProjectDocs, replace: 'project documentation' },
      { pattern: replaceSubagent, replace: 'assistant workflow$1' },
      { pattern: replaceUseTask, replace: 'Run workspace tools' },
      { pattern: replaceTaskTool, replace: 'workspace tools' },
    ],
  },
};
