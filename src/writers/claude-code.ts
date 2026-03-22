import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { parseFrontmatter, serializeFrontmatter } from "../utils/frontmatter.ts";
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
        case "skills": {
          // Create SKILL.md in .claude/skills/<name>/
          const skillPath = join(root, ".claude", "skills", entry.name, "SKILL.md");
          const existing = await readFileIfExists(skillPath);
          actions.push({
            type: existing !== null ? "update" : "create",
            path: skillPath,
            content: entry.content,
            entry,
            existing: existing ?? undefined,
          });
          break;
        }
        case "agents": {
          // Agents become skills with context: fork
          const { frontmatter: srcFm, body } = parseFrontmatter(entry.content);
          const description =
            srcFm.description || (entry.metadata?.description as string) || `Agent: ${entry.name}`;
          const skillContent = serializeFrontmatter(
            { description, context: "fork" },
            body.trim() || entry.content,
          );
          const agentPath = join(root, ".claude", "skills", entry.name, "SKILL.md");
          const existing = await readFileIfExists(agentPath);
          actions.push({
            type: existing !== null ? "update" : "create",
            path: agentPath,
            content: skillContent,
            entry,
            existing: existing ?? undefined,
          });
          break;
        }
        case "commands": {
          // Slash commands → .claude/commands/<name>.md
          const { frontmatter: srcFm, body } = parseFrontmatter(entry.content);
          let content: string;
          if (entry.metadata?.format === "toml") {
            // Translate from TOML (Gemini) to markdown command
            content = body.trim() || entry.content;
          } else {
            content = entry.content;
          }
          const cmdPath = join(root, ".claude", "commands", `${entry.name}.md`);
          const existing = await readFileIfExists(cmdPath);
          actions.push({
            type: existing !== null ? "update" : "create",
            path: cmdPath,
            content,
            entry,
            existing: existing ?? undefined,
          });
          break;
        }
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
