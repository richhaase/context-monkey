import type { ContextCategory, ContextEntry, HarnessContext } from "../model/context.ts";

export interface EntryMatch {
  category: ContextCategory;
  name: string;
  source: ContextEntry | null;
  target: ContextEntry | null;
  status: "same" | "different" | "source-only" | "target-only";
}

export interface DiffResult {
  sourceHarness: HarnessContext;
  targetHarness: HarnessContext;
  matches: EntryMatch[];
}

function entryKey(entry: ContextEntry): string {
  return `${entry.category}:${entry.name}`;
}

export function diffContexts(source: HarnessContext, target: HarnessContext): DiffResult {
  const matches: EntryMatch[] = [];
  const targetMap = new Map<string, ContextEntry>();
  const matchedTargetKeys = new Set<string>();

  for (const entry of target.entries) {
    targetMap.set(entryKey(entry), entry);
  }

  // Match by exact (category, name)
  for (const srcEntry of source.entries) {
    const key = entryKey(srcEntry);
    const tgtEntry = targetMap.get(key) ?? null;

    if (tgtEntry) {
      matchedTargetKeys.add(key);
      const same = srcEntry.raw.trim() === tgtEntry.raw.trim();
      matches.push({
        category: srcEntry.category,
        name: srcEntry.name,
        source: srcEntry,
        target: tgtEntry,
        status: same ? "same" : "different",
      });
    } else {
      // Try matching by category alone when there's only one entry per category per side
      const sameCatTarget = target.entries.filter(
        (e) => e.category === srcEntry.category && !matchedTargetKeys.has(entryKey(e)),
      );
      if (sameCatTarget.length === 1) {
        const tgt = sameCatTarget[0]!;
        matchedTargetKeys.add(entryKey(tgt));
        const same = srcEntry.raw.trim() === tgt.raw.trim();
        matches.push({
          category: srcEntry.category,
          name: `${srcEntry.name} ↔ ${tgt.name}`,
          source: srcEntry,
          target: tgt,
          status: same ? "same" : "different",
        });
      } else {
        matches.push({
          category: srcEntry.category,
          name: srcEntry.name,
          source: srcEntry,
          target: null,
          status: "source-only",
        });
      }
    }
  }

  // Remaining target entries not matched
  for (const tgtEntry of target.entries) {
    if (!matchedTargetKeys.has(entryKey(tgtEntry))) {
      matches.push({
        category: tgtEntry.category,
        name: tgtEntry.name,
        source: null,
        target: tgtEntry,
        status: "target-only",
      });
    }
  }

  return { sourceHarness: source, targetHarness: target, matches };
}

export function lineDiff(
  a: string,
  b: string,
): { added: string[]; removed: string[]; unchanged: number } {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const aSet = new Set(aLines);
  const bSet = new Set(bLines);

  const added = bLines.filter((l) => !aSet.has(l));
  const removed = aLines.filter((l) => !bSet.has(l));
  const unchanged = aLines.filter((l) => bSet.has(l)).length;

  return { added, removed, unchanged };
}
