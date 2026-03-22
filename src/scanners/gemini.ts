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

export const geminiScanner: Scanner = {
  id: "gemini",
  displayName: "Gemini CLI",

  async detect(root: string): Promise<boolean> {
    const hasGeminiMd = await exists(join(root, "GEMINI.md"));
    const hasGeminiDir = await exists(join(root, ".gemini"));
    const hasGlobalGeminiMd = await exists(join(homedir(), ".gemini", "GEMINI.md"));
    return hasGeminiMd || hasGeminiDir || hasGlobalGeminiMd;
  },

  async scan(root: string): Promise<HarnessContext> {
    const entries: ContextEntry[] = [];

    // Instructions: GEMINI.md (workspace)
    const geminiMd = await readFileIfExists(join(root, "GEMINI.md"));
    if (geminiMd !== null) {
      entries.push({
        category: "instructions",
        name: "GEMINI.md",
        canonical: { type: "instruction", body: geminiMd } satisfies CanonicalInstruction,
        sourcePath: join(root, "GEMINI.md"),
        scope: "workspace",
        raw: geminiMd,
      });
    }

    // Instructions: ~/.gemini/GEMINI.md (global)
    const globalGeminiMd = await readFileIfExists(join(homedir(), ".gemini", "GEMINI.md"));
    if (globalGeminiMd !== null) {
      entries.push({
        category: "instructions",
        name: "GEMINI.md",
        canonical: { type: "instruction", body: globalGeminiMd } satisfies CanonicalInstruction,
        sourcePath: join(homedir(), ".gemini", "GEMINI.md"),
        scope: "global",
        raw: globalGeminiMd,
      });
    }

    // Settings: .gemini/settings.json
    const settingsPath = join(root, ".gemini", "settings.json");
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
            scope: "workspace",
            raw: settingsContent,
          });
        }
      }
    }

    // Ignore: .geminiignore
    const ignorePath = join(root, ".geminiignore");
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
        scope: "workspace",
        raw: ignoreContent,
      });
    }

    // Commands: .gemini/commands/*.toml (project and global)
    for (const commandsDir of [
      join(root, ".gemini", "commands"),
      join(homedir(), ".gemini", "commands"),
    ]) {
      const commandFiles = await globFiles(commandsDir, ".toml");
      for (const file of commandFiles) {
        const filePath = join(commandsDir, file);
        const content = await readFileIfExists(filePath);
        if (content === null) continue;
        const isGlobal = commandsDir.startsWith(homedir());
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
          scope: isGlobal ? "global" : "workspace",
          raw: content,
        });
      }
    }

    // Skills: .gemini/skills/ and .agents/skills/ (shared portable path)
    for (const skillsDir of [join(root, ".gemini", "skills"), join(root, ".agents", "skills")]) {
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
            scope: "workspace",
            raw: content,
          });
        }
      }
    }

    return { harness: "gemini", root, entries };
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
