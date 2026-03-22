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
import { exists, globFiles, globSkillDirs, readFileIfExists } from "../utils/fs.ts";
import type { Scanner } from "./scanner.ts";

const GEMINI_DIR = join(homedir(), ".gemini");

export const geminiScanner: Scanner = {
  id: "gemini",
  displayName: "Gemini CLI",

  async detect(): Promise<boolean> {
    return exists(GEMINI_DIR);
  },

  async scan(): Promise<HarnessContext> {
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

    return { harness: "gemini", entries };
  },
};

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
