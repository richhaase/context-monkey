export type HarnessId = "claude-code" | "codex" | "gemini" | "cursor" | "copilot";

export type ContextCategory =
  | "instructions"
  | "skills"
  | "settings"
  | "memory"
  | "mcp"
  | "ignore"
  | "commands"
  | "agents";

// --- Canonical intermediate representations ---
// Scanners normalize source-specific formats into these.
// Writers generate target-specific formats from these.
// No writer should ever parse raw content — that's the scanner's job.

export interface CanonicalInstruction {
  type: "instruction";
  body: string;
}

export interface CanonicalSkill {
  type: "skill";
  name: string;
  description: string;
  instructions: string;
  trigger?: string;
}

export interface CanonicalAgent {
  type: "agent";
  name: string;
  description: string;
  instructions: string;
  model?: string;
}

export interface CanonicalCommand {
  type: "command";
  name: string;
  description: string;
  prompt: string;
}

export interface CanonicalSetting {
  type: "setting";
  key: string;
  displayName: string;
  value: unknown;
}

export interface CanonicalMemory {
  type: "memory";
  kind:
    | "user-profile"
    | "feedback"
    | "preference"
    | "system-info"
    | "project"
    | "reference"
    | "history";
  name: string;
  summary: string;
  content: string;
  priority: 1 | 2 | 3;
}

export interface CanonicalMcp {
  type: "mcp";
  serverName: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface CanonicalIgnore {
  type: "ignore";
  patterns: string[];
}

export type CanonicalItem =
  | CanonicalInstruction
  | CanonicalSkill
  | CanonicalAgent
  | CanonicalCommand
  | CanonicalSetting
  | CanonicalMemory
  | CanonicalMcp
  | CanonicalIgnore;

export interface ContextEntry {
  category: ContextCategory;
  /** Display name for this entry */
  name: string;
  /** Canonical intermediate representation — writers read from this only */
  canonical: CanonicalItem;
  /** Original source file path */
  sourcePath: string;
  /** Scope: global (~/.harness/), workspace (project root), or subdirectory */
  scope: "global" | "workspace" | "subdirectory";
  /** Raw source content for display/debug — writers must NOT use this */
  raw: string;
}

export interface HarnessContext {
  harness: HarnessId;
  entries: ContextEntry[];
}

export const HARNESS_DISPLAY_NAMES: Record<HarnessId, string> = {
  "claude-code": "Claude Code",
  codex: "Codex",
  gemini: "Gemini CLI",
  cursor: "Cursor",
  copilot: "GitHub Copilot",
};

export const CATEGORY_DISPLAY_NAMES: Record<ContextCategory, string> = {
  instructions: "Instructions",
  skills: "Skills",
  settings: "Settings",
  memory: "Memory",
  mcp: "MCP Servers",
  ignore: "Ignore Patterns",
  commands: "Commands",
  agents: "Agent Definitions",
};

export const ALL_HARNESS_IDS: HarnessId[] = ["claude-code", "codex", "gemini", "cursor", "copilot"];
