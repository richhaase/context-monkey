import { resolve } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import { ALL_HARNESS_IDS, HARNESS_DISPLAY_NAMES, type HarnessId } from "../model/context.ts";
import { getScanner } from "../scanners/registry.ts";
import { getWriter } from "../writers/registry.ts";
import type { SyncPlan } from "../writers/writer.ts";

export function registerSync(program: Command): void {
  program
    .command("sync")
    .description("Sync context from one harness to another")
    .argument("<source>", `source harness (${ALL_HARNESS_IDS.join(", ")})`)
    .argument("<target>", `target harness (${ALL_HARNESS_IDS.join(", ")})`)
    .option("-p, --path <path>", "directory to scan", ".")
    .option("-y, --yes", "skip confirmation")
    .action(async (sourceId: string, targetId: string, opts: { path: string; yes?: boolean }) => {
      const root = resolve(opts.path);
      const srcScanner = getScanner(sourceId as HarnessId);
      const tgtWriter = getWriter(targetId as HarnessId);

      if (!srcScanner) {
        console.error(chalk.red(`  Unknown source harness: ${sourceId}`));
        console.error(chalk.dim(`  Available: ${ALL_HARNESS_IDS.join(", ")}`));
        process.exit(1);
      }
      if (!tgtWriter) {
        console.error(chalk.red(`  Unknown target harness: ${targetId}`));
        console.error(chalk.dim(`  Available: ${ALL_HARNESS_IDS.join(", ")}`));
        process.exit(1);
      }

      const srcName = HARNESS_DISPLAY_NAMES[srcScanner.id];
      const tgtName = HARNESS_DISPLAY_NAMES[tgtWriter.id];

      console.log();
      console.log(chalk.bold(`  Sync: ${chalk.cyan(srcName)} → ${chalk.cyan(tgtName)}`));
      console.log(chalk.dim(`  Source: ${root}`));
      console.log();

      const srcCtx = await srcScanner.scan(root);
      if (srcCtx.entries.length === 0) {
        console.log(chalk.yellow(`  No ${srcName} configuration found.`));
        return;
      }

      const plan = await tgtWriter.plan(srcCtx.entries, root);
      renderPlan(plan);

      const creates = plan.actions.filter((a) => a.type === "create");
      const updates = plan.actions.filter((a) => a.type === "update");
      const skips = plan.actions.filter((a) => a.type === "skip");

      if (creates.length === 0 && updates.length === 0) {
        console.log(chalk.yellow("  Nothing to sync — all entries were skipped."));
        console.log();
        return;
      }

      if (!opts.yes) {
        process.stdout.write(chalk.bold("  Proceed? (y/N) "));
        const response = await readLine();
        if (response.trim().toLowerCase() !== "y") {
          console.log(chalk.dim("  Aborted."));
          console.log();
          return;
        }
      }

      await tgtWriter.execute(plan, root);
      console.log();
      console.log(
        chalk.green(
          `  Done. ${creates.length} created, ${updates.length} updated, ${skips.length} skipped.`,
        ),
      );
      console.log();
    });
}

function renderPlan(plan: SyncPlan): void {
  console.log(chalk.bold("  Plan:"));

  for (const action of plan.actions) {
    switch (action.type) {
      case "create":
        console.log(
          `    ${chalk.green("CREATE")}  ${action.path}  ${chalk.dim(`← ${action.entry.name}`)}`,
        );
        break;
      case "update":
        console.log(
          `    ${chalk.yellow("UPDATE")}  ${action.path}  ${chalk.dim(`← ${action.entry.name}`)}`,
        );
        break;
      case "skip":
        console.log(
          `    ${chalk.dim("SKIP")}    ${action.entry.category}/${action.entry.name}  ${chalk.dim(`— ${action.reason}`)}`,
        );
        break;
    }
  }

  console.log();
}

async function readLine(): Promise<string> {
  const _buf = Buffer.alloc(256);
  const _fd = 0; // stdin
  return new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString());
    });
    process.stdin.resume();
  });
}
