import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { exists, readFileIfExists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const copilotWriter: Writer = {
  id: "copilot",
  displayName: "GitHub Copilot",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

    for (const entry of entries) {
      switch (entry.category) {
        case "instructions": {
          const path = join(root, ".github", "copilot-instructions.md");
          const existing = await readFileIfExists(path);
          actions.push({
            type: existing !== null ? "update" : "create",
            path,
            content: entry.content,
            entry,
            existing: existing ?? undefined,
          });
          break;
        }
        case "skills":
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason:
              "GitHub Copilot has no skills directory — could be added as path-specific instructions",
          });
          break;
        case "agents":
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: "GitHub Copilot has no agent definition format",
          });
          break;
        case "commands":
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: "GitHub Copilot has no slash command format",
          });
          break;
        default:
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: `Category "${entry.category}" not supported for Copilot sync`,
          });
      }
    }

    return { source: entries[0]?.category as any, target: "copilot", actions };
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
