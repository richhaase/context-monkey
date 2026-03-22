import { resolve } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import { diffContexts } from "../diff/engine.ts";
import { renderDetailedDiff, renderDiffSummary } from "../diff/render.ts";
import { ALL_HARNESS_IDS, type HarnessId } from "../model/context.ts";
import { getScanner } from "../scanners/registry.ts";

export function registerDiff(program: Command): void {
  program
    .command("diff")
    .description("Compare two harness configurations")
    .argument("<source>", `source harness (${ALL_HARNESS_IDS.join(", ")})`)
    .argument("<target>", `target harness (${ALL_HARNESS_IDS.join(", ")})`)
    .option("-p, --path <path>", "directory to scan", ".")
    .option("-d, --detailed", "show line-level diffs")
    .action(
      async (sourceId: string, targetId: string, opts: { path: string; detailed?: boolean }) => {
        const root = resolve(opts.path);

        const srcScanner = getScanner(sourceId as HarnessId);
        const tgtScanner = getScanner(targetId as HarnessId);

        if (!srcScanner) {
          console.error(chalk.red(`  Unknown harness: ${sourceId}`));
          console.error(chalk.dim(`  Available: ${ALL_HARNESS_IDS.join(", ")}`));
          process.exit(1);
        }
        if (!tgtScanner) {
          console.error(chalk.red(`  Unknown harness: ${targetId}`));
          console.error(chalk.dim(`  Available: ${ALL_HARNESS_IDS.join(", ")}`));
          process.exit(1);
        }

        const [srcCtx, tgtCtx] = await Promise.all([srcScanner.scan(root), tgtScanner.scan(root)]);

        const result = diffContexts(srcCtx, tgtCtx);
        console.log(renderDiffSummary(result));

        if (opts.detailed) {
          for (const match of result.matches) {
            if (match.status === "different") {
              console.log(renderDetailedDiff(match));
            }
          }
        }
      },
    );
}
