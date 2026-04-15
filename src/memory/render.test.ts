import { describe, expect, test } from "bun:test";
import type { CanonicalMemory } from "../model/context.ts";
import { groupBy, kindDisplayName, renderContextSection, renderFullMemoryDoc } from "./render.ts";

const units: CanonicalMemory[] = [
  {
    type: "memory",
    kind: "preference",
    name: "Tone",
    summary: "Prefers direct answers",
    content: "Keep responses direct.",
    priority: 2,
  },
  {
    type: "memory",
    kind: "project",
    name: "Architecture",
    summary: "Key system notes",
    content: ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5", "Line 6"].join("\n"),
    priority: 1,
  },
];

describe("memory rendering", () => {
  test("groups items by key", () => {
    expect(groupBy(units, (unit) => unit.kind)).toEqual({
      preference: [units[0]!],
      project: [units[1]!],
    });
  });

  test("maps kinds to display names", () => {
    expect(kindDisplayName("system-info")).toBe("System & Environment");
  });

  test("renders short and long memory content appropriately", () => {
    const rendered = renderContextSection(units, "Imported Context", [
      "Generated from another tool",
    ]);

    expect(rendered).toContain("## Imported Context");
    expect(rendered).toContain("> Generated from another tool");
    expect(rendered).toContain("### Preferences");
    expect(rendered).toContain("**Tone**: Keep responses direct.");
    expect(rendered).toContain("### Project Context");
    expect(rendered).toContain("**Architecture** — Key system notes");
    expect(rendered).toContain("Line 6");
  });

  test("renders a full memory document", () => {
    const rendered = renderFullMemoryDoc(units);

    expect(rendered).toContain("# Memory");
    expect(rendered).toContain("## Preferences");
    expect(rendered).toContain("### Tone");
    expect(rendered).toContain("> Prefers direct answers");
    expect(rendered).toContain("## Project Context");
    expect(rendered).toContain("### Architecture");
  });
});
