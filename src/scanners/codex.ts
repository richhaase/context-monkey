import { homedir } from "node:os";
import { join } from "node:path";
import type { ContextEntry, HarnessContext } from "../model/context.ts";
import { exists, readFileIfExists } from "../utils/fs.ts";
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

    // Settings: config.toml
    const configToml = await readFileIfExists(join(root, ".codex", "config.toml"));
    if (configToml !== null) {
      entries.push({
        category: "settings",
        name: "config.toml",
        content: configToml,
        sourcePath: join(root, ".codex", "config.toml"),
        scope: "workspace",
      });
    }

    return { harness: "codex", root, entries };
  },
};
