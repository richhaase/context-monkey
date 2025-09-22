# Changelog

All notable changes to this project are documented here following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Multi-agent installer support renders a single Handlebars template set into Claude, Codex, and Gemini specific outputs.
- Config-driven agent blueprint injection lets non-Claude targets inline `cm-*` agent documentation with platform-aware heading depth and substitutions.
- Automated resource validator guards mismatches between command templates, agents, and rendered artifacts.

### Changed

- Installer and uninstaller flows now auto-detect available CLIs and guide the user through per-agent selection.
- Gemini assets use the `cm` namespace consistently and sanitize wording to match that platform's terminology.
- Template partials were refactored so non-delegating assistants avoid "subagent" phrasing while still sharing the new base Handlebars helpers.

### Fixed

- Gemini TOML prompts escape backslashes correctly and inline the repository explainer workflow without truncation.
- Handlebars partial calls use the standard syntax to prevent rendering failures across agents.

### Removed

- Deprecated intro and security assessment workflows were dropped from the command catalog to keep the toolkit focused.

### Documentation

- Updated internal architecture and planning docs to reflect the multi-agent templating pipeline and new installer experience.

### Testing

- Expanded installer and renderer coverage with focused unit tests and refreshed golden snapshots for representative commands.

## [0.10.3] - 2025-09-12

### Changed

- Simplified `cm-planner` output so downstream assistants receive a cleaner, more structured plan payload.

### Documentation

- Regenerated the public documentation suite to match the planner updates.

## [0.10.2] - 2025-09-11

### Fixed

- Replaced legacy `__dirname` usage with `import.meta.dirname` to keep ES module builds portable.

## [0.10.1] - 2025-09-11

### Testing

- Added coverage for the Husky pre-commit workflow to ensure formatting and lint steps execute inside CI.

## [0.10.0] - 2025-09-11

### Added

- Completed the TypeScript migration for the CLI along with type-safe installers and utilities.
- Adopted Bun for dependency management and testing to speed up local workflows.
- Introduced terminal-notifier hook management so macOS users can opt into completion alerts.

### Documentation

- Updated README guidance to highlight Bun-first installation and usage flows.

[Unreleased]: https://github.com/richhaase/context-monkey/compare/v0.10.3...HEAD
[0.10.3]: https://github.com/richhaase/context-monkey/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/richhaase/context-monkey/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/richhaase/context-monkey/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/richhaase/context-monkey/compare/v0.9.0...v0.10.0
