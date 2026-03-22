import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { parseFrontmatter } from "../utils/frontmatter.ts";
import { exists, readFileIfExists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const geminiWriter: Writer = {
  id: "gemini",
  displayName: "Gemini CLI",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

    for (const entry of entries) {
      switch (entry.category) {
        case "instructions": {
          const path = join(root, "GEMINI.md");
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
        case "ignore": {
          const path = join(root, ".geminiignore");
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
        case "commands": {
          // Translate commands to Gemini TOML format
          const { frontmatter, body } = parseFrontmatter(entry.content);
          const description = frontmatter.description || `Command: ${entry.name}`;
          const tomlContent = `description = "${description.replace(/"/g, '\\"')}"\nprompt = """\n${body.trim()}\n"""`;
          const cmdPath = join(root, ".gemini", "commands", `${entry.name}.toml`);
          const cmdExisting = await readFileIfExists(cmdPath);
          actions.push({
            type: cmdExisting !== null ? "update" : "create",
            path: cmdPath,
            content: tomlContent,
            entry,
            existing: cmdExisting ?? undefined,
          });
          break;
        }
        case "skills": {
          // Gemini supports Agent Skills — put them in .agents/skills/ (portable path)
          const skillPath = join(root, ".agents", "skills", entry.name, "SKILL.md");
          const skillExisting = await readFileIfExists(skillPath);
          actions.push({
            type: skillExisting !== null ? "update" : "create",
            path: skillPath,
            content: entry.content,
            entry,
            existing: skillExisting ?? undefined,
          });
          break;
        }
        case "agents":
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: "Gemini CLI agent definitions require extension packaging — not yet automated",
          });
          break;
        default:
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason: `Category "${entry.category}" not yet supported for Gemini sync`,
          });
      }
    }

    return { source: entries[0]?.category as any, target: "gemini", actions };
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
