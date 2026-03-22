import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { renderContextSection } from "../memory/render.ts";
import type { CanonicalMemory, ContextEntry } from "../model/context.ts";
import { serializeFrontmatter } from "../utils/frontmatter.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const cursorWriter: Writer = {
  id: "cursor",
  displayName: "Cursor",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];
    const rulesDir = join(root, ".cursor", "rules");

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
        case "mcp":
          actions.push(skip(entry, "MCP server sync not yet supported for Cursor"));
          break;
        case "ignore":
          actions.push(skip(entry, "Cursor has no ignore file format"));
          break;
      }
    }

    // Memory: inject as an always-on rule file
    if (memoryEntries.length > 0) {
      const significant = memoryEntries.filter((u) => u.priority <= 2);
      if (significant.length > 0) {
        const placeholder: ContextEntry = {
          category: "memory",
          name: "memory (aggregated)",
          canonical: memoryEntries[0]!,
          sourcePath: "",
          scope: "workspace",
          raw: "",
        };

        const body = renderContextSection(significant, "Known User Context", [
          "This context was ported from another agent environment.",
          "Treat as established — do not ask the user to re-explain these things.",
        ]);

        const content = serializeFrontmatter(
          {
            description: "Ported user context and preferences — always apply",
            alwaysApply: "true",
          },
          body,
        );

        actions.push(await fileAction(join(rulesDir, "user-context.mdc"), content, placeholder));
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
