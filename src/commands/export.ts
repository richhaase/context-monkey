import { resolve } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { BundleItem, ContextBundle } from "../model/bundle.ts";
import { CATEGORY_DISPLAY_NAMES, HARNESS_DISPLAY_NAMES } from "../model/context.ts";
import { scanAll } from "../scanners/registry.ts";

export function registerExport(program: Command): void {
  program
    .command("export")
    .description("Export portable IR bundle from all detected harnesses")
    .argument("[path]", "directory to scan", ".")
    .option("-o, --output <file>", "output file", "cm-context.json")
    .action(async (path: string, opts: { output: string }) => {
      const root = resolve(path);
      const outputPath = resolve(opts.output);

      console.log();
      console.log(chalk.bold("  Context Monkey — Export"));
      console.log(chalk.dim(`  Scanning ${root}...`));
      console.log();

      const contexts = await scanAll(root);

      if (contexts.length === 0) {
        console.log(chalk.yellow("  No harnesses detected. Nothing to export."));
        console.log();
        return;
      }

      const items: BundleItem[] = [];

      for (const ctx of contexts) {
        for (const entry of ctx.entries) {
          items.push({
            category: entry.category,
            name: entry.name,
            canonical: entry.canonical,
            sourceHarness: ctx.harness,
            scope: entry.scope,
          });
        }
      }

      const bundle: ContextBundle = {
        version: 1,
        exportedAt: new Date().toISOString(),
        sources: [...new Set(contexts.map((c) => c.harness))],
        items,
      };

      await Bun.write(outputPath, JSON.stringify(bundle, null, 2));

      // Summary
      const sources = bundle.sources.map((id) => HARNESS_DISPLAY_NAMES[id]).join(", ");
      console.log(chalk.bold(`  Exported ${items.length} items from ${sources}`));

      // Category breakdown
      const byCat = new Map<string, number>();
      for (const item of items) {
        byCat.set(item.category, (byCat.get(item.category) ?? 0) + 1);
      }
      for (const [cat, count] of byCat) {
        console.log(
          `    ${CATEGORY_DISPLAY_NAMES[cat as keyof typeof CATEGORY_DISPLAY_NAMES] ?? cat}: ${count}`,
        );
      }

      console.log();
      console.log(chalk.green(`  Written to ${outputPath}`));
      console.log(chalk.dim("  Add this file to your dotfiles, then: cm apply <file> <harness>"));
      console.log();
    });
}
