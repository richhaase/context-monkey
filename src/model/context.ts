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

export interface ContextEntry {
  category: ContextCategory;
  name: string;
  content: string;
  sourcePath: string;
  scope: "global" | "workspace" | "subdirectory";
  metadata?: Record<string, unknown>;
}

export interface HarnessContext {
  harness: HarnessId;
  root: string;
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
