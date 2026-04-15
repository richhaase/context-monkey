import { describe, expect, test } from "bun:test";
import type { ContextBundle } from "../model/bundle.ts";
import type { HarnessContext } from "../model/context.ts";
import { mergeIntoStore } from "./index.ts";

describe("mergeIntoStore", () => {
  test("replaces items for scanned harnesses and preserves unscanned ones", () => {
    const store: ContextBundle = {
      version: 1,
      updatedAt: "2026-01-01T00:00:00.000Z",
      sources: ["codex", "cursor"],
      items: [
        {
          category: "instructions",
          name: "AGENTS",
          canonical: { type: "instruction", body: "old codex" },
          sourceHarness: "codex",
          scope: "workspace",
        },
        {
          category: "settings",
          name: "rules",
          canonical: { type: "setting", key: "cursor.rules", displayName: "Rules", value: true },
          sourceHarness: "cursor",
          scope: "workspace",
        },
      ],
    };

    const contexts: HarnessContext[] = [
      {
        harness: "codex",
        entries: [
          {
            category: "instructions",
            name: "AGENTS",
            canonical: { type: "instruction", body: "new codex" },
            sourcePath: "AGENTS.md",
            scope: "workspace",
            raw: "new codex",
          },
          {
            category: "memory",
            name: "project",
            canonical: {
              type: "memory",
              kind: "project",
              name: "Project",
              summary: "Project summary",
              content: "Project details",
              priority: 2,
            },
            sourcePath: ".codex/MEMORY.md",
            scope: "workspace",
            raw: "Project details",
          },
        ],
      },
    ];

    const merged = mergeIntoStore(store, contexts);

    expect(merged.version).toBe(1);
    expect(merged.updatedAt).not.toBe(store.updatedAt);
    expect(merged.sources).toEqual(["codex", "cursor"]);
    expect(merged.items).toHaveLength(3);
    expect(merged.items.filter((item) => item.sourceHarness === "codex")).toEqual([
      {
        category: "instructions",
        name: "AGENTS",
        canonical: { type: "instruction", body: "new codex" },
        sourceHarness: "codex",
        scope: "workspace",
      },
      {
        category: "memory",
        name: "project",
        canonical: {
          type: "memory",
          kind: "project",
          name: "Project",
          summary: "Project summary",
          content: "Project details",
          priority: 2,
        },
        sourceHarness: "codex",
        scope: "workspace",
      },
    ]);
    expect(merged.items.find((item) => item.sourceHarness === "cursor")).toEqual(store.items[1]);
  });

  test("drops scanned harnesses from sources when they produce no items", () => {
    const store: ContextBundle = {
      version: 1,
      updatedAt: "2026-01-01T00:00:00.000Z",
      sources: ["codex", "gemini"],
      items: [
        {
          category: "instructions",
          name: "AGENTS",
          canonical: { type: "instruction", body: "codex" },
          sourceHarness: "codex",
          scope: "workspace",
        },
      ],
    };

    const merged = mergeIntoStore(store, [{ harness: "codex", entries: [] }]);

    expect(merged.sources).toEqual(["gemini"]);
    expect(merged.items).toEqual([]);
  });
});
