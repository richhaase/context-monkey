import { describe, expect, test } from "bun:test";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.ts";

describe("frontmatter utilities", () => {
  test("parses quoted values and preserves the body", () => {
    const content = `---
name: "Skill Name"
description: 'Runs a task'
---
Body line 1
Body line 2
`;

    expect(parseFrontmatter(content)).toEqual({
      frontmatter: {
        name: "Skill Name",
        description: "Runs a task",
      },
      body: "Body line 1\nBody line 2\n",
    });
  });

  test("returns the full body when frontmatter is absent", () => {
    expect(parseFrontmatter("plain body")).toEqual({
      frontmatter: {},
      body: "plain body",
    });
  });

  test("serializes frontmatter with JSON-quoted values", () => {
    expect(
      serializeFrontmatter({ name: "Skill Name", description: "Runs a task" }, "Body"),
    ).toBe(`---
name: "Skill Name"
description: "Runs a task"
---
Body`);
  });
});
