# Contributing

Thanks for your interest in improving Context Monkey! This guide explains how to set up your environment, follow the project conventions, and submit productive pull requests.

## Getting Started

1. Follow the environment instructions in `SETUP.md` (clone, `bun install`, `bun run build`).
2. Run the baseline checks once to confirm your workstation is ready:
   ```bash
   bun run build
   npm run snapshots:generate
   bun test
   npm run validate:resources
   bun run lint
   ```
3. Install `terminal-notifier` on macOS if you plan to exercise the optional notification hooks locally.

## Branching & Commits

- Create a feature branch off `main` (`git checkout -b feature/my-improvement`).
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`) so changelog entries stay accurate.
- Keep commits focused; small, reviewable changes are easier to test and revert if needed.

## Coding Standards

- **Language**: TypeScript with ES module syntax; avoid introducing CommonJS helpers.
- **Formatting**: Run `bun run format` before committing; Prettier/ESLint also execute via Husky on commit.
- **Linting**: `bun run lint` should pass cleanly; use `bun run lint:fix` for auto-fixes when available.
- **Tests**: Add or update tests in `tests/` to cover new behaviours; snapshot changes should be intentional and reviewed.
- **Type Safety**: Favour explicit interfaces and enums in `src/types/` when extending shared structures.

## Working on Templates & Agents

- Edit command templates under `resources/commands/*.md.hbs` and agent blueprints under `resources/agents/cm-*.md`.
- Follow the conventions in `docs/TEMPLATE_AUTHORING.md` for partials, YAML frontmatter, and Handlebars usage.
- After editing templates, rebuild and regenerate snapshots:
  ```bash
  bun run build
  npm run snapshots:generate
  ```
- Inspect diffs under `tests/snapshots/` to confirm cross-agent rendering looks correct.

## Testing Checklist (pre-PR)

- `bun run build`
- `bun test`
- `npm run validate:resources`
- `npm run snapshots:generate` (when prompts or agents change)
- `bun run lint` and `bun run format:check`
- Optional: execute `context-monkey install` against a sandbox to sanity-check interactive flows.

## Pull Request Guidelines

- Include a short summary of the change, highlight any user-facing impact, and call out new commands or hooks that need documentation updates.
- Link related issues and note any follow-up work explicitly.
- Ensure the PR description describes verification steps you performed.
- Keep generated `dist/` artifacts out of commits; only TypeScript sources, resources, and documentation should change.

## Reporting Issues & Requests

- File issues on GitHub with reproduction steps, expected behaviour, and environment details (OS, Node/Bun versions, assistant CLI versions).
- For prompt or documentation tweaks, attach the relevant command slug (`/cm:...`) and include before/after snippets if possible.

We appreciate every bug report, test, template improvement, and documentation fix—thanks for helping Context Monkey evolve.
