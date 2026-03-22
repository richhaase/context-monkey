import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { exists, readFileIfExists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const claudeCodeWriter: Writer = {
  id: "claude-code",
  displayName: "Claude Code",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

    for (const entry of entries) {
      switch (entry.category) {
        case "instructions": {
          const path = join(root, "CLAUDE.md");
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
            path: join(root, ".claude", "skills", entry.name),
            entry,
            reason: "Skill directory sync requires copying entire directories — not yet supported",
          });
          break;
        case "ignore":
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: "Claude Code has no ignore file format",
          });
          break;
        default:
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: `Category "${entry.category}" not yet supported for Claude Code sync`,
          });
      }
    }

    return { source: entries[0]?.category as any, target: "claude-code", actions };
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
