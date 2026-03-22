import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { BundleItem, ContextBundle } from "../model/bundle.ts";
import type { HarnessContext, HarnessId } from "../model/context.ts";
import { exists } from "../utils/fs.ts";

const DEFAULT_STORE = resolve(
  process.env.CM_STORE || `${process.env.HOME}/.config/context-monkey/context.json`,
);

/** Resolve the store path — env var, flag, or default. */
export function storePath(override?: string): string {
  return override ? resolve(override) : DEFAULT_STORE;
}

/** Read the current store. Returns empty bundle if it doesn't exist. */
export async function readStore(path?: string): Promise<ContextBundle> {
  const p = storePath(path);
  try {
    const raw = await Bun.file(p).text();
    return JSON.parse(raw);
  } catch {
    return { version: 1, updatedAt: new Date().toISOString(), root: "", sources: [], items: [] };
  }
}

/** Write the store to disk. */
export async function writeStore(bundle: ContextBundle, path?: string): Promise<string> {
  const p = storePath(path);
  const dir = dirname(p);
  if (!(await exists(dir))) {
    await mkdir(dir, { recursive: true });
  }
  await Bun.write(p, JSON.stringify(bundle, null, 2));
  return p;
}

/**
 * Merge scan results into an existing store.
 * Items from the same harness+category+name get replaced.
 * Items from harnesses not in this scan are preserved.
 */
export function mergeIntoStore(store: ContextBundle, contexts: HarnessContext[]): ContextBundle {
  const scannedHarnesses = new Set(contexts.map((c) => c.harness));

  // Keep items from harnesses we didn't just scan
  const kept = store.items.filter((item) => !scannedHarnesses.has(item.sourceHarness));

  // Add fresh items from scan
  const fresh: BundleItem[] = [];
  for (const ctx of contexts) {
    for (const entry of ctx.entries) {
      fresh.push({
        category: entry.category,
        name: entry.name,
        canonical: entry.canonical,
        sourceHarness: ctx.harness,
        scope: entry.scope,
      });
    }
  }

  // Use root from the first context (all contexts share the same root in a scan)
  const root = contexts[0]?.root || store.root;

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    root,
    sources: [...new Set([...store.sources, ...scannedHarnesses])].filter(
      // Remove sources that were scanned but produced 0 items
      (id) =>
        !scannedHarnesses.has(id) || contexts.some((c) => c.harness === id && c.entries.length > 0),
    ) as HarnessId[],
    items: [...kept, ...fresh],
  };
}
