import { homedir } from "node:os";
import { join } from "node:path";
import type { ContextEntry, HarnessContext } from "../model/context.ts";
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
        content: agentsMd,
        sourcePath: join(root, "AGENTS.md"),
        scope: "workspace",
      });
    }

    // Instructions: AGENTS.override.md (workspace)
    const overrideMd = await readFileIfExists(join(root, "AGENTS.override.md"));
    if (overrideMd !== null) {
      entries.push({
        category: "instructions",
        name: "AGENTS.override.md",
        content: overrideMd,
        sourcePath: join(root, "AGENTS.override.md"),
        scope: "workspace",
      });
    }

    // Instructions: ~/.codex/AGENTS.md (global)
    const globalAgentsMd = await readFileIfExists(join(homedir(), ".codex", "AGENTS.md"));
    if (globalAgentsMd !== null) {
      entries.push({
        category: "instructions",
        name: "AGENTS.md",
        content: globalAgentsMd,
        sourcePath: join(homedir(), ".codex", "AGENTS.md"),
        scope: "global",
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
        entries.push({
          category: "settings",
          name: "config.toml",
          content,
          sourcePath: configPath,
          scope: isGlobal ? "global" : "workspace",
        });
      }
    }

    // Agents: .codex/agents/*.toml (project) and ~/.codex/agents/*.toml (global)
    for (const agentsDir of [join(root, ".codex", "agents"), join(homedir(), ".codex", "agents")]) {
      const agentFiles = await globFiles(agentsDir, ".toml");
      for (const file of agentFiles) {
        const filePath = join(agentsDir, file);
        const content = await readFileIfExists(filePath);
        if (content === null) continue;
        const isGlobal = agentsDir.startsWith(homedir());
        const name = file.replace(/\.toml$/, "");
        // Extract key fields from TOML (simple parsing for name/description)
        const descMatch = content.match(/^description\s*=\s*"([^"]*)"/m);
        const modelMatch = content.match(/^model\s*=\s*"([^"]*)"/m);
        entries.push({
          category: "agents",
          name,
          content,
          sourcePath: filePath,
          scope: isGlobal ? "global" : "workspace",
          metadata: {
            format: "toml",
            description: descMatch?.[1],
            model: modelMatch?.[1],
          },
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
        content: memoryContent,
        sourcePath: memoryPath,
        scope: "workspace",
      });
    }

    return { harness: "codex", root, entries };
  },
};
