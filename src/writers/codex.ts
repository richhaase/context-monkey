import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const codexWriter: Writer = {
  id: "codex",
  displayName: "Codex",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

    for (const entry of entries) {
      const c = entry.canonical;

      switch (c.type) {
        case "instruction": {
          const path = join(root, "AGENTS.md");
          actions.push(await fileAction(path, c.body, entry));
          break;
        }
        case "agent": {
          const path = join(root, ".codex", "agents", `${c.name}.toml`);
          const content = generateCodexAgentToml(c.name, c.description, c.instructions, c.model);
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "skill":
          actions.push(
            skip(
              entry,
              "Codex has no skills directory — skill instructions could be appended to AGENTS.md",
            ),
          );
          break;
        case "command":
          actions.push(
            skip(
              entry,
              "Codex has no slash command files — agent definitions handle similar functionality",
            ),
          );
          break;
        case "setting":
          actions.push(skip(entry, "Settings sync requires TOML merge — use cm settings"));
          break;
        case "memory":
          actions.push(skip(entry, "Use 'cm memory' for semantic memory translation"));
          break;
        case "mcp":
          actions.push(skip(entry, "MCP server sync not yet supported for Codex"));
          break;
        case "ignore":
          actions.push(skip(entry, "Codex has no ignore file format"));
          break;
      }
    }

    return { source: "codex", target: "codex", actions };
  },

  async execute(plan: SyncPlan, _root: string): Promise<void> {
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
