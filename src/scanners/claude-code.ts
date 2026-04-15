import { homedir } from "node:os";
import { basename, dirname, join, relative } from "node:path";
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
import {
  exists,
  globFiles,
  globSkillDirs,
  readFileIfExists,
  relativeDisplayPath,
  walkFiles,
} from "../utils/fs.ts";
import type { Scanner } from "./scanner.ts";

const CLAUDE_DIR = join(homedir(), ".claude");

export const claudeCodeScanner: Scanner = {
  id: "claude-code",
  displayName: "Claude Code",

  async detect(workspaceRoot?: string): Promise<boolean> {
    return (
      (await exists(CLAUDE_DIR)) || (workspaceRoot ? hasWorkspaceArtifacts(workspaceRoot) : false)
    );
  },

  async scan(workspaceRoot?: string): Promise<HarnessContext> {
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

    if (workspaceRoot) {
      await scanWorkspace(entries, workspaceRoot);
    }

    return { harness: "claude-code", entries };
  },
};

async function hasWorkspaceArtifacts(workspaceRoot: string): Promise<boolean> {
  const candidates = [
    join(workspaceRoot, "CLAUDE.md"),
    join(workspaceRoot, ".claude", "CLAUDE.md"),
    join(workspaceRoot, ".claude", "settings.json"),
    join(workspaceRoot, ".claude", "settings.local.json"),
    join(workspaceRoot, ".claude", "rules"),
    join(workspaceRoot, ".claude", "skills"),
    join(workspaceRoot, ".claude", "commands"),
    join(workspaceRoot, ".mcp.json"),
  ];

  for (const path of candidates) {
    if (await exists(path)) return true;
  }

  const pluginManifests = await walkFiles(workspaceRoot, (path) =>
    path.endsWith(".claude-plugin/plugin.json"),
  );
  return pluginManifests.length > 0;
}

async function scanWorkspace(entries: ContextEntry[], workspaceRoot: string): Promise<void> {
  const instructionCandidates = [
    join(workspaceRoot, "CLAUDE.md"),
    join(workspaceRoot, ".claude", "CLAUDE.md"),
  ];

  for (const path of instructionCandidates) {
    const content = await readFileIfExists(path);
    if (content === null) continue;
    entries.push({
      category: "instructions",
      name: relativeDisplayPath(workspaceRoot, path),
      canonical: {
        type: "instruction",
        body: content,
      } satisfies CanonicalInstruction,
      sourcePath: path,
      scope: "workspace",
      raw: content,
    });
  }

  for (const filename of ["settings.json", "settings.local.json"]) {
    const settingsPath = join(workspaceRoot, ".claude", filename);
    const content = await readFileIfExists(settingsPath);
    if (content === null) continue;
    const parsed = tryParseJson(content);
    if (!parsed) continue;
    for (const [key, value] of Object.entries(parsed)) {
      entries.push({
        category: "settings",
        name: `${relativeDisplayPath(workspaceRoot, settingsPath)}:${key}`,
        canonical: {
          type: "setting",
          key,
          displayName: key,
          value,
        } satisfies CanonicalSetting,
        sourcePath: settingsPath,
        scope: "workspace",
        raw: content,
      });
    }
  }

  const mcpPath = join(workspaceRoot, ".mcp.json");
  const mcpContent = await readFileIfExists(mcpPath);
  if (mcpContent !== null) {
    const parsed = tryParseJson(mcpContent);
    const servers = parsed?.mcpServers ?? {};
    for (const [serverName, config] of Object.entries(servers)) {
      const cfg = config as Record<string, unknown>;
      entries.push({
        category: "mcp",
        name: `${relativeDisplayPath(workspaceRoot, mcpPath)}:${serverName}`,
        canonical: {
          type: "mcp",
          serverName,
          command: (cfg.command as string) ?? "",
          args: (cfg.args as string[]) ?? [],
          env: cfg.env as Record<string, string> | undefined,
        } satisfies CanonicalMcp,
        sourcePath: mcpPath,
        scope: "workspace",
        raw: JSON.stringify(config, null, 2),
      });
    }
  }

  for (const skillName of await globSkillDirs(join(workspaceRoot, ".claude", "skills"))) {
    const skillPath = join(workspaceRoot, ".claude", "skills", skillName, "SKILL.md");
    const content = await readFileIfExists(skillPath);
    if (content === null) continue;
    const { frontmatter, body } = parseFrontmatter(content);
    const isAgent = frontmatter.context === "fork";
    const description = frontmatter.description || "";
    entries.push({
      category: isAgent ? "agents" : "skills",
      name: skillName,
      canonical: isAgent
        ? ({
            type: "agent",
            name: skillName,
            description,
            instructions: body.trim(),
            model: frontmatter.model,
          } satisfies CanonicalAgent)
        : {
            type: "skill",
            name: skillName,
            description,
            instructions: body.trim(),
            trigger: frontmatter.trigger,
          },
      sourcePath: skillPath,
      scope: "workspace",
      raw: content,
    });
  }

  const ruleFiles = await walkFiles(join(workspaceRoot, ".claude", "rules"), (path) =>
    path.endsWith(".md"),
  );
  for (const rulePath of ruleFiles) {
    const content = await readFileIfExists(rulePath);
    if (content === null) continue;
    const { body } = parseFrontmatter(content);
    entries.push({
      category: "instructions",
      name: relativeDisplayPath(workspaceRoot, rulePath),
      canonical: {
        type: "instruction",
        body: body.trim() || content,
      } satisfies CanonicalInstruction,
      sourcePath: rulePath,
      scope: relative(workspaceRoot, rulePath).includes("/") ? "subdirectory" : "workspace",
      raw: content,
    });
  }

  const commandFiles = await walkFiles(join(workspaceRoot, ".claude", "commands"), (path) =>
    path.endsWith(".md"),
  );
  for (const filePath of commandFiles) {
    const content = await readFileIfExists(filePath);
    if (content === null) continue;
    const { frontmatter, body } = parseFrontmatter(content);
    const name = relativeDisplayPath(join(workspaceRoot, ".claude", "commands"), filePath).replace(
      /\.md$/,
      "",
    );
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
      scope: "workspace",
      raw: content,
    });
  }

  const pluginManifests = await walkFiles(workspaceRoot, (path) =>
    path.endsWith(".claude-plugin/plugin.json"),
  );
  for (const manifestPath of pluginManifests) {
    const pluginRoot = dirname(dirname(manifestPath));
    const manifestContent = await readFileIfExists(manifestPath);
    const manifest = manifestContent ? tryParseJson(manifestContent) : null;
    const pluginName =
      (manifest?.name as string | undefined) || basename(pluginRoot).replace(/[^a-z0-9-]/gi, "-");

    for (const skillName of await globSkillDirs(join(pluginRoot, "skills"))) {
      const skillPath = join(pluginRoot, "skills", skillName, "SKILL.md");
      const content = await readFileIfExists(skillPath);
      if (content === null) continue;
      const { frontmatter, body } = parseFrontmatter(content);
      entries.push({
        category: "skills",
        name: `${pluginName}:${skillName}`,
        canonical: {
          type: "skill",
          name: `${pluginName}:${skillName}`,
          description: frontmatter.description || "",
          instructions: body.trim(),
          trigger: frontmatter.trigger,
        },
        sourcePath: skillPath,
        scope: "workspace",
        raw: content,
      });
    }

    const pluginCommands = await walkFiles(join(pluginRoot, "commands"), (path) =>
      path.endsWith(".md"),
    );
    for (const commandPath of pluginCommands) {
      const content = await readFileIfExists(commandPath);
      if (content === null) continue;
      const { frontmatter, body } = parseFrontmatter(content);
      const localName = relativeDisplayPath(join(pluginRoot, "commands"), commandPath).replace(
        /\.md$/,
        "",
      );
      entries.push({
        category: "commands",
        name: `${pluginName}:${localName}`,
        canonical: {
          type: "command",
          name: `${pluginName}:${localName}`,
          description: frontmatter.description || `Command: ${localName}`,
          prompt: body.trim() || content,
        } satisfies CanonicalCommand,
        sourcePath: commandPath,
        scope: "workspace",
        raw: content,
      });
    }
  }
}

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
