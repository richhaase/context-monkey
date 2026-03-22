import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { CanonicalInstruction, ContextEntry, HarnessContext } from "../model/context.ts";
import { parseFrontmatter } from "../utils/frontmatter.ts";
import { exists, readFileIfExists } from "../utils/fs.ts";
import type { Scanner } from "./scanner.ts";

export const cursorScanner: Scanner = {
  id: "cursor",
  displayName: "Cursor",

  async detect(root: string): Promise<boolean> {
    const hasCursorDir = await exists(join(root, ".cursor"));
    const hasCursorRules = await exists(join(root, ".cursorrules"));
    return hasCursorDir || hasCursorRules;
  },

  async scan(root: string): Promise<HarnessContext> {
    const entries: ContextEntry[] = [];

    // Rules: .cursor/rules/ (MDC files)
    const rulesDir = join(root, ".cursor", "rules");
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
          scope: "workspace",
          raw: content,
        });
      }
    }

    // Legacy: .cursorrules
    const legacyPath = join(root, ".cursorrules");
    const legacyContent = await readFileIfExists(legacyPath);
    if (legacyContent !== null) {
      entries.push({
        category: "instructions",
        name: ".cursorrules",
        canonical: {
          type: "instruction",
          body: legacyContent,
        } satisfies CanonicalInstruction,
        sourcePath: legacyPath,
        scope: "workspace",
        raw: legacyContent,
      });
    }

    return { harness: "cursor", root, entries };
  },
};
