# Claude Code Internals Reference

Comprehensive reference covering Claude Code's memory system, skills system, and distribution mechanisms. Compiled for the Context Monkey portability project.

**Last updated**: 2026-03-22
**Claude Code docs**: https://code.claude.com/docs/en/
**Agent Skills spec**: https://agentskills.io

---

## Table of Contents

1. [Memory System](#1-memory-system)
2. [Skills System](#2-skills-system)
3. [Distribution & Marketplace](#3-distribution--marketplace)

---

## 1. Memory System

Claude Code has two complementary memory systems, both loaded at the start of every conversation:

| Aspect | CLAUDE.md files | Auto memory |
|---|---|---|
| **Who writes it** | User | Claude |
| **What it contains** | Instructions and rules | Learnings and patterns |
| **Scope** | Project, user, or org | Per working tree |
| **Loaded into** | Every session (full file) | Every session (first 200 lines of MEMORY.md) |
| **Use for** | Coding standards, workflows, architecture | Build commands, debugging insights, preferences |

### 1.1 CLAUDE.md Files

CLAUDE.md files are markdown files that give Claude persistent instructions. They are loaded as user messages (not system prompt) at the start of every session.

#### Locations and Scope

| Scope | Location | Shared with |
|---|---|---|
| **Managed policy** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`; Linux/WSL: `/etc/claude-code/CLAUDE.md`; Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | All users (org-wide, cannot be excluded) |
| **Project** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team (via source control) |
| **User** | `~/.claude/CLAUDE.md` | Just you (all projects) |

#### Loading Behavior

- Claude Code walks **up** the directory tree from CWD, loading every CLAUDE.md it finds.
- CLAUDE.md files in **subdirectories** below CWD are loaded **on demand** when Claude reads files in those directories.
- Files from `--add-dir` directories are NOT loaded by default. Set `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` to enable.
- **After `/compact`**, CLAUDE.md is re-read from disk and re-injected fresh into the session.

#### Import Syntax

CLAUDE.md files can import other files using `@path/to/import`:

```text
See @README for project overview and @package.json for npm commands.

# Individual Preferences
- @~/.claude/my-project-instructions.md
```

- Both relative and absolute paths are allowed.
- Relative paths resolve relative to the file containing the import.
- Recursive imports supported, max depth of 5 hops.
- First encounter triggers an approval dialog.

#### Size Guidelines

- Target **under 200 lines** per CLAUDE.md file.
- Longer files consume more context and reduce adherence.
- Split with imports or `.claude/rules/` files.

#### Rules Directory (`.claude/rules/`)

For larger projects, organize instructions into `.claude/rules/*.md`:

```
.claude/
  CLAUDE.md
  rules/
    code-style.md
    testing.md
    security.md
```

Rules can be **path-scoped** with YAML frontmatter:

```yaml
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules
...
```

Rules without `paths` frontmatter load unconditionally at launch. Path-scoped rules trigger when Claude reads matching files.

User-level rules at `~/.claude/rules/` apply to every project.

#### Excluding CLAUDE.md Files

Use `claudeMdExcludes` in settings to skip irrelevant files (e.g., in monorepos):

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

Managed policy CLAUDE.md files cannot be excluded.

### 1.2 Auto Memory

Auto memory lets Claude accumulate knowledge across sessions without user action. Claude saves notes for itself: build commands, debugging insights, architecture notes, code style preferences, workflow habits.

**Requires**: Claude Code v2.1.59+

#### Enable/Disable

- On by default.
- Toggle via `/memory` command or setting:

```json
{ "autoMemoryEnabled": false }
```

- Environment variable: `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`

#### Storage Location

```
~/.claude/projects/<project>/memory/
  MEMORY.md          # Concise index, auto-loaded every session
  debugging.md       # Topic file (loaded on demand)
  api-conventions.md # Topic file (loaded on demand)
  ...
```

The `<project>` path is derived from the **git repository**. All worktrees and subdirectories within the same repo share one auto memory directory. Outside a git repo, the project root is used.

#### Path Encoding

The project path in `~/.claude/projects/` is a path-encoded version of the absolute path to the git root. For example, a repo at `/Users/rdh/src/puck` becomes:

```
~/.claude/projects/-Users-rdh-src-puck/memory/
```

(Forward slashes replaced with hyphens, leading slash becomes leading hyphen.)

#### Redirecting Memory Storage

Set `autoMemoryDirectory` in user or local settings:

```json
{ "autoMemoryDirectory": "~/my-custom-memory-dir" }
```

- Accepted from **policy**, **local**, and **user** settings.
- **NOT** accepted from project settings (`.claude/settings.json`) to prevent shared repos from redirecting memory to sensitive locations.
- Supports `~/` expansion.

#### MEMORY.md Loading

- The **first 200 lines** of `MEMORY.md` are loaded at the start of every conversation.
- Content beyond line 200 is NOT loaded at session start.
- Claude keeps MEMORY.md concise by moving detailed notes into separate topic files.
- This 200-line limit applies ONLY to MEMORY.md. CLAUDE.md files load in full.

#### Topic Files

- Files like `debugging.md`, `patterns.md` are NOT loaded at startup.
- Claude reads them on demand using standard file tools when needed.
- Claude uses MEMORY.md as an index to track what's stored where.

#### Persistence

- Auto memory is **machine-local**.
- Files are **not** shared across machines or cloud environments.
- All worktrees/subdirectories within the same git repo share one memory directory.
- Files are plain markdown, editable or deletable at any time.

#### Subagent Memory

Subagents can maintain their own persistent memory with the `memory` frontmatter field:

| Scope | Location |
|---|---|
| `user` | `~/.claude/agent-memory/<agent-name>/` |
| `project` | `.claude/agent-memory/<agent-name>/` |
| `local` | `.claude/agent-memory-local/<agent-name>/` |

When enabled, the subagent's system prompt includes the first 200 lines of its own `MEMORY.md`, plus instructions for reading/writing files in its memory directory.

#### Managing Memory

- `/memory` command: lists all CLAUDE.md and rules files, toggle auto memory, open memory folder.
- Ask Claude to "remember X" and it saves to auto memory.
- Ask Claude to "add X to CLAUDE.md" for persistent instructions.
- All files are plain markdown -- edit or delete directly.

---

## 2. Skills System

Claude Code skills follow the [Agent Skills](https://agentskills.io) open standard, with Claude Code-specific extensions.

### 2.1 Agent Skills Specification (agentskills.io)

The open standard, originally developed by Anthropic, adopted by 30+ agent products including Claude Code, Cursor, VS Code/Copilot, Gemini CLI, OpenHands, Goose, Roo Code, OpenAI Codex, and many others.

**GitHub**: https://github.com/agentskills/agentskills
**Spec**: https://agentskills.io/specification
**Reference library**: https://github.com/agentskills/agentskills/tree/main/skills-ref

### 2.2 Directory Structure

```
skill-name/
  SKILL.md           # Required: metadata + instructions
  scripts/           # Optional: executable code
  references/        # Optional: documentation (REFERENCE.md, etc.)
  assets/            # Optional: templates, images, data files
  examples/          # Optional: example outputs
  ...                # Any additional files
```

### 2.3 SKILL.md Format

YAML frontmatter followed by Markdown content.

#### Open Standard Fields (agentskills.io)

| Field | Required | Constraints |
|---|---|---|
| `name` | Yes (spec) / No (Claude Code) | Max 64 chars. Lowercase letters, numbers, hyphens only. Must not start/end with hyphen. Must match parent directory name. |
| `description` | Yes (spec) / Recommended (Claude Code) | Max 1024 chars. What the skill does and when to use it. |
| `license` | No | License name or reference to bundled file. |
| `compatibility` | No | Max 500 chars. Environment requirements. |
| `metadata` | No | Arbitrary key-value map for additional properties. |
| `allowed-tools` | No (experimental) | Space-delimited list of pre-approved tools. |

#### Claude Code Extension Fields

| Field | Required | Description |
|---|---|---|
| `argument-hint` | No | Hint shown during autocomplete. E.g., `[issue-number]` |
| `disable-model-invocation` | No | `true` = only user can invoke (not Claude). Default: `false` |
| `user-invocable` | No | `false` = hidden from `/` menu. Default: `true` |
| `model` | No | Model override when skill is active. |
| `effort` | No | Effort level override: `low`, `medium`, `high`, `max` |
| `context` | No | `fork` = run in a forked subagent context. |
| `agent` | No | Which subagent type when `context: fork`. Options: `Explore`, `Plan`, `general-purpose`, or custom agent name. Default: `general-purpose` |
| `hooks` | No | Hooks scoped to this skill's lifecycle. |

#### Invocation Control Matrix

| Frontmatter | User can invoke | Claude can invoke | Context loading |
|---|---|---|---|
| (default) | Yes | Yes | Description always in context; full content loads when invoked |
| `disable-model-invocation: true` | Yes | No | Description NOT in context; loads only on user invoke |
| `user-invocable: false` | No | Yes | Description always in context; loads when invoked |

### 2.4 Skill Locations

| Location | Path | Applies to |
|---|---|---|
| Enterprise | Managed settings | All users in org |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<skill-name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | Where plugin is enabled |

Priority: enterprise > personal > project. Plugin skills use `plugin-name:skill-name` namespace.

#### Discovery

- Skill **descriptions** are loaded into context so Claude knows what's available.
- Full skill content only loads when invoked.
- When working in subdirectories, Claude auto-discovers skills from nested `.claude/skills/` dirs.
- Skills from `--add-dir` directories are loaded automatically.
- Character budget for descriptions: 2% of context window, fallback 16,000 chars. Override with `SLASH_COMMAND_TOOL_CHAR_BUDGET`.

### 2.5 String Substitutions

| Variable | Description |
|---|---|
| `$ARGUMENTS` | All arguments passed when invoking |
| `$ARGUMENTS[N]` | Specific argument by 0-based index |
| `$N` | Shorthand for `$ARGUMENTS[N]` |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_SKILL_DIR}` | Directory containing the SKILL.md file |

If `$ARGUMENTS` is not present in the content, arguments are appended as `ARGUMENTS: <value>`.

### 2.6 Dynamic Context Injection

The `` !`<command>` `` syntax runs shell commands **before** the skill content is sent to Claude. Output replaces the placeholder:

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`
```

This is **preprocessing** -- Claude only sees the final rendered output.

### 2.7 Subagent Execution (context: fork)

When `context: fork` is set:

1. A new isolated context is created.
2. The subagent receives the skill content as its prompt.
3. The `agent` field determines execution environment (model, tools, permissions).
4. Results are summarized and returned to the main conversation.
5. The subagent does NOT have access to conversation history.

### 2.8 Tool Restriction

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read, Grep, Glob
---
```

Tools listed in `allowed-tools` are pre-approved (no per-use permission prompt). Parent session permissions still govern baseline.

Permission rules for skills:

```text
# Allow specific skills
Skill(commit)
Skill(review-pr *)

# Deny specific skills
Skill(deploy *)
```

### 2.9 Scripts

Scripts live in `scripts/` and are referenced from SKILL.md:

```markdown
## Available scripts
- **`scripts/validate.sh`** -- Validates configuration files
- **`scripts/process.py`** -- Processes input data
```

**Execution model**:
- Agents run scripts via their Bash/shell tool.
- Scripts must be **non-interactive** (no TTY prompts).
- Use relative paths from the skill directory root.
- Output (stdout/stderr) enters the agent's context window.

**Best practices from the spec**:
- Self-contained with inline dependencies (PEP 723, `uvx`, `npx`, `bunx`, etc.)
- Include `--help` output for agent discovery
- Use structured output (JSON, CSV) over free-form text
- Separate data (stdout) from diagnostics (stderr)
- Support `--dry-run` for destructive operations
- Be idempotent (agents may retry)
- Meaningful exit codes

### 2.10 Progressive Disclosure

The spec recommends three levels of context loading:

1. **Metadata** (~100 tokens): `name` and `description` loaded at startup for all skills
2. **Instructions** (<5000 tokens recommended): Full SKILL.md body loaded on activation
3. **Resources** (as needed): Files in `scripts/`, `references/`, `assets/` loaded only when required

Keep SKILL.md under 500 lines. Move detailed reference to separate files.

### 2.11 Commands Directory (`.claude/commands/`)

Commands have been **merged into skills**. A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy`. Existing `.claude/commands/` files keep working. Skills add: directory for supporting files, frontmatter for invocation control, auto-discovery.

If a skill and a command share the same name, the **skill takes precedence**.

### 2.12 Bundled Skills

Skills that ship with Claude Code:

| Skill | Purpose |
|---|---|
| `/batch <instruction>` | Orchestrate large-scale changes across codebase in parallel using git worktrees |
| `/claude-api` | Load Claude API reference material for your project's language |
| `/debug [description]` | Troubleshoot current session by reading debug log |
| `/loop [interval] <prompt>` | Run a prompt repeatedly on an interval |
| `/simplify [focus]` | Review recently changed files for reuse/quality/efficiency issues |

### 2.13 Extended Thinking

Include the word **"ultrathink"** anywhere in skill content to enable extended thinking mode.

---

## 3. Distribution & Marketplace

### 3.1 Settings Architecture

#### Settings Files and Scopes

| Scope | File | Shared? | Priority |
|---|---|---|---|
| **Managed** | Server-managed, plist/registry, or `managed-settings.json` | Yes (deployed by IT) | 1 (highest) |
| **CLI args** | Command-line flags | No (session only) | 2 |
| **Local** | `.claude/settings.local.json` | No (gitignored) | 3 |
| **Project** | `.claude/settings.json` | Yes (committed to git) | 4 |
| **User** | `~/.claude/settings.json` | No (personal) | 5 (lowest) |

**Key distinction**: `.claude/settings.json` is shared with the team via git. `.claude/settings.local.json` is personal and gitignored.

#### Selected Settings Keys

| Key | Description |
|---|---|
| `autoMemoryEnabled` | Enable/disable auto memory |
| `autoMemoryDirectory` | Custom memory storage path |
| `model` | Override default model |
| `permissions` | Allow/deny rules for tools |
| `hooks` | Lifecycle event handlers |
| `env` | Environment variables for every session |
| `agent` | Run main thread as a named subagent |
| `enableAllProjectMcpServers` | Auto-approve all project MCP servers |
| `claudeMdExcludes` | Skip specific CLAUDE.md files |
| `includeGitInstructions` | Include built-in git workflow instructions |
| `effortLevel` | Persist effort level across sessions |
| `language` | Preferred response language |

Full schema: https://json.schemastore.org/claude-code-settings.json

#### Managed Settings Delivery

| Mechanism | Platform |
|---|---|
| Server-managed | Via Claude.ai admin console |
| MDM preferences | macOS: `com.anthropic.claudecode` domain |
| Registry | Windows: `HKLM\SOFTWARE\Policies\ClaudeCode` |
| File-based | `managed-settings.json` in system dirs |

System directories:
- macOS: `/Library/Application Support/ClaudeCode/`
- Linux/WSL: `/etc/claude-code/`
- Windows: `C:\Program Files\ClaudeCode\`

### 3.2 MCP Server Configuration

#### `.mcp.json` Format (Project Scope)

```json
{
  "mcpServers": {
    "server-name": {
      "command": "/path/to/server",
      "args": [],
      "env": {}
    }
  }
}
```

Lives at project root. Committed to version control. Requires user approval before use.

#### Scopes

| Scope | Storage | Shared? |
|---|---|---|
| **Local** (default) | `~/.claude.json` under project path | No |
| **Project** | `.mcp.json` in project root | Yes (git) |
| **User** | `~/.claude.json` | No |
| **Managed** | `managed-mcp.json` in system dirs | Yes (org-wide) |

#### Transport Types

```bash
# HTTP (recommended for remote)
claude mcp add --transport http <name> <url>

# SSE (deprecated, use HTTP)
claude mcp add --transport sse <name> <url>

# stdio (local processes)
claude mcp add --transport stdio <name> -- <command> [args...]
```

#### Environment Variable Expansion

`.mcp.json` supports `${VAR}` syntax for environment variables.

#### Plugin MCP Servers

Plugins can bundle MCP servers in `.mcp.json` at plugin root or inline in `plugin.json`:

```json
{
  "database-tools": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
    "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
    "env": { "DB_URL": "${DB_URL}" }
  }
}
```

Special variables: `${CLAUDE_PLUGIN_ROOT}` (plugin install dir), `${CLAUDE_PLUGIN_DATA}` (persistent state dir).

#### MCP Registry API

Anthropic maintains an MCP server registry at:
```
https://api.anthropic.com/mcp-registry/v0/servers
```

Used by Claude Code docs to list popular servers. Supports pagination, filtering by visibility and version.

### 3.3 Plugin System

Plugins are the primary distribution mechanism for skills, agents, hooks, and MCP servers.

#### Plugin Structure

```
my-plugin/
  .claude-plugin/
    plugin.json        # Manifest (name, description, version, author)
  skills/              # Agent Skills with SKILL.md files
  commands/            # Skills as Markdown files (legacy compat)
  agents/              # Custom agent definitions
  hooks/
    hooks.json         # Event handlers
  .mcp.json            # MCP server configurations
  .lsp.json            # LSP server configurations
  settings.json        # Default settings (currently only `agent` key)
```

#### Plugin Manifest (`plugin.json`)

```json
{
  "name": "my-plugin",
  "description": "What this plugin does",
  "version": "1.0.0",
  "author": { "name": "Your Name" },
  "homepage": "https://...",
  "repository": "https://...",
  "license": "MIT"
}
```

Skills are namespaced: `/plugin-name:skill-name`.

#### Plugin Commands

```bash
# Install
/plugin install plugin-name@marketplace-name

# Manage
/plugin disable plugin-name@marketplace-name
/plugin enable plugin-name@marketplace-name
/plugin uninstall plugin-name@marketplace-name

# Reload after changes
/reload-plugins

# Local development
claude --plugin-dir ./my-plugin
```

### 3.4 Official Anthropic Marketplace

The official marketplace (`claude-plugins-official`) is **automatically available** in every Claude Code installation. Browse via `/plugin` Discover tab or at https://claude.com/plugins.

```bash
/plugin install github@claude-plugins-official
```

**Categories**:
- **Code intelligence**: LSP plugins (TypeScript, Python, Rust, Go, C/C++, Java, etc.)
- **External integrations**: GitHub, GitLab, Atlassian, Asana, Linear, Notion, Figma, Vercel, Firebase, Supabase, Slack, Sentry
- **Development workflows**: commit-commands, pr-review-toolkit, agent-sdk-dev, plugin-dev
- **Output styles**: explanatory, learning

**Submitting to official marketplace**:
- Claude.ai: https://claude.ai/settings/plugins/submit
- Console: https://platform.claude.com/plugins/submit

### 3.5 Community/Custom Marketplaces

A marketplace is a git repo (or URL) with `.claude-plugin/marketplace.json`:

```json
{
  "name": "company-tools",
  "owner": { "name": "DevTools Team" },
  "plugins": [
    {
      "name": "code-formatter",
      "source": "./plugins/formatter",
      "description": "Automatic code formatting"
    }
  ]
}
```

#### Adding Marketplaces

```bash
# GitHub
/plugin marketplace add owner/repo

# Git URL (GitLab, Bitbucket, self-hosted)
/plugin marketplace add https://gitlab.com/company/plugins.git

# Specific branch/tag
/plugin marketplace add https://gitlab.com/company/plugins.git#v1.0.0

# Local path
/plugin marketplace add ./my-marketplace

# Remote URL
/plugin marketplace add https://example.com/marketplace.json
```

#### Plugin Sources in Marketplace

| Source | Format | Notes |
|---|---|---|
| Relative path | `"./plugins/my-plugin"` | Within marketplace repo |
| GitHub | `{ "source": "github", "repo": "owner/repo", "ref": "v2.0", "sha": "..." }` | |
| Git URL | `{ "source": "url", "url": "https://..." }` | Any git host |
| Git subdirectory | `{ "source": "git-subdir", "url": "...", "path": "tools/plugin" }` | Sparse clone for monorepos |
| npm | `{ "source": "npm", "package": "@org/plugin", "version": "^2.0.0", "registry": "..." }` | Public or private registry |

#### Auto-Updates

- Official marketplaces: auto-update enabled by default.
- Third-party: disabled by default, toggle via `/plugin` UI.
- Disable all: `DISABLE_AUTOUPDATER=true`
- Keep plugin updates while disabling Claude Code updates: `FORCE_AUTOUPDATE_PLUGINS=true`

#### Team Marketplace Configuration

In `.claude/settings.json` (committed to git):

```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": { "source": "github", "repo": "your-org/claude-plugins" }
    }
  },
  "enabledPlugins": {
    "code-formatter@company-tools": true
  }
}
```

#### Managed Marketplace Restrictions

Admins can restrict marketplace additions via `strictKnownMarketplaces` in managed settings:

```json
{
  "strictKnownMarketplaces": [
    { "source": "github", "repo": "acme-corp/approved-plugins" },
    { "source": "hostPattern", "hostPattern": "^github\\.example\\.com$" },
    { "source": "pathPattern", "pathPattern": "^/opt/approved/" }
  ]
}
```

Empty array = complete lockdown. Undefined = no restrictions.

### 3.6 Anthropic Example Skills Repository

**GitHub**: https://github.com/anthropics/skills (99.8k stars)

Contains production-ready document skills (docx, pdf, pptx, xlsx) and example skills. Installable as a plugin:

```bash
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
```

Skills are also available in Claude.ai (paid plans) and via Claude API.

### 3.7 Plugin Caching

Installed plugins are cached at `~/.claude/plugins/cache/`. Plugins are copied (not symlinked), so they cannot reference files outside their directory. Symlinks within the plugin directory are followed during copying.

### 3.8 Pre-Seeding for Containers/CI

Set `CLAUDE_CODE_PLUGIN_SEED_DIR` to a directory mirroring `~/.claude/plugins/`:

```
$CLAUDE_CODE_PLUGIN_SEED_DIR/
  known_marketplaces.json
  marketplaces/<name>/...
  cache/<marketplace>/<plugin>/<version>/...
```

Seed is read-only. Auto-updates disabled for seed marketplaces. Multiple seed dirs separated by `:` (Unix) or `;` (Windows).

### 3.9 SkillsMP / Third-Party Marketplaces

There is no single centralized "SkillsMP" marketplace independent of Claude Code's plugin system. Distribution happens through:

1. **Official Anthropic marketplace** (built into Claude Code)
2. **GitHub-based marketplaces** (any repo with `.claude-plugin/marketplace.json`)
3. **npm packages** (plugin sources can reference npm packages)
4. **Git repos** (any git host -- GitHub, GitLab, Bitbucket, self-hosted)
5. **Local directories** (for development and private distribution)
6. **anthropics/skills** repo (Anthropic's example/reference skills)

The Agent Skills spec at agentskills.io is a format standard, not a registry. It defines the portable format; distribution is handled by each agent product's own mechanisms.

---

## Appendix: Key File Paths

| File/Directory | Purpose |
|---|---|
| `~/.claude/settings.json` | User settings (personal, all projects) |
| `~/.claude/CLAUDE.md` | User instructions (all projects) |
| `~/.claude/rules/` | User-level rules (all projects) |
| `~/.claude/skills/` | Personal skills |
| `~/.claude/agents/` | Personal subagents |
| `~/.claude/agent-memory/` | Subagent persistent memory (user scope) |
| `~/.claude/plugins/cache/` | Installed plugin cache |
| `~/.claude/projects/<project>/memory/` | Auto memory per project |
| `~/.claude.json` | OAuth, preferences, MCP servers (user/local scope) |
| `.claude/settings.json` | Project settings (shared via git) |
| `.claude/settings.local.json` | Local settings (gitignored) |
| `.claude/CLAUDE.md` | Project instructions (shared) |
| `.claude/rules/` | Project rules |
| `.claude/skills/` | Project skills |
| `.claude/agents/` | Project subagents |
| `.claude/agent-memory/` | Subagent memory (project scope) |
| `.claude/agent-memory-local/` | Subagent memory (local scope) |
| `.mcp.json` | Project MCP servers (shared via git) |
| `CLAUDE.md` | Project instructions (alternative location) |

## Appendix: Environment Variables

| Variable | Purpose |
|---|---|
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` | Disable auto memory |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` | Load CLAUDE.md from `--add-dir` dirs |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Override skill description context budget |
| `CLAUDE_CODE_PLUGIN_SEED_DIR` | Pre-seed plugins for containers |
| `DISABLE_AUTOUPDATER=true` | Disable all auto-updates |
| `FORCE_AUTOUPDATE_PLUGINS=true` | Keep plugin updates when main updates disabled |
| `MCP_TIMEOUT` | MCP server startup timeout (ms) |
| `MAX_MCP_OUTPUT_TOKENS` | Override MCP output token warning threshold |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` | Disable background subagent tasks |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Trigger auto-compaction earlier (percentage) |
| `CLAUDE_CODE_NEW_INIT=true` | Enable interactive multi-phase `/init` flow |
| `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS` | Git operation timeout for plugins (ms, default 120000) |
