import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { serializeFrontmatter } from "../utils/frontmatter.ts";
import { exists, readFileIfExists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const cursorWriter: Writer = {
  id: "cursor",
  displayName: "Cursor",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];
    const rulesDir = join(root, ".cursor", "rules");

    for (const entry of entries) {
      switch (entry.category) {
        case "instructions": {
          const filename = `${sanitizeName(entry.name)}.mdc`;
          const path = join(rulesDir, filename);
          const existing = await readFileIfExists(path);
          const content = serializeFrontmatter(
            {
              description: `Ported from ${entry.sourcePath}`,
              alwaysApply: "true",
            },
            entry.content,
          );
          actions.push({
            type: existing !== null ? "update" : "create",
            path,
            content,
            entry,
            existing: existing ?? undefined,
          });
          break;
        }
        case "skills": {
          // Convert skill SKILL.md to a cursor rule file (instructions only)
          const filename = `${sanitizeName(entry.name)}.mdc`;
          const path = join(rulesDir, filename);
          const existing = await readFileIfExists(path);
          const description = (entry.metadata?.description as string) || `Skill: ${entry.name}`;
          const content = serializeFrontmatter(
            { description, alwaysApply: "false" },
            entry.content,
          );
          actions.push({
            type: existing !== null ? "update" : "create",
            path,
            content,
            entry,
            existing: existing ?? undefined,
          });
          break;
        }
        default:
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: `Category "${entry.category}" not supported for Cursor sync`,
          });
      }
    }

    return { source: entries[0]?.category as any, target: "cursor", actions };
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
