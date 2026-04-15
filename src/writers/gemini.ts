import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { renderContextSection } from "../memory/render.ts";
import type { CanonicalMemory, ContextEntry } from "../model/context.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

const GEMINI_DIR = join(homedir(), ".gemini");

export const geminiWriter: Writer = {
  id: "gemini",
  displayName: "Gemini CLI",

  async plan(entries: ContextEntry[], workspaceRoot?: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];
    const baseDir = workspaceRoot ? join(workspaceRoot, ".gemini") : GEMINI_DIR;
    const instructionPath = workspaceRoot ? join(workspaceRoot, "GEMINI.md") : join(GEMINI_DIR, "GEMINI.md");

    const memoryEntries: CanonicalMemory[] = [];
    const instructionEntries: ContextEntry[] = [];
    const otherEntries: ContextEntry[] = [];

    for (const entry of entries) {
      if (entry.canonical.type === "memory") {
        memoryEntries.push(entry.canonical);
      } else if (entry.canonical.type === "instruction") {
        instructionEntries.push(entry);
      } else {
        otherEntries.push(entry);
      }
    }

    for (const entry of otherEntries) {
      const c = entry.canonical;

      switch (c.type) {
        case "command": {
          const path = join(baseDir, "commands", `${sanitizeNestedName(c.name)}.toml`);
          const content = `description = "${c.description.replace(/"/g, '\\"')}"\nprompt = """\n${c.prompt}\n"""`;
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "skill": {
          const path = join(baseDir, "skills", sanitizeFlatName(c.name), "SKILL.md");
          actions.push(await fileAction(path, c.instructions, entry));
          break;
        }
        case "ignore": {
          const path = join(baseDir, ".geminiignore");
          const content = c.patterns.join("\n");
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "agent":
          actions.push(skip(entry, "Gemini CLI agent definitions require extension packaging"));
          break;
        case "setting":
          actions.push(skip(entry, "Settings sync requires JSON merge"));
          break;
        case "mcp":
          actions.push(skip(entry, "MCP server sync not yet supported for Gemini"));
          break;
        case "instruction":
          break;
      }
    }

    // Memory: priority-tiered sections appended to GEMINI.md
    if (memoryEntries.length > 0) {
      const placeholder: ContextEntry = {
        category: "memory",
        name: "memory (aggregated)",
        canonical: memoryEntries[0]!,
        sourcePath: "",
        scope: "global",
        raw: "",
      };

      const critical = memoryEntries.filter((u) => u.priority === 1);
      const important = memoryEntries.filter((u) => u.priority === 2);
      const contextual = memoryEntries.filter((u) => u.priority === 3);

      const sections: string[] = [];

      if (critical.length > 0) {
        sections.push(
          renderContextSection(critical, "Known Context (Critical)", [
            "This context was ported from another agent environment.",
            "These are high-priority items — corrections, preferences, and identity that must be respected.",
          ]),
        );
      }

      if (important.length > 0) {
        sections.push(
          renderContextSection(important, "Known Context (Important)", [
            "System and project context from another agent environment.",
          ]),
        );
      }

      if (contextual.length > 0) {
        const memoryLines = ["## Gemini Added Memories\n"];
        for (const unit of contextual) {
          memoryLines.push(`- **${unit.name}**: ${unit.summary}`);
        }
        sections.push(memoryLines.join("\n"));
      }

      if (sections.length > 0 || instructionEntries.length > 0) {
        const baseInstructions =
          instructionEntries.length > 0
            ? renderInstructionBundle(instructionEntries)
            : ((await readExisting(instructionPath)) ?? "");
        const content = [baseInstructions.trim(), sections.join("\n\n").trim()]
          .filter(Boolean)
          .join("\n\n");
        actions.push(await fileAction(instructionPath, content, placeholder));
      }
    } else if (instructionEntries.length > 0) {
      actions.push(
        await fileAction(
          instructionPath,
          renderInstructionBundle(instructionEntries),
          instructionEntries[0]!,
        ),
      );
    }

    return { source: "gemini", target: "gemini", actions };
  },

  async execute(plan: SyncPlan): Promise<void> {
    for (const action of plan.actions) {
      if (action.type === "skip" || !action.content) continue;
      const dir = dirname(action.path);
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

function sanitizeFlatName(name: string): string {
  return name.replace(/[:/\\]/g, "-");
}

function sanitizeNestedName(name: string): string {
  return name.replace(/:/g, "-");
}

function renderInstructionBundle(entries: ContextEntry[]): string {
  const sections: string[] = [];
  for (const entry of entries) {
    if (entry.canonical.type !== "instruction") continue;
    sections.push(`<!-- Source: ${entry.name} -->\n${entry.canonical.body.trim()}`);
  }
  return sections.join("\n\n");
}
