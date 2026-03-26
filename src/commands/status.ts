import chalk from "chalk";
import type { Command } from "commander";
import type { ContextCategory, HarnessId } from "../model/context.ts";
import { CATEGORY_DISPLAY_NAMES, HARNESS_DISPLAY_NAMES } from "../model/context.ts";
import { readStore, storePath } from "../store/index.ts";

/**
 * Per-writer capability map: which context categories each writer actually handles
 * (i.e. produces create/update actions rather than skip actions).
 */
const WRITER_CAPABILITIES: Record<HarnessId, Set<ContextCategory>> = {
  "claude-code": new Set(["instructions", "skills", "agents", "commands", "memory"]),
  codex: new Set(["instructions", "agents", "memory"]),
  gemini: new Set(["instructions", "commands", "skills", "ignore", "memory"]),
  cursor: new Set(["instructions", "skills", "agents", "memory"]),
};

export function registerStatus(program: Command): void {
  program
    .command("status")
    .description("Show what is in the IR store and portability across harnesses")
    .option("--store <path>", "IR store path (default: ~/.config/context-monkey/context.json)")
    .action(async (opts: { store?: string }) => {
      const sp = storePath(opts.store);
      const bundle = await readStore(opts.store);

      console.log();
      console.log(chalk.bold("  Context Monkey — Store Status"));
      console.log(chalk.dim(`  Store: ${sp}`));
      console.log(chalk.dim(`  Last updated: ${bundle.updatedAt}`));

      if (bundle.sources.length > 0) {
        const sourceNames = bundle.sources.map((id) => HARNESS_DISPLAY_NAMES[id]).join(", ");
        console.log(chalk.dim(`  Sources: ${sourceNames}`));
      }

      if (bundle.items.length === 0) {
        console.log();
        console.log(chalk.yellow("  Store is empty. Run 'cm scan' first."));
        console.log();
        return;
      }

      // Count items by category
      const countsByCategory = new Map<ContextCategory, number>();
      for (const item of bundle.items) {
        countsByCategory.set(item.category, (countsByCategory.get(item.category) || 0) + 1);
      }

      console.log();
      console.log(chalk.bold("  Items by category:"));
      for (const [cat, count] of countsByCategory) {
        const label = CATEGORY_DISPLAY_NAMES[cat];
        console.log(`    ${label.padEnd(16)}${count}`);
      }

      // Portability matrix
      const harnesses: HarnessId[] = ["claude-code", "codex", "gemini", "cursor"];
      const categories = [...countsByCategory.keys()];

      // Compute column widths
      const colWidths = harnesses.map((id) => Math.max(HARNESS_DISPLAY_NAMES[id].length, 2));
      const labelWidth = Math.max(...categories.map((c) => CATEGORY_DISPLAY_NAMES[c].length), 16);

      console.log();
      console.log(chalk.bold("  Portability matrix:"));

      // Header row
      let header = `    ${"".padEnd(labelWidth)}`;
      for (let i = 0; i < harnesses.length; i++) {
        header += `  ${HARNESS_DISPLAY_NAMES[harnesses[i]!].padEnd(colWidths[i]!)}`;
      }
      console.log(chalk.dim(header));

      // Data rows
      for (const cat of categories) {
        const label = CATEGORY_DISPLAY_NAMES[cat].padEnd(labelWidth);
        let row = `    ${label}`;
        for (let i = 0; i < harnesses.length; i++) {
          const supported = WRITER_CAPABILITIES[harnesses[i]!].has(cat);
          const symbol = supported ? chalk.green("\u2713") : chalk.dim("\u2717");
          const colW = colWidths[i]!;
          // The symbol is 1 visible char but may be more bytes; pad manually
          row += `  ${symbol}${"".padEnd(colW - 1)}`;
        }
        console.log(row);
      }

      console.log();
    });
}
