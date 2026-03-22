import { homedir } from "node:os";
import { join } from "node:path";
import type {
  CanonicalAgent,
  CanonicalInstruction,
  CanonicalMemory,
  CanonicalSetting,
  ContextEntry,
  HarnessContext,
} from "../model/context.ts";
import { exists, globFiles, readFileIfExists } from "../utils/fs.ts";
import type { Scanner } from "./scanner.ts";

export const codexScanner: Scanner = {
  id: "codex",
  displayName: "Codex",

  async detect(root: string): Promise<boolean> {
    const hasAgentsMd = await exists(join(root, "AGENTS.md"));
    const hasCodexDir = await exists(join(root, ".codex"));
    const hasGlobalAgentsMd = await exists(join(homedir(), ".codex", "AGENTS.md"));
    return hasAgentsMd || hasCodexDir || hasGlobalAgentsMd;
  },

  async scan(root: string): Promise<HarnessContext> {
    const entries: ContextEntry[] = [];

    // Instructions: AGENTS.md (workspace)
    const agentsMd = await readFileIfExists(join(root, "AGENTS.md"));
    if (agentsMd !== null) {
      entries.push({
        category: "instructions",
        name: "AGENTS.md",
        canonical: { type: "instruction", body: agentsMd } satisfies CanonicalInstruction,
        sourcePath: join(root, "AGENTS.md"),
        scope: "workspace",
        raw: agentsMd,
      });
    }

    // Instructions: AGENTS.override.md (workspace)
    const overrideMd = await readFileIfExists(join(root, "AGENTS.override.md"));
    if (overrideMd !== null) {
      entries.push({
        category: "instructions",
        name: "AGENTS.override.md",
        canonical: { type: "instruction", body: overrideMd } satisfies CanonicalInstruction,
        sourcePath: join(root, "AGENTS.override.md"),
        scope: "workspace",
        raw: overrideMd,
      });
    }

    // Instructions: ~/.codex/AGENTS.md (global)
    const globalAgentsMd = await readFileIfExists(join(homedir(), ".codex", "AGENTS.md"));
    if (globalAgentsMd !== null) {
      entries.push({
        category: "instructions",
        name: "AGENTS.md",
        canonical: { type: "instruction", body: globalAgentsMd } satisfies CanonicalInstruction,
        sourcePath: join(homedir(), ".codex", "AGENTS.md"),
        scope: "global",
        raw: globalAgentsMd,
      });
    }

    // Settings: config.toml (project and global)
    for (const configPath of [
      join(root, ".codex", "config.toml"),
      join(homedir(), ".codex", "config.toml"),
    ]) {
      const content = await readFileIfExists(configPath);
      if (content !== null) {
        const isGlobal = configPath.startsWith(homedir());
        // Extract known settings from TOML
        for (const { key, displayName } of CODEX_SETTINGS) {
          const value = extractTomlValue(content, key);
          if (value !== null) {
            entries.push({
              category: "settings",
              name: `config.toml:${key}`,
              canonical: { type: "setting", key, displayName, value } satisfies CanonicalSetting,
              sourcePath: configPath,
              scope: isGlobal ? "global" : "workspace",
              raw: content,
            });
          }
        }
      }
    }

    // Agents: .codex/agents/*.toml (project and global)
    for (const agentsDir of [join(root, ".codex", "agents"), join(homedir(), ".codex", "agents")]) {
      const agentFiles = await globFiles(agentsDir, ".toml");
      for (const file of agentFiles) {
        const filePath = join(agentsDir, file);
        const content = await readFileIfExists(filePath);
        if (content === null) continue;
        const isGlobal = agentsDir.startsWith(homedir());
        const name = file.replace(/\.toml$/, "");

        // Parse TOML fields
        const description = extractTomlString(content, "description") || `Agent: ${name}`;
        const model = extractTomlString(content, "model") || undefined;
        const instructions = extractTomlMultilineString(content, "developer_instructions") || "";

        entries.push({
          category: "agents",
          name,
          canonical: {
            type: "agent",
            name,
            description,
            instructions,
            model,
          } satisfies CanonicalAgent,
          sourcePath: filePath,
          scope: isGlobal ? "global" : "workspace",
          raw: content,
        });
      }
    }

    // Memory: .codex/MEMORY.md
    const memoryPath = join(root, ".codex", "MEMORY.md");
    const memoryContent = await readFileIfExists(memoryPath);
    if (memoryContent !== null) {
      entries.push({
        category: "memory",
        name: "MEMORY.md",
        canonical: {
          type: "memory",
          kind: "reference",
          name: "MEMORY",
          summary: "Codex memory index",
          content: memoryContent,
          priority: 1,
        } satisfies CanonicalMemory,
        sourcePath: memoryPath,
        scope: "workspace",
        raw: memoryContent,
      });
    }

    return { harness: "codex", root, entries };
  },
};

const CODEX_SETTINGS = [
  { key: "model", displayName: "Default Model" },
  { key: "sandbox_mode", displayName: "Sandbox Mode" },
  { key: "approval_mode", displayName: "Approval Mode" },
];

function extractTomlString(content: string, key: string): string | null {
  const regex = new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, "m");
  const match = content.match(regex);
  return match?.[1] ?? null;
}

function extractTomlMultilineString(content: string, key: string): string | null {
  const regex = new RegExp(`^${key}\\s*=\\s*"""([\\s\\S]*?)"""`, "m");
  const match = content.match(regex);
  return match?.[1]?.trim() ?? null;
}

function extractTomlValue(content: string, key: string): unknown {
  // Try string
  const str = extractTomlString(content, key);
  if (str !== null) return str;
  // Try bare value (boolean, number)
  const bareRegex = new RegExp(`^${key}\\s*=\\s*(.+)$`, "m");
  const bareMatch = content.match(bareRegex);
  if (bareMatch) {
    const raw = bareMatch[1]!.trim();
    if (raw === "true") return true;
    if (raw === "false") return false;
    const num = Number(raw);
    if (!Number.isNaN(num)) return num;
    return raw;
  }
  return null;
}
