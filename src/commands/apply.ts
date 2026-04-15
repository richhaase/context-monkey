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
    .description("Apply the IR store to one or all target harnesses")
    .argument(
      "[targets...]",
      `target harness(es) (${ALL_HARNESS_IDS.join(", ")}), or "all" (default)`,
    )
    .option("-y, --yes", "skip confirmation")
    .option("--store <path>", "IR store path (default: ~/.config/context-monkey/context.json)")
    .option("--path <path>", "write project-scoped files under this workspace root")
    .option("--categories <cats>", "comma-separated categories to include (default: all)")
    .action(
      async (
        targetArgs: string[],
        opts: { yes?: boolean; store?: string; path?: string; categories?: string },
      ) => {
        const sp = storePath(opts.store);
        const bundle = await readStore(opts.store);
        const workspaceRoot = opts.path ? resolve(opts.path) : undefined;

        if (bundle.items.length === 0) {
          console.error(chalk.red("  Store is empty. Run 'cm scan' first."));
          console.error(chalk.dim(`  Store: ${sp}`));
          process.exit(1);
        }

        const targets: HarnessId[] =
          targetArgs.length === 0 || targetArgs.includes("all")
            ? [...ALL_HARNESS_IDS]
            : (targetArgs as HarnessId[]);

        // Validate targets
        for (const t of targets) {
          if (!getWriter(t)) {
            console.error(chalk.red(`  Unknown target harness: ${t}`));
            console.error(chalk.dim(`  Available: ${ALL_HARNESS_IDS.join(", ")}, all`));
            process.exit(1);
          }
        }

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

        const sources = bundle.sources.map((id) => HARNESS_DISPLAY_NAMES[id]).join(", ");

        console.log();
        console.log(chalk.bold("  Context Monkey — Apply"));
        console.log(chalk.dim(`  Store: ${sp} (${bundle.items.length} items from ${sources})`));
        if (workspaceRoot) {
          console.log(chalk.dim(`  Target workspace: ${workspaceRoot}`));
        }
        console.log();

        for (const targetHarness of targets) {
          const writer = getWriter(targetHarness)!;
          const tgtName = HARNESS_DISPLAY_NAMES[writer.id];

          // Skip the source harness — no point writing back to where it came from
          if (
            !workspaceRoot &&
            bundle.sources.length === 1 &&
            bundle.sources[0] === targetHarness
          ) {
            console.log(chalk.dim(`  ${tgtName}: skipped (source harness)`));
            continue;
          }

          const plan = await writer.plan(entries, workspaceRoot);
          const creates = plan.actions.filter((a) => a.type === "create");
          const updates = plan.actions.filter((a) => a.type === "update");
          const skips = plan.actions.filter((a) => a.type === "skip");

          if (creates.length === 0 && updates.length === 0) {
            console.log(chalk.dim(`  ${tgtName}: nothing to apply`));
            continue;
          }

          console.log(chalk.bold(`  ${chalk.cyan(tgtName)}:`));
          renderPlan(plan);

          if (!opts.yes) {
            process.stdout.write(chalk.bold("  Proceed? (y/N) "));
            const response = await readLine();
            if (response.trim().toLowerCase() !== "y") {
              console.log(chalk.dim("  Skipped."));
              console.log();
              continue;
            }
          }

          await writer.execute(plan);
          console.log(
            chalk.green(
              `  Done. ${creates.length} created, ${updates.length} updated, ${skips.length} skipped.`,
            ),
          );
          console.log();
        }
      },
    );
}

function renderPlan(plan: SyncPlan): void {
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
    process.stdin.once("data", (data: Buffer) => {
      resolve(data.toString());
    });
    process.stdin.resume();
  });
}
