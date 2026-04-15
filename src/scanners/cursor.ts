import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { CanonicalInstruction, ContextEntry, HarnessContext } from "../model/context.ts";
import { parseFrontmatter } from "../utils/frontmatter.ts";
import { exists, readFileIfExists, relativeDisplayPath, walkFiles } from "../utils/fs.ts";
import type { Scanner } from "./scanner.ts";

const CURSOR_DIR = join(homedir(), ".cursor");

export const cursorScanner: Scanner = {
  id: "cursor",
  displayName: "Cursor",

  async detect(workspaceRoot?: string): Promise<boolean> {
    return (
      (await exists(CURSOR_DIR)) ||
      (workspaceRoot ? exists(join(workspaceRoot, ".cursor", "rules")) : false)
    );
  },

  async scan(workspaceRoot?: string): Promise<HarnessContext> {
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

    if (workspaceRoot) {
      const workspaceRules = await walkFiles(
        join(workspaceRoot, ".cursor", "rules"),
        (path) => path.endsWith(".mdc") || path.endsWith(".md"),
      );
      for (const filePath of workspaceRules) {
        const content = await readFileIfExists(filePath);
        if (content === null) continue;

        const { body } = parseFrontmatter(content);
        const name = relativeDisplayPath(workspaceRoot, filePath).replace(/\.(mdc|md)$/, "");

        entries.push({
          category: "instructions",
          name,
          canonical: {
            type: "instruction",
            body: body.trim() || content,
          } satisfies CanonicalInstruction,
          sourcePath: filePath,
          scope: "workspace",
          raw: content,
        });
      }
    }

    return { harness: "cursor", entries };
  },
};
