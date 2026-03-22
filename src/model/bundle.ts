import type { CanonicalItem, ContextCategory, HarnessId } from "./context.ts";

/**
 * A portable context bundle — the distributable IR.
 * Store this in dotfiles, version control, or anywhere.
 * Run `cm apply <bundle> <harness>` to generate native config.
 */
export interface ContextBundle {
  /** Schema version for forward compat */
  version: 1;
  /** When this bundle was created */
  exportedAt: string;
  /** Source harnesses that contributed to this bundle */
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
