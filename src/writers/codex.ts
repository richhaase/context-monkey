import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { parseFrontmatter } from "../utils/frontmatter.ts";
import { exists, readFileIfExists } from "../utils/fs.ts";
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
        case "agents": {
          // Translate agent definition to Codex TOML format
          const { frontmatter, body } = parseFrontmatter(entry.content);
          const agentName = frontmatter.name || entry.name;
          const description = frontmatter.description || `Agent: ${entry.name}`;
          const model = frontmatter.model || "";
          const tomlContent = generateCodexAgentToml(agentName, description, body.trim(), model);
          const agentPath = join(root, ".codex", "agents", `${entry.name}.toml`);
          const agentExisting = await readFileIfExists(agentPath);
          actions.push({
            type: agentExisting !== null ? "update" : "create",
            path: agentPath,
            content: tomlContent,
            entry,
            existing: agentExisting ?? undefined,
          });
          break;
        }
        case "commands": {
          // Commands don't have a direct Codex equivalent — note in skip
          actions.push({
            type: "skip",
            path: "",
            entry,
            reason:
              "Codex has no slash command files — agent definitions handle similar functionality",
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
      const dir = join(action.path, "..");
      if (!(await exists(dir))) {
        await mkdir(dir, { recursive: true });
      }
      await Bun.write(action.path, action.content);
    }
  },
};

function generateCodexAgentToml(
  name: string,
  description: string,
  instructions: string,
  model: string,
): string {
  const lines: string[] = [];
  lines.push(`name = "${name}"`);
  lines.push(`description = "${description.replace(/"/g, '\\"')}"`);
  lines.push(`developer_instructions = """`);
  lines.push(instructions);
  lines.push(`"""`);
  if (model) {
    lines.push(`model = "${model}"`);
  }
  lines.push(`sandbox_mode = "workspace-write"`);
  return lines.join("\n");
}
