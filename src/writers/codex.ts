import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { readFileIfExists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const codexWriter: Writer = {
  id: "codex",
  displayName: "Codex",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

    for (const entry of entries) {
      switch (entry.category) {
        case "instructions": {
          const path = join(root, "AGENTS.md");
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
              "Codex has no skills directory — skill instructions could be appended to AGENTS.md",
          });
          break;
        case "ignore":
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: "Codex has no ignore file format",
          });
          break;
        default:
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: `Category "${entry.category}" not yet supported for Codex sync`,
          });
      }
    }

    return { source: entries[0]?.category as any, target: "codex", actions };
  },

  async execute(plan: SyncPlan, _root: string): Promise<void> {
    for (const action of plan.actions) {
      if (action.type === "skip" || !action.content) continue;
      await Bun.write(action.path, action.content);
    }
  },
};
