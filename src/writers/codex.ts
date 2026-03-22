import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { renderContextSection, renderFullMemoryDoc } from "../memory/render.ts";
import type { CanonicalMemory, ContextEntry } from "../model/context.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

const CODEX_DIR = join(homedir(), ".codex");

export const codexWriter: Writer = {
  id: "codex",
  displayName: "Codex",

  async plan(entries: ContextEntry[]): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

    const memoryEntries: CanonicalMemory[] = [];
    const otherEntries: ContextEntry[] = [];

    for (const entry of entries) {
      if (entry.canonical.type === "memory") {
        memoryEntries.push(entry.canonical);
      } else {
        otherEntries.push(entry);
      }
    }

    for (const entry of otherEntries) {
      const c = entry.canonical;

      switch (c.type) {
        case "instruction": {
          const path = join(CODEX_DIR, "AGENTS.md");
          actions.push(await fileAction(path, c.body, entry));
          break;
        }
        case "agent": {
          const path = join(CODEX_DIR, "agents", `${c.name}.toml`);
          const content = generateCodexAgentToml(c.name, c.description, c.instructions, c.model);
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "skill":
          actions.push(skip(entry, "Codex has no skills directory"));
          break;
        case "command":
          actions.push(skip(entry, "Codex has no slash command files"));
          break;
        case "setting":
          actions.push(skip(entry, "Settings sync requires TOML merge"));
          break;
        case "mcp":
          actions.push(skip(entry, "MCP server sync not yet supported for Codex"));
          break;
        case "ignore":
          actions.push(skip(entry, "Codex has no ignore file format"));
          break;
      }
    }

    // Memory: critical → AGENTS.md section, full → .codex/MEMORY.md
    if (memoryEntries.length > 0) {
      const placeholder: ContextEntry = {
        category: "memory",
        name: "memory (aggregated)",
        canonical: memoryEntries[0]!,
        sourcePath: "",
        scope: "global",
        raw: "",
      };

      const critical = memoryEntries.filter((u) => u.priority === 1);
      if (critical.length > 0) {
        const section = renderContextSection(critical, "Known Context", [
          "This context was ported from another agent environment.",
          "Treat it as established knowledge — the user should not need to re-teach these things.",
        ]);
        // Append to AGENTS.md
        const agentsPath = join(CODEX_DIR, "AGENTS.md");
        const existing = await readExisting(agentsPath);
        const content = existing ? `${existing}\n\n${section}` : section;
        actions.push(await fileAction(agentsPath, content, placeholder));
      }

      // Full memory → .codex/MEMORY.md
      const memoryDoc = renderFullMemoryDoc(memoryEntries);
      actions.push(await fileAction(join(CODEX_DIR, "MEMORY.md"), memoryDoc, placeholder));
    }

    return { source: "codex", target: "codex", actions };
  },

  async execute(plan: SyncPlan): Promise<void> {
    for (const action of plan.actions) {
      if (action.type === "skip" || !action.content) continue;
      const dir = join(action.path, "..");
      if (!(await exists(dir))) {
        await mkdir(dir, { recursive: true });
      }
      await Bun.write(action.path, action.content);
    }
  },
};

function generateCodexAgentToml(
  name: string,
  description: string,
  instructions: string,
  model?: string,
): string {
  const lines: string[] = [];
  lines.push(`name = "${name}"`);
  lines.push(`description = "${description.replace(/"/g, '\\"')}"`);
  lines.push('developer_instructions = """');
  lines.push(instructions);
  lines.push('"""');
  if (model) {
    lines.push(`model = "${model}"`);
  }
  lines.push('sandbox_mode = "workspace-write"');
  return lines.join("\n");
}

async function readExisting(path: string): Promise<string | null> {
  try {
    return await Bun.file(path).text();
  } catch {
    return null;
  }
}

async function fileAction(path: string, content: string, entry: ContextEntry): Promise<SyncAction> {
  const existingFile = Bun.file(path);
  const fileExists = await existingFile.exists();
  return {
    type: fileExists ? "update" : "create",
    path,
    content,
    entry,
    existing: fileExists ? await existingFile.text() : undefined,
  };
}

function skip(entry: ContextEntry, reason: string): SyncAction {
  return { type: "skip", path: "", entry, reason };
}
