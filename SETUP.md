# Development Setup

## Prerequisites

- Node.js 18+ (minimum 16 as enforced by `package.json`)
- [Bun](https://bun.sh/) for dependency installation and testing (`curl -fsSL https://bun.sh/install | bash`)
- Git and a standard build toolchain (make, Python, etc.) for native package installs
- macOS developers testing notification hooks need `terminal-notifier` (`brew install terminal-notifier`)

> Prefer Bun for day-to-day work; scripts also run under npm if Bun is unavailable.

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/richhaase/context-monkey.git
   cd context-monkey
   ```
2. **Install dependencies**
   ```bash
   bun install          # or: npm install
   ```
3. **Compile TypeScript**
   ```bash
   bun run build
   ```
4. **(Optional) Start an incremental build**
   ```bash
   bun run dev          # tsc --watch
   ```
5. **Refresh rendering snapshots** – regenerate golden prompts before running tests that rely on them.
   ```bash
   npm run snapshots:generate
   ```
6. **Run the automated test suite**
   ```bash
   bun test
   ```
7. **Validate packaged resources** – confirms template metadata and rendered assets are consistent.
   ```bash
   npm run validate:resources
   ```

## Local CLI Verification

After building, you can execute the CLI directly:

```bash
node dist/bin/context-monkey.js --help
node dist/bin/context-monkey.js install
```

For iterative development, use `bunx context-monkey@link install` after running `bun run build` to exercise the compiled binary against your system.

## Development Workflow

- **Linting**: `bun run lint` (formatting fixes via `bun run lint:fix`); Prettier checks with `bun run format:check`.
- **Formatting**: `bun run format` writes Prettier results to `src/` and `tests/`.
- **Snapshot updates**: rerun `npm run snapshots:generate` after editing Handlebars templates or agent blueprints.
- **Resource validation**: `npm run validate:resources` ensures the compiled validator sees a consistent command catalog.
- **Installer smoke tests**: execute `context-monkey install` in a sandboxed environment to verify CLI prompts and summaries.

## Troubleshooting

- **TypeScript build fails**: ensure `dist/` is writable and you are running `bun run build` (or `npm run build` if you add a script) from the project root.
- **CLI cannot find installers**: run `bun run build` to regenerate `dist/` before invoking the binary.
- **Notification hooks skipped**: only macOS supports terminal-notifier; other platforms log a friendly message and continue.
- **Snapshot drift**: compare changes under `tests/snapshots/`; unexpected diffs usually mean a template regression or missing rebuild.

## Next Steps

Read `CONTRIBUTING.md` for branching, testing, and review expectations before opening a pull request.
