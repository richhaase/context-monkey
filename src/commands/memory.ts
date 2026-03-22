import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import { extractKnowledge } from "../memory/extractor.ts";
import type { TranslatedMemory } from "../memory/translator.ts";
import { translateMemory } from "../memory/translator.ts";
import { ALL_HARNESS_IDS, HARNESS_DISPLAY_NAMES, type HarnessId } from "../model/context.ts";
import { getScanner } from "../scanners/registry.ts";
import { exists } from "../utils/fs.ts";

export function registerMemory(program: Command): void {
  program
    .command("memory")
    .description("Export memory from one harness to another")
    .argument("<source>", `source harness (${ALL_HARNESS_IDS.join(", ")})`)
    .argument("<target>", `target harness (${ALL_HARNESS_IDS.join(", ")})`)
    .option("-p, --path <path>", "directory to scan", ".")
    .option("-y, --yes", "skip confirmation")
    .option("--preview", "show translated output without writing")
    .action(
      async (
        sourceId: string,
        targetId: string,
        opts: { path: string; yes?: boolean; preview?: boolean },
      ) => {
        const root = resolve(opts.path);
        const srcScanner = getScanner(sourceId as HarnessId);

        if (!srcScanner) {
          console.error(chalk.red(`  Unknown source harness: ${sourceId}`));
          process.exit(1);
        }
        if (!ALL_HARNESS_IDS.includes(targetId as HarnessId)) {
          console.error(chalk.red(`  Unknown target harness: ${targetId}`));
          process.exit(1);
        }

        const srcName = HARNESS_DISPLAY_NAMES[srcScanner.id];
        const tgtName = HARNESS_DISPLAY_NAMES[targetId as HarnessId];

        console.log();
        console.log(chalk.bold(`  Memory: ${chalk.cyan(srcName)} → ${chalk.cyan(tgtName)}`));
        console.log(chalk.dim(`  Source: ${root}`));
        console.log();

        // Scan source
        const srcCtx = await srcScanner.scan(root);
        const memoryEntries = srcCtx.entries.filter((e) => e.category === "memory");

        if (memoryEntries.length === 0) {
          console.log(chalk.yellow(`  No memory found in ${srcName} configuration.`));
          console.log();
          return;
        }

        // Extract knowledge
        const units = extractKnowledge(memoryEntries);
        console.log(chalk.bold(`  Extracted ${units.length} knowledge units:`));

        const p1 = units.filter((u) => u.priority === 1).length;
        const p2 = units.filter((u) => u.priority === 2).length;
        const p3 = units.filter((u) => u.priority === 3).length;
        console.log(
          `    ${chalk.red(`${p1} critical`)}  ${chalk.yellow(`${p2} important`)}  ${chalk.dim(`${p3} contextual`)}`,
        );
        console.log();

        // Show knowledge summary
        for (const unit of units) {
          const icon =
            unit.priority === 1
              ? chalk.red("●")
              : unit.priority === 2
                ? chalk.yellow("●")
                : chalk.dim("○");
          console.log(`    ${icon} ${chalk.white(unit.name)} ${chalk.dim(`(${unit.kind})`)}`);
          console.log(`      ${chalk.dim(unit.summary)}`);
        }
        console.log();

        // Translate
        const translated = translateMemory(units, targetId as HarnessId, root);

        if (opts.preview) {
          renderPreview(translated);
          return;
        }

        renderPlan(translated);

        if (!opts.yes) {
          process.stdout.write(chalk.bold("  Write these files? (y/N) "));
          const response = await readLine();
          if (response.trim().toLowerCase() !== "y") {
            console.log(chalk.dim("  Aborted."));
            console.log();
            return;
          }
        }

        // Execute
        let written = 0;
        for (const doc of translated) {
          const dir = dirname(doc.targetPath);
          if (!(await exists(dir))) {
            await mkdir(dir, { recursive: true });
          }

          if (doc.mode === "append") {
            const existing = await readExisting(doc.targetPath);
            await Bun.write(
              doc.targetPath,
              existing ? `${existing}\n\n${doc.content}` : doc.content,
            );
          } else {
            await Bun.write(doc.targetPath, doc.content);
          }
          written++;
        }

        console.log();
        console.log(chalk.green(`  Done. ${written} file${written !== 1 ? "s" : ""} written.`));
        console.log();
      },
    );
}

function renderPlan(docs: TranslatedMemory[]): void {
  console.log(chalk.bold("  Plan:"));
  for (const doc of docs) {
    const modeLabel =
      doc.mode === "append"
        ? chalk.yellow("APPEND")
        : doc.mode === "replace"
          ? chalk.green("CREATE")
          : chalk.blue("SECTION");
    console.log(`    ${modeLabel}  ${doc.targetPath}`);
    console.log(`           ${chalk.dim(doc.description)}`);
  }
  console.log();
}

function renderPreview(docs: TranslatedMemory[]): void {
  for (const doc of docs) {
    console.log(chalk.bold(`  ── ${doc.targetPath} ──`));
    console.log(chalk.dim(`  (${doc.mode}) ${doc.description}`));
    console.log();

    // Show first 40 lines of content
    const lines = doc.content.split("\n");
    const shown = lines.slice(0, 40);
    for (const line of shown) {
      console.log(`  ${line}`);
    }
    if (lines.length > 40) {
      console.log(chalk.dim(`  ... (${lines.length - 40} more lines)`));
    }
    console.log();
  }
}

async function readExisting(path: string): Promise<string | null> {
  try {
    return await Bun.file(path).text();
  } catch {
    return null;
  }
}

async function readLine(): Promise<string> {
  return new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString());
    });
    process.stdin.resume();
  });
}
