import { homedir } from "node:os";
import { join } from "node:path";
import type { ContextEntry, HarnessContext } from "../model/context.ts";
import { exists, readFileIfExists } from "../utils/fs.ts";
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
        content: geminiMd,
        sourcePath: join(root, "GEMINI.md"),
        scope: "workspace",
      });
    }

    // Instructions: ~/.gemini/GEMINI.md (global)
    const globalGeminiMd = await readFileIfExists(join(homedir(), ".gemini", "GEMINI.md"));
    if (globalGeminiMd !== null) {
      entries.push({
        category: "instructions",
        name: "GEMINI.md",
        content: globalGeminiMd,
        sourcePath: join(homedir(), ".gemini", "GEMINI.md"),
        scope: "global",
      });
    }

    // Settings: .gemini/settings.json
    const settingsPath = join(root, ".gemini", "settings.json");
    const settings = await readFileIfExists(settingsPath);
    if (settings !== null) {
      entries.push({
        category: "settings",
        name: "settings.json",
        content: settings,
        sourcePath: settingsPath,
        scope: "workspace",
      });
    }

    // Ignore: .geminiignore
    const ignorePath = join(root, ".geminiignore");
    const ignoreContent = await readFileIfExists(ignorePath);
    if (ignoreContent !== null) {
      entries.push({
        category: "ignore",
        name: ".geminiignore",
        content: ignoreContent,
        sourcePath: ignorePath,
        scope: "workspace",
      });
    }

    return { harness: "gemini", root, entries };
  },
};
