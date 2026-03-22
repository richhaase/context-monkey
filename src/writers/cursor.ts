import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { serializeFrontmatter } from "../utils/frontmatter.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const cursorWriter: Writer = {
  id: "cursor",
  displayName: "Cursor",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];
    const rulesDir = join(root, ".cursor", "rules");

    for (const entry of entries) {
      const c = entry.canonical;

      switch (c.type) {
        case "instruction": {
          const path = join(rulesDir, `${sanitizeName(entry.name)}.mdc`);
          const content = serializeFrontmatter(
            { description: `Ported from ${entry.sourcePath}`, alwaysApply: "true" },
            c.body,
          );
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "skill": {
          const path = join(rulesDir, `${sanitizeName(c.name)}.mdc`);
          const content = serializeFrontmatter(
            { description: c.description || `Skill: ${c.name}`, alwaysApply: "false" },
            c.instructions,
          );
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "agent": {
          const path = join(rulesDir, `agent-${sanitizeName(c.name)}.mdc`);
          const content = serializeFrontmatter(
            { description: c.description || `Agent: ${c.name}`, alwaysApply: "false" },
            c.instructions,
          );
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "command":
          actions.push(skip(entry, "Cursor has no slash command system"));
          break;
        case "setting":
          actions.push(skip(entry, "Settings sync not supported for Cursor"));
          break;
        case "memory":
          actions.push(skip(entry, "Use 'cm memory' for semantic memory translation"));
          break;
        case "mcp":
          actions.push(skip(entry, "MCP server sync not yet supported for Cursor"));
          break;
        case "ignore":
          actions.push(skip(entry, "Cursor has no ignore file format"));
          break;
      }
    }

    return { source: "cursor", target: "cursor", actions };
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

function sanitizeName(name: string): string {
  return name
    .replace(/\.md$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();
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
