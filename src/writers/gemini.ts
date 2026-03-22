import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const geminiWriter: Writer = {
  id: "gemini",
  displayName: "Gemini CLI",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

    for (const entry of entries) {
      const c = entry.canonical;

      switch (c.type) {
        case "instruction": {
          const path = join(root, "GEMINI.md");
          actions.push(await fileAction(path, c.body, entry));
          break;
        }
        case "command": {
          const path = join(root, ".gemini", "commands", `${c.name}.toml`);
          const content = `description = "${c.description.replace(/"/g, '\\"')}"\nprompt = """\n${c.prompt}\n"""`;
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "skill": {
          // Agent Skills spec — portable .agents/skills/ path
          const path = join(root, ".agents", "skills", c.name, "SKILL.md");
          actions.push(await fileAction(path, c.instructions, entry));
          break;
        }
        case "ignore": {
          const path = join(root, ".geminiignore");
          const content = c.patterns.join("\n");
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "agent":
          actions.push(
            skip(
              entry,
              "Gemini CLI agent definitions require extension packaging — not yet automated",
            ),
          );
          break;
        case "setting":
          actions.push(skip(entry, "Settings sync requires JSON merge — use cm settings"));
          break;
        case "memory":
          actions.push(skip(entry, "Use 'cm memory' for semantic memory translation"));
          break;
        case "mcp":
          actions.push(skip(entry, "MCP server sync not yet supported for Gemini"));
          break;
      }
    }

    return { source: "gemini", target: "gemini", actions };
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
