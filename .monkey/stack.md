# Stack Profile (generated)

**Generated:** 2025-08-28T18:00:00Z

## Languages / Frameworks

- **Shell/Bash** - Primary installation and deployment scripting
- **Markdown** - Documentation and command definitions
- **Git** - Version control integration

## Build / Test / Run

- **Installation**: `curl -fsSL https://raw.githubusercontent.com/richhaase/context-monkey/main/install.sh | bash`
- **Update**: Built-in `/upgrade` command
- **Uninstall**: Built-in `/uninstall` command
- No build process required (static files)

## Entrypoints / Hot paths

- **install.sh** - Main installation script and entry point
- **context/context.md** - Core CLAUDE.md template deployed to target repos
- **.claude/commands/monkey/** - Collection of 9 slash commands:
  - `stack-scan.md` - Tech stack detection
  - `add-rule.md` - Rule creation
  - `edit-rule.md` - Rule editing
  - `explain-repo.md` - Repository analysis
  - `deep-dive.md` - Deep research
  - `plan-change.md` - Change planning
  - `review-code.md` - Code review
  - `upgrade.md` - Update mechanism
  - `uninstall.md` - Removal process

## External services

- **GitHub Raw** - File distribution via `https://raw.githubusercontent.com/richhaase/context-monkey/main/`
- **curl** - HTTP client for installation and updates
- **Git** - Required for target repository detection and .gitignore management
- **Claude Code** - Target platform for slash commands and context rules