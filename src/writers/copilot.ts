import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const copilotWriter: Writer = {
  id: "copilot",
  displayName: "GitHub Copilot",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

    for (const entry of entries) {
      const c = entry.canonical;

      switch (c.type) {
        case "instruction": {
          const path = join(root, ".github", "copilot-instructions.md");
          actions.push(await fileAction(path, c.body, entry));
          break;
        }
        case "skill":
          actions.push(skip(entry, "GitHub Copilot has no skills directory"));
          break;
        case "agent":
          actions.push(skip(entry, "GitHub Copilot has no agent definition format"));
          break;
        case "command":
          actions.push(skip(entry, "GitHub Copilot has no slash command format"));
          break;
        case "setting":
          actions.push(skip(entry, "Settings sync not supported for Copilot"));
          break;
        case "memory":
          actions.push(skip(entry, "Use 'cm memory' for semantic memory translation"));
          break;
        case "mcp":
          actions.push(skip(entry, "MCP server sync not yet supported for Copilot"));
          break;
        case "ignore":
          actions.push(skip(entry, "Copilot has no ignore file format"));
          break;
      }
    }

    return { source: "copilot", target: "copilot", actions };
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
