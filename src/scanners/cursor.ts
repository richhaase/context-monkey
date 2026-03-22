import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { CanonicalInstruction, ContextEntry, HarnessContext } from "../model/context.ts";
import { parseFrontmatter } from "../utils/frontmatter.ts";
import { exists, readFileIfExists } from "../utils/fs.ts";
import type { Scanner } from "./scanner.ts";

const CURSOR_DIR = join(homedir(), ".cursor");

export const cursorScanner: Scanner = {
  id: "cursor",
  displayName: "Cursor",

  async detect(): Promise<boolean> {
    return exists(CURSOR_DIR);
  },

  async scan(): Promise<HarnessContext> {
    const entries: ContextEntry[] = [];

    // Rules: ~/.cursor/rules/ (MDC files)
    const rulesDir = join(CURSOR_DIR, "rules");
    if (await exists(rulesDir)) {
      const files = await readdir(rulesDir, { withFileTypes: true, recursive: true });
      for (const file of files) {
        if (!file.isFile()) continue;
        if (!file.name.endsWith(".mdc") && !file.name.endsWith(".md")) continue;

        const filePath = join(rulesDir, file.parentPath?.replace(rulesDir, "") || "", file.name);
        const content = await readFileIfExists(filePath);
        if (content === null) continue;

        const { body } = parseFrontmatter(content);
        const name = file.name.replace(/\.(mdc|md)$/, "");

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

    return { harness: "cursor", entries };
  },
};
