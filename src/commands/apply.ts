import { resolve } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import {
  ALL_HARNESS_IDS,
  type ContextEntry,
  HARNESS_DISPLAY_NAMES,
  type HarnessId,
} from "../model/context.ts";
import { readStore, storePath } from "../store/index.ts";
import { getWriter } from "../writers/registry.ts";
import type { SyncPlan } from "../writers/writer.ts";

export function registerApply(program: Command): void {
  program
    .command("apply")
    .description("Apply the IR store to a target harness")
    .argument("<target>", `target harness (${ALL_HARNESS_IDS.join(", ")})`)
    .option("-p, --path <path>", "target directory", ".")
    .option("-y, --yes", "skip confirmation")
    .option("--store <path>", "IR store path (default: ~/.config/context-monkey/context.json)")
    .option("--categories <cats>", "comma-separated categories to include (default: all)")
    .action(
      async (
        targetId: string,
        opts: { path: string; yes?: boolean; store?: string; categories?: string },
      ) => {
        const root = resolve(opts.path);
        const writer = getWriter(targetId as HarnessId);

        if (!writer) {
          console.error(chalk.red(`  Unknown target harness: ${targetId}`));
          console.error(chalk.dim(`  Available: ${ALL_HARNESS_IDS.join(", ")}`));
          process.exit(1);
        }

        const sp = storePath(opts.store);
        const bundle = await readStore(opts.store);

        if (bundle.items.length === 0) {
          console.error(chalk.red("  Store is empty. Run 'cm scan' first."));
          console.error(chalk.dim(`  Store: ${sp}`));
          process.exit(1);
        }

        const tgtName = HARNESS_DISPLAY_NAMES[writer.id];
        const sources = bundle.sources.map((id) => HARNESS_DISPLAY_NAMES[id]).join(", ");

        console.log();
        console.log(chalk.bold(`  Apply: ${chalk.cyan(sources)} → ${chalk.cyan(tgtName)}`));
        console.log(chalk.dim(`  Store: ${sp} (${bundle.items.length} items)`));
        console.log(chalk.dim(`  Target: ${root}`));
        console.log();

        // Filter by categories if specified
        const catFilter = opts.categories
          ? new Set(opts.categories.split(",").map((c) => c.trim()))
          : null;

        const entries: ContextEntry[] = bundle.items
          .filter((item) => !catFilter || catFilter.has(item.category))
          .map((item) => ({
            category: item.category,
            name: item.name,
            canonical: item.canonical,
            sourcePath: `store:${item.sourceHarness}/${item.name}`,
            scope: item.scope,
            raw: "",
          }));

        if (entries.length === 0) {
          console.log(chalk.yellow("  No items match the filter. Nothing to apply."));
          console.log();
          return;
        }

        const plan = await writer.plan(entries, root);
        renderPlan(plan);

        const creates = plan.actions.filter((a) => a.type === "create");
        const updates = plan.actions.filter((a) => a.type === "update");
        const skips = plan.actions.filter((a) => a.type === "skip");

        if (creates.length === 0 && updates.length === 0) {
          console.log(chalk.yellow("  Nothing to apply — all entries were skipped."));
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

        await writer.execute(plan, root);
        console.log();
        console.log(
          chalk.green(
            `  Done. ${creates.length} created, ${updates.length} updated, ${skips.length} skipped.`,
          ),
        );
        console.log();
      },
    );
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
  return new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString());
    });
    process.stdin.resume();
  });
}
