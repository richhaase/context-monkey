# context-monkey

A CLI tool for making AI agent harness configurations portable.

## Structure

- `src/model/` — Core types (ContextEntry, HarnessContext)
- `src/scanners/` — One scanner per harness, reads configs into the universal model
- `src/writers/` — One writer per harness, converts universal model to native format
- `src/diff/` — Diff engine and terminal rendering
- `src/commands/` — CLI commands (scan, diff, sync)
- `src/ui/` — Shared formatting helpers
- `src/utils/` — File helpers, frontmatter parsing

## Development

```bash
bun install
bun run dev scan ~/src/some-repo    # test scan
bun run check                       # type check + lint + test
```

## Adding a new harness

1. Create `src/scanners/<harness>.ts` implementing the `Scanner` interface
2. Create `src/writers/<harness>.ts` implementing the `Writer` interface
3. Register both in their respective `registry.ts` files
4. Add the harness ID to `HarnessId` type in `src/model/context.ts`
