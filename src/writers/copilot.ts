import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { renderContextSection } from "../memory/render.ts";
import type { CanonicalMemory, ContextEntry } from "../model/context.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

const GITHUB_DIR = join(homedir(), ".github");

export const copilotWriter: Writer = {
  id: "copilot",
  displayName: "GitHub Copilot",

  async plan(entries: ContextEntry[]): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

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
          const path = join(GITHUB_DIR, "copilot-instructions.md");
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
        case "mcp":
          actions.push(skip(entry, "MCP server sync not yet supported for Copilot"));
          break;
        case "ignore":
          actions.push(skip(entry, "Copilot has no ignore file format"));
          break;
      }
    }

    // Memory: inject into copilot-instructions.md
    if (memoryEntries.length > 0) {
      const significant = memoryEntries.filter((u) => u.priority <= 2);
      if (significant.length > 0) {
        const placeholder: ContextEntry = {
          category: "memory",
          name: "memory (aggregated)",
          canonical: memoryEntries[0]!,
          sourcePath: "",
          scope: "global",
          raw: "",
        };

        const body = renderContextSection(significant, "Known User Context", [
          "This context was ported from another agent environment.",
          "Treat as established knowledge.",
        ]);

        const instructionsPath = join(GITHUB_DIR, "copilot-instructions.md");
        const existing = await readExisting(instructionsPath);
        const content = existing ? `${existing}\n\n${body}` : body;
        actions.push(await fileAction(instructionsPath, content, placeholder));
      }
    }

    return { source: "copilot", target: "copilot", actions };
  },

  async execute(plan: SyncPlan): Promise<void> {
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

async function readExisting(path: string): Promise<string | null> {
  try {
    return await Bun.file(path).text();
  } catch {
    return null;
  }
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
