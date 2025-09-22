# Template Authoring Guide

Context Monkey commands are defined as Handlebars templates under `resources/commands/*.md.hbs` and rendered into agent-specific formats. This guide captures the conventions and troubleshooting steps for writing and maintaining those templates.

## Command Basics

- **Frontmatter**: Every command must declare at least `description`. Additional keys (e.g. `argument-hint`, `allowed-tools`) are optional but encouraged.
- **Body**: Write content in Markdown using the shared partials when you need agent-aware behaviour.
- **Insertions**: Use `{{> insert.delegateTo ...}}`, `{{> insert.useWorkspaceTools}}`, and `{{> insert.referenceProjectDocs}}` to keep wording consistent across agents.
- **Agent References**: Mention subagents with the `cm-` prefix; the renderer automatically inlines the matching blueprint when available.

## Rendering Targets

| Target      | Output   | Notes                                                                                          |
| ----------- | -------- | ---------------------------------------------------------------------------------------------- |
| Claude Code | Markdown | Rendered verbatim from Handlebars output.                                                      |
| Codex CLI   | Markdown | Content is transformed for Codex language and slugs are generated automatically.               |
| Gemini CLI  | TOML     | Prompt text is embedded in a multiline string and backslashes/`"""` are escaped automatically. |

## Writing Handlebars Safely

- Stick to standard `{{ > partial }}` syntax—triple braces around partial calls are invalid.
- Handlebars expressions are evaluated before downstream Markdown/TOML transforms: avoid introducing `{{` and `}}` in literal text unless you escape them (`\{{` `\}}`).
- When you need literal backslashes (e.g. regex examples), write them normally; the renderer escapes them for Gemini TOML.

## Snapshot Testing

The rendering pipeline is covered by golden snapshots located in `tests/snapshots`. After changing templates run:

```bash
bun run build
npm run snapshots:generate
bun test
```

Commit the updated snapshot files with your change. The snapshot tests ensure that each command renders identically across agents unless you explicitly intend a change.

## Troubleshooting

| Symptom                                  | Fix                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `Unknown escape character` in Gemini CLI | Ensure backslashes are needed; the renderer escapes them, but stray `\` without context often indicate typos. |
| Missing blueprint section                | Check `resources/agents/cm-*.md` exists and that the command references the correct slug (`cm-something`).    |
| Codex prompts missing                    | Run `node dist/bin/context-monkey.js install codex` and confirm snapshots contain the desired slug.           |
| Snapshot mismatch                        | Re-run `npm run snapshots:generate` after building. Review diffs carefully to confirm intentional changes.    |

## Adding a New Command

1. Create `resources/commands/new-command.md.hbs` with frontmatter and body.
2. Reference shared partials for agent-specific behaviour where possible.
3. Run `bun run build && npm run snapshots:generate` and inspect the outputs.
4. Update documentation (README, etc.) and run the installers locally for sanity.
5. Commit template + snapshots together.

With these guidelines the command templates stay consistent, render deterministically, and remain easy to extend across agents.
