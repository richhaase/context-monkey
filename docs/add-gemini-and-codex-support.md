# Plan: Add Gemini CLI and Codex CLI Support

_Implementation status: initial cross-agent support landed via CLI `--target` flags, Codex prompt generation, and Gemini TOML command/extension output._

## 1. Target Agent Abstraction Layer

- Introduce a `TargetAgent` enum (claude-code, codex-cli, gemini-cli) and a descriptor map that captures install root, command and agent directories, config file format, notification capabilities, and supported features for each agent environment.
- Extend `InstallOptions` and `UninstallOptions` with a `targets` array (defaulting to Claude Code) and thread target descriptors into filesystem helpers (`getInstallPath`, `copyFileWithValidation`).
- Add a discovery step during bootstrap that verifies each target’s root directory exists (Claude: `~/.claude`, Codex: `~/.codex`, Gemini: `~/.gemini`) and surfaces actionable errors when missing.
- Document any per-target prerequisites (e.g., minimum CLI versions) before enabling installation logic.

## 2. Per-Target Install and Uninstall Flows

- Refactor `install.ts`/`uninstall.ts` to iterate over selected targets, copy resources into target-specific directories, and emit tailored console output.
- **Codex CLI**
  - Generate prompt files directly under `~/.codex/prompts/` using an `cm-<slug>.md` naming scheme (Codex treats Markdown files under `prompts/` as slash-accessible prompts per [docs/prompts.md](https://github.com/openai/codex/blob/main/docs/prompts.md)).
  - Populate or update `AGENTS.md` guidance blocks when installing (Codex merges instructions from `AGENTS.md` per [docs/getting-started.md#memory-with-agentsmd](https://github.com/openai/codex/blob/main/docs/getting-started.md#memory-with-agentsmd)).
  - Merge Context Monkey MCP/tool definitions into `~/.codex/config.toml` using a TOML-aware writer (e.g. [`@iarna/toml`]) and tag inserted sections for safe removal on uninstall.
  - Confirm whether any additional plugin mechanism exists beyond prompts/AGENTS; if not, document limitations in release notes.
- **Gemini CLI**
  - Primary install path: copy TOML command definitions into `~/.gemini/commands/context-monkey/` (Gemini loads user commands from this directory per [docs/cli/commands.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/commands.md)).
  - Optional packaging: offer a Gemini extension under `~/.gemini/extensions/context-monkey/` with a generated `gemini-extension.json` (structure described in [docs/extension.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extension.md)).
  - When installing the extension, include a `GEMINI.md` (or configured `contextFileName`) so commands can reference shared instructions.
  - Merge Context Monkey MCP definitions or include-directories into `.gemini/settings.json`, mirroring existing merge semantics.
  - Respect per-scope installs (`--local` → `<workspace>/.gemini/commands/`), and ensure uninstall cleans up both user and workspace artifacts as appropriate.

## 3. Resource Template Strategy

- Maintain shared prompt content in a neutral format (e.g., source Markdown) and generate per-target assets:
  - Claude: Markdown with YAML frontmatter (existing).
  - Codex: Markdown prompts under `prompts/` plus snippets appended to `AGENTS.md`.
  - Gemini: TOML command files and optional extension metadata/context Markdown.
- Build a small generator layer that can render each command/agent into the correct target format (Markdown→TOML conversion, description truncation, namespace mapping).
- Capture command naming collisions rules (Gemini: colon-separated namespaces; Codex: prompt filenames) to avoid conflicts.

## 4. CLI UX Enhancements

- Extend CLI commands with `--target <name>` (repeatable) and `--all-targets` flags; update help text and usage examples.
- Display per-target summaries during install/uninstall, including resolved paths and feature availability (e.g., notification hooks only for Claude on macOS).
- Handle partial failures gracefully, continuing with remaining targets while reporting errors.
- Add `context-monkey targets` (or similar) diagnostic command to list detected targets, resolved paths, and configured versions for troubleshooting.

## 5. Configuration and Hook Utilities

- Extract config writers into `src/config/targets/{claude|codex|gemini}.ts` to encapsulate path resolution, serialization (JSON/TOML), backups, and cleanup.
- Reuse existing hook identification markers for Claude; implement analogous tagging for Codex/Gemini settings (e.g., comment markers or dedicated keys) so uninstall can remove only Context Monkey entries.
- Provide a shared abstraction for merge operations that can be unit-tested with fixture files per config format.
- Document notification capabilities: Claude supports notification hooks today; Codex/Gemini do not expose an equivalent mechanism, so skip hook installation for those targets with a user-facing note.

## 6. Testing & Validation

- Add unit tests for target descriptor resolution, path generation, and config writers (including TOML/JSON merge and cleanup scenarios).
- Create fixture-based tests that render sample commands/prompts for each target and validate against expected formats.
- Expand integration tests to stage temporary Claude/Codex/Gemini directory structures and assert that install/uninstall copies and removes files/settings correctly.
- Automate manual validation scripts that simulate user-level installs for each target; include CLI commands such as `gemini extensions list` and `codex --help` checks to confirm assets are discoverable.
- Maintain a manual QA checklist: install for each target, verify commands appear in their respective slash menus, run uninstall, and confirm settings revert.

## 7. Documentation & Release Tasks

- Update README and SETUP with new installation flags, prerequisites for Codex/Gemini, directory structures, and configuration touch points.
- Add an architecture note describing the target-agent abstraction and resource generation pipeline.
- Provide migration guidance for existing users (e.g., how existing Claude-only installs behave, how to opt into additional agents).
- Record changes in CHANGELOG and bump the version once multi-target support ships, highlighting any limitations (e.g., Codex commands limited to prompt templates).

## 8. Open Questions & Risks

- **Codex command strategy**: confirm whether Markdown prompts alone provide sufficient functionality or if additional automation hooks are available; adjust scope accordingly.
- **Gemini TOML conversion fidelity**: ensure Markdown-to-TOML generator captures multi-line prompts, argument placeholders (`{{args}}`), and shell blocks without syntax errors.
- **Workspace installs**: verify behavior when installing into project-scoped `.gemini/commands` or `.codex` directories (permissions, precedence) before enabling `--local` support.
- **Config safety**: implement backups before modifying `config.toml` or `settings.json` to prevent data loss; document recovery steps.
- Track additional unknowns discovered during implementation here and update before release.
