import { resolve } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import { ALL_HARNESS_IDS } from "../model/context.ts";
import { scanAll } from "../scanners/registry.ts";
import { formatNotDetected, formatScanResult } from "../ui/format.ts";

export function registerScan(program: Command): void {
  program
    .command("scan")
    .description("Scan for configured AI agent harnesses")
    .argument("[path]", "directory to scan", ".")
    .action(async (path: string) => {
      const root = resolve(path);
      console.log();
      console.log(chalk.bold("  Context Monkey"));
      console.log(chalk.dim(`  Scanning ${root}...`));
      console.log();

      const contexts = await scanAll(root);

      if (contexts.length === 0) {
        console.log(chalk.yellow("  No harnesses detected."));
        console.log(
          chalk.dim("  Looked for: Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot"),
        );
        console.log();
        return;
      }

      console.log(
        chalk.bold(`  Found ${contexts.length} harness${contexts.length > 1 ? "es" : ""}:`),
      );
      console.log();

      for (const ctx of contexts) {
        console.log(formatScanResult(ctx));
      }

      const detectedIds = contexts.map((c) => c.harness);
      const missingIds = ALL_HARNESS_IDS.filter((id) => !detectedIds.includes(id));
      console.log(formatNotDetected(root, missingIds));
    });
}
