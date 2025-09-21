# Multi‑Agent Templating Proposal

A concise plan to keep Context Monkey simple, flexible, and focused on deploying standard agent commands across native agent CLIs (Claude Code, Codex, Gemini), while improving test coverage.

## Goals

- Single source of truth for command content and subagent blueprints.
- Minimal, composable renderers per target agent (no over‑engineering).
- Idempotent, transparent installers/uninstallers with clear output.
- High confidence via fast, focused tests (unit + golden snapshots).
- Avoid vendor lock‑in by keeping resources human‑readable (Markdown, TOML).

## Principles

- Keep resources plain: Markdown with YAML frontmatter; TOML for Gemini prompts.
- Push target‑specific logic into thin adapters; avoid content duplication.
- Zero runtime dependencies in installed artifacts; pre‑render during install.
- Make every file write explicit and reversible; prefer additive changes.
- Small surface area: a few well‑named functions and clear contracts.

## Current State Summary

- Resources live under `resources/commands` and `resources/agents` (good baseline).
- Renderers exist for Claude, Codex, Gemini with basic transformations.
- Installers write files to agent‑specific locations and handle some cleanup.
- Tests exist for utils, hooks, CLI shape; renderer/resource tests are light.

## Proposed Architecture

1. Templates and Blueprints

- Commands: Markdown files with YAML frontmatter keys: `description`, `argument-hint`, `allowed-tools`, `plan_mode`.
- Agents: `resources/agents/cm-*.md` used as optional blueprints embedded into commands.
- Reference detection: simple `cm-*` anchor scan; keep extraction deterministic and case‑insensitive.

2. Target Renderers (adapters)

- Claude: pass‑through Markdown + frontmatter; no extra sections.
- Codex: Markdown transform with small, explicit rules: wording changes, section drop, blueprint append, slug generation `cm-<normalized-path>.md`.
- Gemini: Build TOML `{ description, prompt }` where `prompt` is transformed Markdown; include blueprints at heading level 3.
- Rules live in `config/agents.ts` to remain declarative and testable.

3. Deterministic Rendering

- Normalize output (trailing newline, fenced code style, bullet style) to enable snapshot testing.
- Keep replacements minimal and listed; avoid regex that can over‑match.

4. Install/Uninstall Flows

- Idempotent writes with a version banner at the top of generated files.
- Pre‑clean only our own artifacts by prefix/markers; never touch user files.
- For Codex, wrap `AGENTS.md` section in begin/end markers to allow clean removal.
- For Gemini, keep extension metadata minimal and stable.

5. Extensibility

- New agent support adds a renderer and install target only; resource files remain unchanged.
- Optional per‑command overrides (frontmatter flags) to tweak rendering without new code.

## Implementation Plan (Phased)

Phase 1 — Stabilize Rendering (MVP hardening)

- Tighten renderers to be purely functional and deterministic.
- Add snapshot tests for: slug creation, Markdown→Markdown (Codex), Markdown→TOML (Gemini), blueprint insertion.
- Document frontmatter schema and supported overrides.

Phase 2 — Installation UX

- Add non‑interactive flags and dry‑run mode: `--yes`, `--dry-run`, `--verbose`.
- Improve logs: show source→target mapping and counts; print a one‑line summary.
- Guardrails: refuse to overwrite unknown files; only touch prefixed/marked files.

Phase 3 — Resource Hygiene

- Add a validation script to lint resources (frontmatter keys, anchor references, filename patterns).
- Optional: prepublish check to ensure renderers still produce canonical output.

Phase 4 — Observability & Safety

- Structured logs for installs; elapsed time and file counts.
- Soft‑fail and continue on non‑critical steps with a final summary of warnings.

Phase 5 — Documentation

- Author a short “Authoring Templates” guide: examples, frontmatter reference, preview tips.
- “Troubleshooting Installs” guide: common paths, how to clean, how to re‑install.

## Test Coverage Plan

- Renderers
  - Unit: slug generation, text replacements, heading drops, blueprint heading normalization.
  - Snapshots: golden files for 2–3 representative commands per target.

- Resources
  - Loaders: frontmatter parsing and agent reference extraction.
  - Validation: a lint step that fails on missing blueprints or bad anchors.

- Installers
  - Dry‑run tests using temp directories; assert created paths, banners, and counts.
  - Round‑trip: install → uninstall leaves no residue (only our prefixes/markers).

- Platform utilities
  - Keep fast and deterministic; avoid spawning external tools in unit tests.

## Risks & Mitigations

- Over‑aggressive regex replacements → Keep rule list short, add snapshot tests, and document each rule.
- Installer cleanup removing user content → Restrict to our prefixes/markers only; never wildcard delete.
- Drift between resources and renderers → Add prepublish validation and CI snapshots.

## Milestones

1. Rendering hardening + snapshots (1–2 days)
2. Installer UX flags + dry‑run (1 day)
3. Resource validation tooling (0.5–1 day)
4. Docs (0.5 day)

## Summarized Action Plan

- Add golden snapshot tests for Codex and Gemini renderers.
- Normalize rendering output (newlines, lists, fences) for stable diffs.
- Implement `--dry-run` and `--yes` across installers; enhance logging.
- Add a resource linter (frontmatter + references) and run in CI/prepublish.
- Document authoring and troubleshooting; keep examples small and copy‑pasteable.

— End of proposal —
