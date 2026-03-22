import { homedir } from "node:os";
import { join } from "node:path";
import type {
  CanonicalAgent,
  CanonicalCommand,
  CanonicalInstruction,
  CanonicalMcp,
  CanonicalSetting,
  ContextEntry,
  HarnessContext,
} from "../model/context.ts";
import { parseFrontmatter } from "../utils/frontmatter.ts";
import { exists, globFiles, globSkillDirs, readFileIfExists } from "../utils/fs.ts";
import type { Scanner } from "./scanner.ts";

const CLAUDE_DIR = join(homedir(), ".claude");

export const claudeCodeScanner: Scanner = {
  id: "claude-code",
  displayName: "Claude Code",

  async detect(): Promise<boolean> {
    return exists(CLAUDE_DIR);
  },

  async scan(): Promise<HarnessContext> {
    const entries: ContextEntry[] = [];

    // Settings: ~/.claude/settings.json and ~/.claude/settings.local.json
    for (const filename of ["settings.json", "settings.local.json"]) {
      const settingsPath = join(CLAUDE_DIR, filename);
      const content = await readFileIfExists(settingsPath);
      if (content !== null) {
        const parsed = tryParseJson(content);
        if (parsed) {
          for (const [key, value] of Object.entries(parsed)) {
            entries.push({
              category: "settings",
              name: `${filename}:${key}`,
              canonical: {
                type: "setting",
                key,
                displayName: key,
                value,
              } satisfies CanonicalSetting,
              sourcePath: settingsPath,
              scope: "global",
              raw: content,
            });
          }
        }
      }
    }

    // Skills and Agents: ~/.claude/skills/*/SKILL.md
    const skillsDir = join(CLAUDE_DIR, "skills");
    const skillNames = await globSkillDirs(skillsDir);
    for (const name of skillNames) {
      const skillPath = join(skillsDir, name, "SKILL.md");
      const content = await readFileIfExists(skillPath);
      if (content !== null) {
        const { frontmatter, body } = parseFrontmatter(content);
        const isAgent = frontmatter.context === "fork";
        const description = frontmatter.description || "";

        if (isAgent) {
          entries.push({
            category: "agents",
            name,
            canonical: {
              type: "agent",
              name,
              description,
              instructions: body.trim(),
              model: frontmatter.model,
            } satisfies CanonicalAgent,
            sourcePath: skillPath,
            scope: "global",
            raw: content,
          });
        } else {
          entries.push({
            category: "skills",
            name,
            canonical: {
              type: "skill",
              name,
              description,
              instructions: body.trim(),
              trigger: frontmatter.trigger,
            },
            sourcePath: skillPath,
            scope: "global",
            raw: content,
          });
        }
      }
    }

    // MCP: ~/.claude/.mcp.json
    const mcpPath = join(CLAUDE_DIR, ".mcp.json");
    const mcpContent = await readFileIfExists(mcpPath);
    if (mcpContent !== null) {
      const parsed = tryParseJson(mcpContent);
      const servers = parsed?.mcpServers ?? {};
      for (const [serverName, config] of Object.entries(servers)) {
        const cfg = config as Record<string, unknown>;
        entries.push({
          category: "mcp",
          name: serverName,
          canonical: {
            type: "mcp",
            serverName,
            command: (cfg.command as string) ?? "",
            args: (cfg.args as string[]) ?? [],
            env: cfg.env as Record<string, string> | undefined,
          } satisfies CanonicalMcp,
          sourcePath: mcpPath,
          scope: "global",
          raw: JSON.stringify(config, null, 2),
        });
      }
    }

    // Memory: ~/.claude/memory/ (if redirected or present)
    const memoryDir = join(CLAUDE_DIR, "memory");
    if (await exists(memoryDir)) {
      const memoryFiles = await globFiles(memoryDir, ".md");
      for (const file of memoryFiles) {
        const filePath = join(memoryDir, file);
        const content = await readFileIfExists(filePath);
        if (content !== null) {
          entries.push(normalizeMemoryEntry(file, content, filePath));
        }
      }
    }

    // Commands: ~/.claude/commands/*.md
    const commandsDir = join(CLAUDE_DIR, "commands");
    const commandFiles = await globFiles(commandsDir, ".md");
    for (const file of commandFiles) {
      const filePath = join(commandsDir, file);
      const content = await readFileIfExists(filePath);
      if (content !== null) {
        const name = file.replace(/\.md$/, "");
        const { frontmatter, body } = parseFrontmatter(content);
        entries.push({
          category: "commands",
          name,
          canonical: {
            type: "command",
            name,
            description: frontmatter.description || `Command: ${name}`,
            prompt: body.trim() || content,
          } satisfies CanonicalCommand,
          sourcePath: filePath,
          scope: "global",
          raw: content,
        });
      }
    }

    // Instructions: ~/.claude/CLAUDE.md (global instructions)
    const claudeMd = await readFileIfExists(join(CLAUDE_DIR, "CLAUDE.md"));
    if (claudeMd !== null) {
      entries.push({
        category: "instructions",
        name: "CLAUDE.md",
        canonical: { type: "instruction", body: claudeMd } satisfies CanonicalInstruction,
        sourcePath: join(CLAUDE_DIR, "CLAUDE.md"),
        scope: "global",
        raw: claudeMd,
      });
    }

    return { harness: "claude-code", entries };
  },
};

function normalizeMemoryEntry(file: string, content: string, filePath: string): ContextEntry {
  const { frontmatter, body } = parseFrontmatter(content);
  const name = file.replace(/\.md$/, "");
  const fmType = frontmatter.type;

  // Classify by frontmatter type or filename heuristics
  let kind: ContextEntry["canonical"] extends { type: "memory" }
    ? ContextEntry["canonical"]["kind"]
    : string;
  let priority: 1 | 2 | 3;
  let summary: string;

  if (fmType === "feedback" || name.match(/^feedback/i)) {
    kind = "feedback";
    priority = 1;
    summary = frontmatter.description || `Feedback: ${name}`;
  } else if (fmType === "user" || name.match(/preference/i)) {
    kind = "preference";
    priority = 1;
    summary = frontmatter.description || "User preferences";
  } else if (name.match(/contact/i)) {
    kind = "user-profile";
    priority = 2;
    summary = "People and accounts";
  } else if (name.match(/system/i)) {
    kind = "system-info";
    priority = 2;
    summary = frontmatter.description || "System information";
  } else if (name.match(/history/i)) {
    kind = "history";
    priority = 3;
    summary = "Decision history";
  } else if (fmType === "project") {
    kind = "project";
    priority = 2;
    summary = frontmatter.description || `Project: ${name}`;
  } else if (fmType === "reference") {
    kind = "reference";
    priority = 3;
    summary = frontmatter.description || `Reference: ${name}`;
  } else if (name === "MEMORY") {
    kind = "reference";
    priority = 1;
    summary = "Memory index";
  } else {
    kind = "reference";
    priority = 3;
    summary = frontmatter.description || `Topic: ${name}`;
  }

  return {
    category: "memory",
    name: file,
    canonical: {
      type: "memory",
      kind: kind as
        | "user-profile"
        | "feedback"
        | "preference"
        | "system-info"
        | "project"
        | "reference"
        | "history",
      name,
      summary,
      content: body.trim() || content,
      priority,
    },
    sourcePath: filePath,
    scope: "global",
    raw: content,
  };
}

function tryParseJson(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
