import { resolve } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import { ALL_HARNESS_IDS, HARNESS_DISPLAY_NAMES, type HarnessContext } from "../model/context.ts";
import { scanAll } from "../scanners/registry.ts";
import { evaluateSettings, type PortableSetting } from "../settings/evaluator.ts";
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

      // Evaluate portable settings across detected harnesses
      renderPortableSettings(contexts);
    });
}

function renderPortableSettings(contexts: HarnessContext[]): void {
  const allSettings: PortableSetting[] = [];

  for (const ctx of contexts) {
    const settingsEntries = ctx.entries.filter((e) => e.category === "settings");
    if (settingsEntries.length === 0) continue;
    const found = evaluateSettings(settingsEntries, ctx.harness);
    allSettings.push(...found);
  }

  if (allSettings.length === 0) return;

  // Deduplicate by key (keep first occurrence)
  const seen = new Set<string>();
  const unique = allSettings.filter((s) => {
    if (seen.has(s.key)) return false;
    seen.add(s.key);
    return true;
  });

  console.log(chalk.bold("  Portable Settings:"));
  console.log();

  for (const setting of unique) {
    const sourceName = HARNESS_DISPLAY_NAMES[setting.sourceHarness];
    const preview = setting.value.length > 60 ? `${setting.value.slice(0, 57)}...` : setting.value;
    console.log(`    ${chalk.white(setting.displayName)}  ${chalk.dim(`(from ${sourceName})`)}`);
    console.log(`    ${chalk.dim("value:")} ${preview}`);

    const targets = Object.entries(setting.equivalents);
    if (targets.length > 0) {
      const targetNames = targets
        .map(([id]) => HARNESS_DISPLAY_NAMES[id as keyof typeof HARNESS_DISPLAY_NAMES])
        .join(", ");
      console.log(`    ${chalk.dim("portable to:")} ${targetNames}`);
    }

    const notesEntries = targets.filter(([, eq]) => eq.notes);
    for (const [, eq] of notesEntries) {
      console.log(`    ${chalk.yellow("note:")} ${eq.notes}`);
    }

    console.log();
  }
}
