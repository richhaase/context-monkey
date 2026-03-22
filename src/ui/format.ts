import chalk from "chalk";
import {
  CATEGORY_DISPLAY_NAMES,
  type ContextCategory,
  type ContextEntry,
  HARNESS_DISPLAY_NAMES,
  type HarnessContext,
  type HarnessId,
} from "../model/context.ts";

export function harnessLabel(id: HarnessId): string {
  return chalk.bold.cyan(HARNESS_DISPLAY_NAMES[id]);
}

export function categoryLabel(cat: ContextCategory): string {
  return chalk.yellow(CATEGORY_DISPLAY_NAMES[cat]);
}

export function entrySummary(entry: ContextEntry): string {
  const lines = entry.raw.split("\n").length;
  return chalk.dim(`(${lines} lines)`);
}

export function formatScanResult(ctx: HarnessContext): string {
  const lines: string[] = [];
  lines.push(`  ${harnessLabel(ctx.harness)}`);

  const categories: ContextCategory[] = [
    "instructions",
    "skills",
    "agents",
    "commands",
    "settings",
    "memory",
    "mcp",
    "ignore",
  ];

  for (const cat of categories) {
    const catEntries = ctx.entries.filter((e) => e.category === cat);
    if (catEntries.length === 0) {
      lines.push(`  ${chalk.dim("│")}  ${categoryLabel(cat)}  ${chalk.dim("—")}`);
      continue;
    }

    if (catEntries.length === 1) {
      const entry = catEntries[0]!;
      lines.push(
        `  ${chalk.dim("│")}  ${categoryLabel(cat)}  ${entry.name} ${entrySummary(entry)}`,
      );
    } else {
      lines.push(
        `  ${chalk.dim("│")}  ${categoryLabel(cat)}  ${chalk.white(`${catEntries.length} entries`)}`,
      );
      for (const entry of catEntries) {
        lines.push(`  ${chalk.dim("│")}    ${chalk.dim("·")} ${entry.name} ${entrySummary(entry)}`);
      }
    }
  }

  lines.push("");
  return lines.join("\n");
}

export function formatNotDetected(ids: HarnessId[]): string {
  if (ids.length === 0) return "";
  const names = ids.map((id) => HARNESS_DISPLAY_NAMES[id]).join(", ");
  return chalk.dim(`  Not detected: ${names}\n`);
}
