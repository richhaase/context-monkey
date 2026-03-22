import type { CanonicalItem, ContextCategory, HarnessId } from "./context.ts";

/**
 * The persistent IR store — canonical context from all scanned harnesses.
 * Lives on disk, updated by `cm scan`, consumed by `cm apply`.
 * Store it in dotfiles for portability across machines.
 */
export interface ContextBundle {
  /** Schema version for forward compat */
  version: 1;
  /** Last time this store was updated */
  updatedAt: string;
  /** Root directory that was last scanned */
  root: string;
  /** Harnesses that have contributed to this store */
  sources: HarnessId[];
  /** The canonical items */
  items: BundleItem[];
}

export interface BundleItem {
  category: ContextCategory;
  /** Display name */
  name: string;
  /** The canonical IR — this is what writers consume */
  canonical: CanonicalItem;
  /** Which harness this was scanned from */
  sourceHarness: HarnessId;
  /** Original scope */
  scope: "global" | "workspace" | "subdirectory";
}
