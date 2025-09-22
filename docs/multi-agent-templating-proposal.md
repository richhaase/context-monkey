# Multi‑Agent Templating Plan (Handlebars)

A focused plan to ensure Context Monkey behaves consistently across Claude Code, Codex CLI, and Gemini CLI while enabling per‑agent specializations where they add clear value. No additional CLI features are introduced.

## What Should Happen

- Base Handlebars templates for all commands.
- Insertions per agent: either direct inline content, or outsourcing to subagents where supported (Claude Code). Keep insertions generic so other agents can adopt similar features later without changing templates.
- Specialized custom feature install on a per‑agent basis (e.g., Claude notification hooks), isolated to that agent’s installer.

## Goals

- Single source of truth for every command (Handlebars templates).
- Cross‑agent parity in tone, structure, and expected behavior.
- Agent adapters expand the same template to each target without duplicating content.
- Keep installed artifacts simple (Markdown/TOML) with no runtime dependencies.
- Improve confidence via unit and snapshot tests.

## Principles

- Templates first: Handlebars is the only templating mechanism.
- Adapters, not forks: small per‑agent expansions from the same base template.
- Subagents only when natively supported (Claude Code today; others later).
- Keep installers interactive and minimal; no new CLI flags.
- Idempotent writes; only touch our own artifacts.

## Architecture

1. Base Templates (canonical source)

- Location: `resources/commands/*.md.hbs` for command bodies; optional YAML frontmatter for metadata (e.g., description).
- Shared partials: `resources/partials/` for reusable sections (e.g., “context usage”, “review checklist”).
- Data passed to templates: `{ agent, command, project, features }` where `agent` encodes capabilities like `supportsSubagents`.

2. Insertions (generic intents)

- Define generic insertion partials/helpers:
  - `{{> insert.delegateTo name="cm-reviewer" purpose="Code review"}}`
  - `{{> insert.useWorkspaceTools}}`
  - `{{> insert.referenceProjectDocs}}`
- Per‑agent adapter maps these insertions:
  - Claude Code: “delegateTo” emits subagent/Task‑based outsourcing; others inline concise instructions.
  - Codex CLI: expand to direct inline instructions (no subagent calls).
  - Gemini CLI: expand inline inside TOML prompt text.

3. Target Renderers (adapters)

- Claude Code: compile `.md.hbs` → `.md` with Claude insertions; may append agent blueprint summaries.
- Codex CLI: compile `.md.hbs` → `.md` with Codex phrasing and `cm-<normalized-path>.md` slug.
- Gemini CLI: compile `.md.hbs` to Markdown, then wrap in a small `.toml.hbs` to populate `description` and `prompt`.

4. Specialized Per‑Agent Install

- Claude Code: install commands, optional notification hooks, and sync subagents (outsourced agents live under `~/.claude/agents`).
- Codex CLI: install prompts and inject/remove a marked Context Monkey section in `~/.codex/AGENTS.md`.
- Gemini CLI: install under a namespace with minimal extension metadata.

5. Determinism

- Normalize output (trailing newlines, bullets, fences) for stable diffs/snapshots.

## Implementation Plan

Phase 1 — Introduce Handlebars ✅ Completed

- Added Handlebars runtime to build/install paths.
- Converted all commands to `.md.hbs` templates with minimal structural changes.
- Created shared insertion partial stubs (`insert.*`) ready for per-agent adapters.

Phase 2 — Agent Adapters ✅ Completed

- Implemented insertion expansions so Claude delegates to subagents while other agents perform inline workflows.
- Updated templates to reference `{{agent.name}}` and shared insertions for consistent tone across agents.

Phase 3 — Determinism & Validation ✅ Completed

- Resource validation script checks required frontmatter, partial usage, and agent references.
- Templates already normalize Markdown/TOML output via shared renderers for consistent snapshots later.

Phase 4 — Specialized Installs ✅ Completed

- Installers now emit consistent summaries while writing only generated assets.
- Claude retains optional hooks/subagents with status reporting; Codex/Gemini stay minimal.

Phase 5 — Documentation ✅ Completed

- Authored template/toml troubleshooting guide (`docs/TEMPLATE_AUTHORING.md`).
- Snapshot tests and installer dry-runs provide guardrails for future edits.

## Test Coverage

- Templates & Adapters
  - Snapshot compiled outputs for each command across each agent.
  - Unit tests for insertion expansions (`delegateTo`, `useWorkspaceTools`, `referenceProjectDocs`).

- Resources
  - Validation tests: frontmatter, partial resolution, anchor integrity.

- Installers (side‑effect free)
  - Use temporary directories or an injectable filesystem to assert created paths and markers.
  - Round‑trip: install → uninstall removes only our artifacts.

## Risks & Mitigations

- Over‑aggressive expansions: keep insertion set small; snapshot outputs; document each mapping.
- Cleanup scope: limit to our prefixes/markers; never wildcard delete.
- Future agent features: the insertion API is generic; adding a new adapter does not change templates.

## Milestones

1. Handlebars base + partials + initial adapters (1–2 days)
2. Snapshot tests (1 day)
3. Resource validation tooling (0.5–1 day)
4. Docs (0.5 day)

## Action Plan (Summary)

- Convert commands to base `.md.hbs` templates with shared partials. ✅
- Implement generic insertions and per-agent adapter expansions. ✅
- Keep installers interactive; add no new CLI flags.
- Add snapshot tests and resource validation.
- Keep Claude‑specific features behind the Claude adapter/install only.
