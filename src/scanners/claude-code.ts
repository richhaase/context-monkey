import { join } from "node:path";
import type { ContextEntry, HarnessContext } from "../model/context.ts";
import { parseFrontmatter } from "../utils/frontmatter.ts";
import { exists, globFiles, globSkillDirs, readFileIfExists } from "../utils/fs.ts";
import type { Scanner } from "./scanner.ts";

export const claudeCodeScanner: Scanner = {
  id: "claude-code",
  displayName: "Claude Code",

  async detect(root: string): Promise<boolean> {
    const hasClaudeDir = await exists(join(root, ".claude"));
    const hasClaudeMd = await exists(join(root, "CLAUDE.md"));
    return hasClaudeDir || hasClaudeMd;
  },

  async scan(root: string): Promise<HarnessContext> {
    const entries: ContextEntry[] = [];

    // Instructions: CLAUDE.md
    const claudeMd = await readFileIfExists(join(root, "CLAUDE.md"));
    if (claudeMd !== null) {
      entries.push({
        category: "instructions",
        name: "CLAUDE.md",
        content: claudeMd,
        sourcePath: join(root, "CLAUDE.md"),
        scope: "workspace",
      });
    }

    // Skills: .claude/skills/*/SKILL.md
    const skillsRoot = join(root, ".claude", "skills");
    const skillNames = await globSkillDirs(skillsRoot);
    for (const name of skillNames) {
      const skillPath = join(skillsRoot, name, "SKILL.md");
      const content = await readFileIfExists(skillPath);
      if (content !== null) {
        const { frontmatter } = parseFrontmatter(content);
        entries.push({
          category: "skills",
          name,
          content,
          sourcePath: skillPath,
          scope: "workspace",
          metadata: frontmatter,
        });
      }
    }

    // Settings: .claude/settings.json and .claude/settings.local.json
    for (const filename of ["settings.json", "settings.local.json"]) {
      const settingsPath = join(root, ".claude", filename);
      const content = await readFileIfExists(settingsPath);
      if (content !== null) {
        entries.push({
          category: "settings",
          name: filename,
          content,
          sourcePath: settingsPath,
          scope: "workspace",
        });
      }
    }

    // MCP: .mcp.json
    const mcpPath = join(root, ".mcp.json");
    const mcpContent = await readFileIfExists(mcpPath);
    if (mcpContent !== null) {
      entries.push({
        category: "mcp",
        name: ".mcp.json",
        content: mcpContent,
        sourcePath: mcpPath,
        scope: "workspace",
      });
    }

    // Memory: memory/ directory
    const memoryDir = join(root, "memory");
    if (await exists(memoryDir)) {
      const memoryFiles = await globFiles(memoryDir, ".md");
      for (const file of memoryFiles) {
        const filePath = join(memoryDir, file);
        const content = await readFileIfExists(filePath);
        if (content !== null) {
          entries.push({
            category: "memory",
            name: file,
            content,
            sourcePath: filePath,
            scope: "workspace",
          });
        }
      }
    }

    // Commands: .claude/commands/*.md
    const commandsDir = join(root, ".claude", "commands");
    const commandFiles = await globFiles(commandsDir, ".md");
    for (const file of commandFiles) {
      const filePath = join(commandsDir, file);
      const content = await readFileIfExists(filePath);
      if (content !== null) {
        entries.push({
          category: "commands",
          name: file.replace(/\.md$/, ""),
          content,
          sourcePath: filePath,
          scope: "workspace",
        });
      }
    }

    return { harness: "claude-code", root, entries };
  },
};
