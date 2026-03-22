import { resolve } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import {
  ALL_HARNESS_IDS,
  type CanonicalSetting,
  HARNESS_DISPLAY_NAMES,
  type HarnessContext,
  type HarnessId,
} from "../model/context.ts";
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

      // Show portable settings from all harnesses
      renderPortableSettings(contexts);
    });
}

/** Collect and display settings that exist across multiple harnesses. */
function renderPortableSettings(contexts: HarnessContext[]): void {
  // Gather all settings keyed by setting key → { harness, value }
  const settingsByKey = new Map<string, Array<{ harness: HarnessId; setting: CanonicalSetting }>>();

  for (const ctx of contexts) {
    for (const entry of ctx.entries) {
      if (entry.canonical.type !== "setting") continue;
      const s = entry.canonical;
      if (!settingsByKey.has(s.key)) settingsByKey.set(s.key, []);
      settingsByKey.get(s.key)!.push({ harness: ctx.harness, setting: s });
    }
  }

  if (settingsByKey.size === 0) return;

  console.log(chalk.bold("  Portable Settings:"));
  console.log();

  for (const [key, sources] of settingsByKey) {
    const first = sources[0]!;
    const valueStr =
      typeof first.setting.value === "string"
        ? first.setting.value
        : JSON.stringify(first.setting.value);
    const preview = valueStr.length > 60 ? `${valueStr.slice(0, 57)}...` : valueStr;

    const harnessNames = sources.map((s) => HARNESS_DISPLAY_NAMES[s.harness]).join(", ");
    console.log(
      `    ${chalk.white(first.setting.displayName || key)}  ${chalk.dim(`(${harnessNames})`)}`,
    );
    console.log(`    ${chalk.dim("value:")} ${preview}`);

    // Check if values differ across harnesses
    if (sources.length > 1) {
      const values = sources.map((s) => JSON.stringify(s.setting.value));
      const allSame = values.every((v) => v === values[0]);
      if (!allSame) {
        console.log(`    ${chalk.yellow("note:")} values differ across harnesses`);
      }
    }

    console.log();
  }
}
