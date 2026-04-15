import { homedir } from "node:os";
import { join } from "node:path";
import type {
  CanonicalCommand,
  CanonicalIgnore,
  CanonicalInstruction,
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

const GEMINI_DIR = join(homedir(), ".gemini");

export const geminiScanner: Scanner = {
  id: "gemini",
  displayName: "Gemini CLI",

  async detect(workspaceRoot?: string): Promise<boolean> {
    return (await exists(GEMINI_DIR)) || (workspaceRoot ? hasWorkspaceArtifacts(workspaceRoot) : false);
  },

  async scan(workspaceRoot?: string): Promise<HarnessContext> {
    const entries: ContextEntry[] = [];

    // Instructions: ~/.gemini/GEMINI.md
    const geminiMd = await readFileIfExists(join(GEMINI_DIR, "GEMINI.md"));
    if (geminiMd !== null) {
      entries.push({
        category: "instructions",
        name: "GEMINI.md",
        canonical: { type: "instruction", body: geminiMd } satisfies CanonicalInstruction,
        sourcePath: join(GEMINI_DIR, "GEMINI.md"),
        scope: "global",
        raw: geminiMd,
      });
    }

    // Settings: ~/.gemini/settings.json
    const settingsPath = join(GEMINI_DIR, "settings.json");
    const settingsContent = await readFileIfExists(settingsPath);
    if (settingsContent !== null) {
      const parsed = tryParseJson(settingsContent);
      if (parsed) {
        for (const [key, value] of Object.entries(parsed)) {
          entries.push({
            category: "settings",
            name: `settings.json:${key}`,
            canonical: {
              type: "setting",
              key,
              displayName: key,
              value,
            } satisfies CanonicalSetting,
            sourcePath: settingsPath,
            scope: "global",
            raw: settingsContent,
          });
        }
      }
    }

    // Ignore: ~/.gemini/.geminiignore
    const ignorePath = join(GEMINI_DIR, ".geminiignore");
    const ignoreContent = await readFileIfExists(ignorePath);
    if (ignoreContent !== null) {
      entries.push({
        category: "ignore",
        name: ".geminiignore",
        canonical: {
          type: "ignore",
          patterns: ignoreContent
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l && !l.startsWith("#")),
        } satisfies CanonicalIgnore,
        sourcePath: ignorePath,
        scope: "global",
        raw: ignoreContent,
      });
    }

    // Commands: ~/.gemini/commands/*.toml
    const commandsDir = join(GEMINI_DIR, "commands");
    const commandFiles = await globFiles(commandsDir, ".toml");
    for (const file of commandFiles) {
      const filePath = join(commandsDir, file);
      const content = await readFileIfExists(filePath);
      if (content === null) continue;
      const name = file.replace(/\.toml$/, "");

      const description = extractTomlString(content, "description") || `Command: ${name}`;
      const prompt = extractTomlMultilineString(content, "prompt") || "";

      entries.push({
        category: "commands",
        name,
        canonical: {
          type: "command",
          name,
          description,
          prompt,
        } satisfies CanonicalCommand,
        sourcePath: filePath,
        scope: "global",
        raw: content,
      });
    }

    // Skills: ~/.gemini/skills/
    const skillsDir = join(GEMINI_DIR, "skills");
    const skillNames = await globSkillDirs(skillsDir);
    for (const name of skillNames) {
      const skillPath = join(skillsDir, name, "SKILL.md");
      const content = await readFileIfExists(skillPath);
      if (content !== null) {
        const { frontmatter, body } = parseFrontmatter(content);
        entries.push({
          category: "skills",
          name,
          canonical: {
            type: "skill",
            name,
            description: frontmatter.description || "",
            instructions: body.trim(),
            trigger: frontmatter.trigger,
          },
          sourcePath: skillPath,
          scope: "global",
          raw: content,
        });
      }
    }

    if (workspaceRoot) {
      await scanWorkspace(entries, workspaceRoot);
    }

    return { harness: "gemini", entries };
  },
};

async function hasWorkspaceArtifacts(workspaceRoot: string): Promise<boolean> {
  const candidates = [
    join(workspaceRoot, "GEMINI.md"),
    join(workspaceRoot, ".gemini", "settings.json"),
    join(workspaceRoot, ".gemini", ".geminiignore"),
    join(workspaceRoot, ".gemini", "commands"),
    join(workspaceRoot, ".gemini", "skills"),
    join(workspaceRoot, ".agents", "skills"),
  ];

  for (const path of candidates) {
    if (await exists(path)) return true;
  }

  const nestedContext = await walkFiles(workspaceRoot, (path) => path.endsWith("/GEMINI.md"));
  return nestedContext.length > 0;
}

async function scanWorkspace(entries: ContextEntry[], workspaceRoot: string): Promise<void> {
  const contextFiles = await walkFiles(workspaceRoot, (path) => path.endsWith("/GEMINI.md"));
  for (const path of contextFiles) {
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
      scope: path === join(workspaceRoot, "GEMINI.md") ? "workspace" : "subdirectory",
      raw: content,
    });
  }

  const settingsPath = join(workspaceRoot, ".gemini", "settings.json");
  const settingsContent = await readFileIfExists(settingsPath);
  if (settingsContent !== null) {
    const parsed = tryParseJson(settingsContent);
    if (parsed) {
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
          raw: settingsContent,
        });
      }
    }
  }

  const ignorePath = join(workspaceRoot, ".gemini", ".geminiignore");
  const ignoreContent = await readFileIfExists(ignorePath);
  if (ignoreContent !== null) {
    entries.push({
      category: "ignore",
      name: relativeDisplayPath(workspaceRoot, ignorePath),
      canonical: {
        type: "ignore",
        patterns: ignoreContent
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("#")),
      } satisfies CanonicalIgnore,
      sourcePath: ignorePath,
      scope: "workspace",
      raw: ignoreContent,
    });
  }

  const commandFiles = await walkFiles(
    join(workspaceRoot, ".gemini", "commands"),
    (path) => path.endsWith(".toml"),
  );
  for (const filePath of commandFiles) {
    const content = await readFileIfExists(filePath);
    if (content === null) continue;
    const name = relativeDisplayPath(join(workspaceRoot, ".gemini", "commands"), filePath).replace(
      /\.toml$/,
      "",
    );
    entries.push({
      category: "commands",
      name,
      canonical: {
        type: "command",
        name,
        description: extractTomlString(content, "description") || `Command: ${name}`,
        prompt: extractTomlMultilineString(content, "prompt") || "",
      } satisfies CanonicalCommand,
      sourcePath: filePath,
      scope: "workspace",
      raw: content,
    });
  }

  for (const baseDir of [join(workspaceRoot, ".gemini", "skills"), join(workspaceRoot, ".agents", "skills")]) {
    for (const skillName of await globSkillDirs(baseDir)) {
      const skillPath = join(baseDir, skillName, "SKILL.md");
      const content = await readFileIfExists(skillPath);
      if (content === null) continue;
      const { frontmatter, body } = parseFrontmatter(content);
      entries.push({
        category: "skills",
        name: skillName,
        canonical: {
          type: "skill",
          name: skillName,
          description: frontmatter.description || "",
          instructions: body.trim(),
          trigger: frontmatter.trigger,
        },
        sourcePath: skillPath,
        scope: "workspace",
        raw: content,
      });
    }
  }
}

function extractTomlString(content: string, key: string): string | null {
  const regex = new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, "m");
  const match = content.match(regex);
  return match?.[1] ?? null;
}

function extractTomlMultilineString(content: string, key: string): string | null {
  const regex = new RegExp(`^${key}\\s*=\\s*"""([\\s\\S]*?)"""`, "m");
  const match = content.match(regex);
  return match?.[1]?.trim() ?? null;
}

function tryParseJson(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
