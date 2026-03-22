import chalk from "chalk";
import { CATEGORY_DISPLAY_NAMES, HARNESS_DISPLAY_NAMES } from "../model/context.ts";
import type { DiffResult, EntryMatch } from "./engine.ts";
import { lineDiff } from "./engine.ts";

function statusIcon(status: EntryMatch["status"]): string {
  switch (status) {
    case "same":
      return chalk.green("✓");
    case "different":
      return chalk.yellow("≠");
    case "source-only":
      return chalk.red("←");
    case "target-only":
      return chalk.blue("→");
  }
}

function statusLabel(status: EntryMatch["status"]): string {
  switch (status) {
    case "same":
      return chalk.green("identical");
    case "different":
      return chalk.yellow("different");
    case "source-only":
      return chalk.red("only in source");
    case "target-only":
      return chalk.blue("only in target");
  }
}

export function renderDiffSummary(result: DiffResult): string {
  const lines: string[] = [];
  const src = HARNESS_DISPLAY_NAMES[result.sourceHarness.harness];
  const tgt = HARNESS_DISPLAY_NAMES[result.targetHarness.harness];

  lines.push("");
  lines.push(chalk.bold(`  Comparing ${chalk.cyan(src)} ↔ ${chalk.cyan(tgt)}`));
  lines.push("");

  // Header
  const catWidth = 16;
  const nameWidth = 30;
  lines.push(
    `  ${chalk.dim("Category".padEnd(catWidth))}${chalk.dim("Entry".padEnd(nameWidth))}${chalk.dim("Status")}`,
  );
  lines.push(chalk.dim(`  ${"─".repeat(catWidth + nameWidth + 20)}`));

  for (const match of result.matches) {
    const cat = CATEGORY_DISPLAY_NAMES[match.category].padEnd(catWidth);
    const name = match.name.slice(0, nameWidth - 1).padEnd(nameWidth);
    lines.push(`  ${cat}${name}${statusIcon(match.status)} ${statusLabel(match.status)}`);
  }

  // Summary counts
  const same = result.matches.filter((m) => m.status === "same").length;
  const different = result.matches.filter((m) => m.status === "different").length;
  const sourceOnly = result.matches.filter((m) => m.status === "source-only").length;
  const targetOnly = result.matches.filter((m) => m.status === "target-only").length;

  lines.push("");
  lines.push(
    chalk.dim(
      `  ${same} identical, ${different} different, ${sourceOnly} source-only, ${targetOnly} target-only`,
    ),
  );
  lines.push("");

  return lines.join("\n");
}

export function renderDetailedDiff(match: EntryMatch): string {
  if (match.status === "same") return chalk.dim("  (identical)");
  if (!match.source || !match.target) return chalk.dim("  (no counterpart to diff)");

  const { added, removed, unchanged } = lineDiff(match.source.content, match.target.content);
  const lines: string[] = [];

  lines.push(`  ${chalk.bold(match.name)}`);
  lines.push(
    chalk.dim(`  ${unchanged} unchanged, ${removed.length} removed, ${added.length} added`),
  );
  lines.push("");

  for (const line of removed.slice(0, 20)) {
    lines.push(chalk.red(`  - ${line}`));
  }
  if (removed.length > 20) {
    lines.push(chalk.dim(`  ... and ${removed.length - 20} more removals`));
  }

  for (const line of added.slice(0, 20)) {
    lines.push(chalk.green(`  + ${line}`));
  }
  if (added.length > 20) {
    lines.push(chalk.dim(`  ... and ${added.length - 20} more additions`));
  }

  lines.push("");
  return lines.join("\n");
}
