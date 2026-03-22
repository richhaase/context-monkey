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

const CODEX_DIR = join(homedir(), ".codex");

export const codexScanner: Scanner = {
  id: "codex",
  displayName: "Codex",

  async detect(): Promise<boolean> {
    return exists(CODEX_DIR);
  },

  async scan(): Promise<HarnessContext> {
    const entries: ContextEntry[] = [];

    // Instructions: ~/.codex/AGENTS.md
    const agentsMd = await readFileIfExists(join(CODEX_DIR, "AGENTS.md"));
    if (agentsMd !== null) {
      entries.push({
        category: "instructions",
        name: "AGENTS.md",
        canonical: { type: "instruction", body: agentsMd } satisfies CanonicalInstruction,
        sourcePath: join(CODEX_DIR, "AGENTS.md"),
        scope: "global",
        raw: agentsMd,
      });
    }

    // Settings: ~/.codex/config.toml
    const configPath = join(CODEX_DIR, "config.toml");
    const configContent = await readFileIfExists(configPath);
    if (configContent !== null) {
      for (const { key, displayName } of CODEX_SETTINGS) {
        const value = extractTomlValue(configContent, key);
        if (value !== null) {
          entries.push({
            category: "settings",
            name: `config.toml:${key}`,
            canonical: { type: "setting", key, displayName, value } satisfies CanonicalSetting,
            sourcePath: configPath,
            scope: "global",
            raw: configContent,
          });
        }
      }
    }

    // Agents: ~/.codex/agents/*.toml
    const agentsDir = join(CODEX_DIR, "agents");
    const agentFiles = await globFiles(agentsDir, ".toml");
    for (const file of agentFiles) {
      const filePath = join(agentsDir, file);
      const content = await readFileIfExists(filePath);
      if (content === null) continue;
      const name = file.replace(/\.toml$/, "");

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
        scope: "global",
        raw: content,
      });
    }

    // Memory: ~/.codex/MEMORY.md
    const memoryPath = join(CODEX_DIR, "MEMORY.md");
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
        scope: "global",
        raw: memoryContent,
      });
    }

    return { harness: "codex", entries };
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
  const str = extractTomlString(content, key);
  if (str !== null) return str;
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
