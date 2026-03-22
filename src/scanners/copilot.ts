import { homedir } from "node:os";
import { join } from "node:path";
import type { CanonicalInstruction, ContextEntry, HarnessContext } from "../model/context.ts";
import { parseFrontmatter } from "../utils/frontmatter.ts";
import { exists, globFiles, readFileIfExists } from "../utils/fs.ts";
import type { Scanner } from "./scanner.ts";

const GITHUB_DIR = join(homedir(), ".github");

export const copilotScanner: Scanner = {
  id: "copilot",
  displayName: "GitHub Copilot",

  async detect(): Promise<boolean> {
    const hasInstructions = await exists(join(GITHUB_DIR, "copilot-instructions.md"));
    const hasInstructionsDir = await exists(join(GITHUB_DIR, "instructions"));
    return hasInstructions || hasInstructionsDir;
  },

  async scan(): Promise<HarnessContext> {
    const entries: ContextEntry[] = [];

    // Instructions: ~/.github/copilot-instructions.md
    const mainPath = join(GITHUB_DIR, "copilot-instructions.md");
    const mainContent = await readFileIfExists(mainPath);
    if (mainContent !== null) {
      entries.push({
        category: "instructions",
        name: "copilot-instructions.md",
        canonical: {
          type: "instruction",
          body: mainContent,
        } satisfies CanonicalInstruction,
        sourcePath: mainPath,
        scope: "global",
        raw: mainContent,
      });
    }

    // Path-specific: ~/.github/instructions/*.instructions.md
    const instructionsDir = join(GITHUB_DIR, "instructions");
    if (await exists(instructionsDir)) {
      const files = await globFiles(instructionsDir, ".md");
      for (const file of files) {
        const filePath = join(instructionsDir, file);
        const content = await readFileIfExists(filePath);
        if (content === null) continue;

        const { body } = parseFrontmatter(content);
        const name = file.replace(/\.instructions\.md$/, "").replace(/\.md$/, "");

        entries.push({
          category: "instructions",
          name,
          canonical: {
            type: "instruction",
            body: body.trim() || content,
          } satisfies CanonicalInstruction,
          sourcePath: filePath,
          scope: "global",
          raw: content,
        });
      }
    }

    return { harness: "copilot", entries };
  },
};
