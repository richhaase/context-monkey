# Gemini CLI Reference

> Comprehensive reference for Context Monkey portability layer.
> Sources: official docs at [geminicli.com](https://geminicli.com/docs/), [GitHub repo](https://github.com/google-gemini/gemini-cli), community resources. Current as of March 2026.

---

## 1. Memory System

### 1.1 GEMINI.md — The Context File

GEMINI.md is Gemini CLI's equivalent of Claude Code's CLAUDE.md. It provides instructional context (also called "memory") that is loaded into the system prompt for every conversation turn.

#### Three-Level Discovery Hierarchy

| Level | Location | Scope | Purpose |
|-------|----------|-------|---------|
| **Global** | `~/.gemini/GEMINI.md` | All projects | Personal preferences, universal rules |
| **Workspace** | `./GEMINI.md` (project root, walks up to filesystem root) | Current project | Project conventions, architecture notes |
| **Just-in-Time (JIT)** | Subdirectory `GEMINI.md` files | Component-specific | Discovered on-demand when tools access files in that directory |

**Precedence**: More specific sources override general ones. A subdirectory GEMINI.md instruction overrides a project-level instruction on the same topic.

#### How Loading Works

1. On session start, the CLI scans all three tiers for GEMINI.md files
2. Contents of all found files are **concatenated** with separators indicating their origin path
3. The concatenated result is included in the **system prompt** sent with every model request
4. The footer displays a count of loaded context files as a visual indicator
5. JIT context files are loaded lazily — only when tools access a directory containing one

#### The `@file.md` Import Syntax

Large GEMINI.md files can be modularized using inline imports:

```markdown
# Project Context

@./architecture/overview.md
@./conventions/style-guide.md
@../shared/common-rules.md
```

- Supports **relative paths** (relative to the importing file) and **absolute paths**
- Only `.md` files are supported for import
- Imported content is inlined at the import location during concatenation
- This is processed by the "Memory Import Processor" — configurable via `context.importFormat` in settings.json

#### Custom Filename via `context.fileName`

The default filename `GEMINI.md` can be overridden in `settings.json`:

```json
{
  "context": {
    "fileName": ["AGENTS.md", "CONTEXT.md", "GEMINI.md"]
  }
}
```

Accepts a string or array of strings. When an array, files are searched in priority order. This is the mechanism for cross-tool compatibility (e.g., a repo that uses `AGENTS.md` for tool-agnostic agent instructions).

#### `/memory` Commands

| Command | Effect |
|---------|--------|
| `/memory show` | Display full concatenated context from all tiers |
| `/memory reload` | Force re-scan and reload of all GEMINI.md files |
| `/memory add <text>` | Append content to global `~/.gemini/GEMINI.md` |

### 1.2 The `save_memory` Tool

The built-in `save_memory` tool provides programmatic persistent memory:

- **Storage**: Appends facts as bullet items to a `## Gemini Added Memories` section in `~/.gemini/GEMINI.md`
- **Format**: Natural language statements stored as a bulleted Markdown list
- **Persistence**: Automatically included in hierarchical context for all future sessions
- **Invocation**: The model calls it autonomously when it identifies something worth remembering, or the user can say "remember that..."
- **No explicit size limits** documented

Example stored memories:
```markdown
## Gemini Added Memories
- User prefers functional programming style
- This project uses PostgreSQL 16 with pgvector
- Deploy target is us-central1 on Cloud Run
```

### 1.3 Persistent State Between Sessions

#### Session Storage

Sessions are stored at `~/.gemini/tmp/<project_hash>/chats/` where `<project_hash>` is derived from the project root path. Sessions are **project-specific** — switching directories switches session history.

**What gets saved per session**:
- User prompts and model responses
- All tool executions (inputs and outputs)
- Token usage statistics
- Assistant thoughts and reasoning summaries

**Retention policy** (configurable in settings.json):
- Default: 30 days
- `sessionRetention.maxAge`: Duration string (e.g., `"30d"`, `"7d"`)
- `sessionRetention.maxCount`: Maximum number of sessions
- `sessionRetention.minRetention`: Safety floor, default `"1d"`

Sessions can be resumed via `--resume [id]` flag or the interactive `/resume` command.

#### What Persists vs. What Doesn't

| Persists | Does Not Persist |
|----------|-----------------|
| GEMINI.md files (they're just files on disk) | Conversation context (must resume session) |
| `save_memory` facts (written to GEMINI.md) | Tool approval decisions (unless `enablePermanentToolApproval` is on) |
| Settings.json configuration | In-conversation corrections/preferences (unless explicitly saved) |
| Session transcripts (for resume) | Model state or learned behavior |

### 1.4 Does Gemini CLI Learn from Corrections?

**No automatic learning.** Gemini CLI does not accumulate preferences or learn from corrections across sessions. The model is stateless between sessions. Persistence is achieved exclusively through:

1. **GEMINI.md files** — manually authored or appended via `/memory add`
2. **`save_memory` tool** — the model can call this to persist facts it recognizes as important
3. **Session resume** — replays the full prior conversation into context

There is an experimental `memoryManager` setting (`experimental.memoryManager: true`) that replaces the basic `save_memory` with a sub-agent that more intelligently manages what to remember, but this is not enabled by default.

### 1.5 `.geminiignore`

Format follows `.gitignore` conventions exactly:

```gitignore
# Comments start with #
# Blank lines are ignored

# Standard glob patterns
*.log
*.tmp
node_modules/

# Anchored paths (relative to .geminiignore location)
/build/
/dist/

# Directory-only match (trailing slash)
__pycache__/

# Negation patterns (un-ignore)
!important.log
```

**Behavior**:
- Gemini CLI respects both `.gitignore` and `.geminiignore` when scanning directories
- Affects `@` file references, tool file operations, and context loading
- Can be placed at multiple levels in the project hierarchy
- Configurable via `context.fileFiltering.respectGeminiIgnore` (default `true`)
- Additional ignore files can be specified via `context.fileFiltering.customIgnoreFilePaths`
- Known issue: negation patterns (`!`) have reported bugs and may not work reliably ([#5444](https://github.com/google-gemini/gemini-cli/issues/5444))

### 1.6 Memory Bank Patterns (Community)

There is no official "memory bank" pattern like some community projects use with other tools. The community convention is straightforward:

1. **Global GEMINI.md** (`~/.gemini/GEMINI.md`) for personal preferences and cross-project rules
2. **Project GEMINI.md** for project-specific context, committed to the repo
3. **Modular imports** (`@file.md`) for large projects — break context into topic files
4. **`save_memory`** for runtime-discovered facts

Third-party extensions exist for more sophisticated memory (e.g., [gemini-mem](https://github.com/djinn-soul/gemini-mem) — SQLite-backed persistent memory with hooks), but there is no dominant community convention beyond the built-in mechanisms.

---

## 2. Skills System

### 2.1 Native Skills — Yes, Gemini CLI Has Them

Gemini CLI has a first-party Agent Skills system, enabled by default (`skills.enabled: true` in settings.json).

#### What Is a Skill?

A skill is a self-contained directory with a `SKILL.md` file that packages instructions, scripts, and assets into a discoverable, on-demand capability. Unlike GEMINI.md (always-loaded background context), skills are **loaded only when activated**, preserving context window space.

#### SKILL.md Format

```yaml
---
name: code-reviewer
description: Use this skill to review code for security vulnerabilities, performance issues, and style violations.
---

# Code Reviewer

## Instructions
When activated, analyze the provided code for:
1. Security vulnerabilities (injection, XSS, etc.)
2. Performance anti-patterns
3. Style guide violations per project conventions

## Process
1. Read the target files
2. Check against known vulnerability patterns
3. Generate a structured report

## Output Format
Use markdown with severity levels: CRITICAL, WARNING, INFO
```

**Required frontmatter fields**:
- `name` (string): Unique identifier, should match directory name
- `description` (string): What the skill does and when to use it — this is what the model reads during discovery

**Optional directory contents**:
- `scripts/` — Executable scripts the skill can reference
- `references/` — Reference documentation
- `assets/` — Templates, data files, examples

#### Skill Discovery (Three-Tier Hierarchy)

| Tier | Location | Scope | Precedence |
|------|----------|-------|------------|
| **Workspace** | `.gemini/skills/` or `.agents/skills/` | Team-shared, version-controlled | Highest |
| **User** | `~/.gemini/skills/` or `~/.agents/skills/` | Personal, cross-workspace | Medium |
| **Extension** | Bundled within installed extensions | Per-extension | Lowest |

Within each tier, `.agents/skills/` takes precedence over `.gemini/skills/`.

#### Progressive Disclosure (Lazy Loading)

1. **Discovery**: On startup, CLI scans all tiers and reads only the `name` and `description` from each SKILL.md frontmatter
2. **System prompt injection**: Skill names and descriptions are injected into the system prompt so the model knows what's available
3. **Activation**: When the model determines a skill matches the current task, it calls the `activate_skill` tool
4. **User consent**: User sees a confirmation prompt showing the skill name, purpose, and directory path
5. **Context injection**: Upon approval, the full SKILL.md content and directory listing are loaded into conversation history
6. **Execution**: Model proceeds with the skill's instructions guiding its behavior

#### Skill Management Commands

**Interactive (in-session)**:
| Command | Effect |
|---------|--------|
| `/skills list` | Display all discovered skills and their status |
| `/skills link <path>` | Create symlink to a skill directory |
| `/skills enable` / `disable` | Toggle skill availability |
| `/skills reload` | Refresh skill discovery |

**Terminal (CLI)**:
| Command | Effect |
|---------|--------|
| `gemini skills install <source>` | Add from Git repo, local dir, or `.skill` file |
| `gemini skills uninstall <name>` | Remove a skill |
| `gemini skills enable` / `disable` | Manage skill access |

#### Configuration

```json
{
  "skills": {
    "enabled": true,
    "disabled": ["skill-name-to-skip"]
  }
}
```

### 2.2 Agent Skills Spec Compatibility

**Yes, Gemini CLI supports the open Agent Skills spec.** The SKILL.md format used by Gemini CLI is the same open standard originally proposed by Anthropic and documented at agentskills.io. As of March 2026, this format is supported by 16+ tools including Claude Code, Gemini CLI, GitHub Copilot, Cursor, and others.

The portable discovery path `.agents/skills/` is specifically designed for cross-tool compatibility — skills placed there work across any tool that supports the spec.

### 2.3 Extensions System

Extensions are Gemini CLI's primary distribution mechanism for capabilities. They package multiple component types into a single installable unit.

#### Extension Components

| Component | Location in Extension | Purpose |
|-----------|----------------------|---------|
| MCP Servers | Declared in `gemini-extension.json` | External tool integrations |
| Custom Commands | `commands/*.toml` | Slash commands |
| Agent Skills | `skills/*/SKILL.md` | On-demand expertise |
| Hooks | `hooks/hooks.json` | Event-driven automation |
| Themes | Declared in manifest | Visual customization |
| Sub-agents | `agents/*.md` | Delegated AI agents (preview) |
| Context | `GEMINI.md` | Extension-specific instructions |
| Policies | `policies/*.toml` | Safety and security rules |

#### Extension Manifest (`gemini-extension.json`)

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "description": "Brief description for the gallery",
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${extensionPath}/server.js"],
      "cwd": "${extensionPath}"
    }
  },
  "excludeTools": ["run_shell_command(rm -rf)"],
  "settings": [
    {
      "name": "API Token",
      "description": "Your service API token",
      "envVar": "MY_EXT_TOKEN",
      "sensitive": true
    }
  ],
  "themes": [
    {
      "name": "dark-blue",
      "type": "custom",
      "background": { "primary": "#1a1b2e" },
      "text": { "primary": "#e0e0e0" }
    }
  ],
  "contextFileName": "GEMINI.md"
}
```

**Key manifest fields**:
- `name` (required): Lowercase with dashes, must be unique
- `version` (required): Semver
- `description` (required): Shown in gallery
- `mcpServers` (optional): MCP server configurations (all options except `trust`)
- `excludeTools` (optional): Tools to disable when extension is active
- `settings` (optional): User-configurable settings, prompted on install. Sensitive values go to system keychain.
- `themes` (optional): Color theme definitions
- `migratedTo` (optional): URL for extension relocation
- `contextFileName` (optional): Custom context file name, defaults to `GEMINI.md`
- `plan.directory` (optional): Planning artifact storage location

**Variable substitution** available in manifest and hooks:
- `${extensionPath}` — absolute extension directory path
- `${workspacePath}` — absolute current workspace path
- `${/}` — platform-specific path separator

### 2.4 MCP (Model Context Protocol) Integration

MCP servers are first-class citizens in Gemini CLI, configurable at user or project level.

#### Configuration in `settings.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "$GITHUB_TOKEN"
      }
    },
    "my-api": {
      "url": "https://my-mcp-server.example.com/sse",
      "headers": {
        "Authorization": "Bearer $API_TOKEN"
      },
      "timeout": 30000,
      "trust": true,
      "includeTools": ["query", "update"],
      "excludeTools": ["delete"]
    }
  },
  "mcp": {
    "allowed": ["github"],
    "excluded": ["untrusted-server"]
  }
}
```

**Per-server options**:

| Field | Type | Description |
|-------|------|-------------|
| `command` | string | Executable for stdio transport |
| `args` | array | Arguments for command |
| `env` | object | Environment variables for server process |
| `cwd` | string | Working directory |
| `url` | string | SSE endpoint |
| `httpUrl` | string | Streamable HTTP endpoint |
| `headers` | object | HTTP headers |
| `timeout` | number | Request timeout (ms) |
| `trust` | boolean | Bypass tool confirmation |
| `description` | string | Display description |
| `includeTools` | array | Tool allowlist |
| `excludeTools` | array | Tool blocklist (overrides include) |

**Important**: Avoid underscores in server aliases (use `"my-server"` not `"my_server"`) due to FQN parsing limitations. Tools from MCP servers get prefixed with `mcp_` and the server alias.

### 2.5 Custom Tools via Shell Commands

For users who don't want to run an MCP server, Gemini CLI supports custom tool discovery via shell commands:

```json
{
  "tools": {
    "discoveryCommand": "bin/get_tools",
    "callCommand": "bin/call_tool"
  }
}
```

- `discoveryCommand`: Must output a JSON array of `FunctionDeclaration` objects (Gemini API format)
- `callCommand`: Receives tool name as first argument, reads JSON args on stdin, returns JSON on stdout

### 2.6 Custom Slash Commands

Custom commands are TOML files placed in `commands/` directories:

**User-scoped**: `~/.gemini/commands/*.toml`
**Project-scoped**: `.gemini/commands/*.toml`

```toml
# .gemini/commands/review.toml
description = "Review the current diff for issues"
prompt = """
Review the following git diff for:
1. Security issues
2. Performance problems
3. Style violations

!{git diff --cached}
"""
```

**Naming**: File path determines command name. `commands/git/commit.toml` becomes `/git:commit`.

**Dynamic content**: Shell command output can be injected using `!{...}` syntax.
**Arguments**: User arguments available via `{{args}}`.

Reload without restart: `/commands reload`

### 2.7 Built-in Tools Reference

| Tool Name | Internal Name | Category | Requires Approval |
|-----------|---------------|----------|-------------------|
| Shell | `run_shell_command` | Execute | Yes |
| Find Files | `glob` | Search | No |
| Search Text | `grep_search` / `search_file_content` | Search | No |
| Read File | `read_file` | Read | No |
| Read Many Files | `read_many_files` | Read | No |
| List Directory | `list_directory` | Read | No |
| Edit File | `replace` | Edit | Yes |
| Write File | `write_file` | Edit | Yes |
| Google Search | `google_web_search` | Search | No |
| Web Fetch | `web_fetch` | Fetch | No |
| Save Memory | `save_memory` | Think | No |
| Ask User | `ask_user` | Communicate | No |
| Write Todos | `write_todos` | Other | No |
| Activate Skill | `activate_skill` | Other | Yes (user consent) |
| Enter Plan Mode | `enter_plan_mode` | Plan | No |
| Exit Plan Mode | `exit_plan_mode` | Plan | No |
| Get Internal Docs | `get_internal_docs` | Think | No |
| Codebase Investigator | `codebase_investigator` | Search | No |

**Tool management commands**: `/tools` (list active), `/tools desc` (list with descriptions)

### 2.8 Hooks System

Hooks are scripts executed at specific points in the agent loop, defined in `settings.json`:

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file|replace",
        "hooks": [
          {
            "name": "lint-check",
            "type": "command",
            "command": ".gemini/hooks/lint.sh",
            "timeout": 5000
          }
        ]
      }
    ],
    "AfterTool": [...],
    "SessionStart": [...],
    "SessionEnd": [...],
    "BeforeAgent": [...],
    "AfterAgent": [...],
    "BeforeModel": [...],
    "AfterModel": [...],
    "Notification": [...],
    "PreCompress": [...],
    "BeforeToolSelection": [...]
  }
}
```

**Communication protocol**: JSON over stdin/stdout, stderr for logs. Exit code 0 = success, exit code 2 = block the action.

**Hooks run synchronously** — the agent loop waits for all matching hooks to complete.

### 2.9 Tool Permissions Configuration

```json
{
  "tools": {
    "allowed": ["run_shell_command(git)", "run_shell_command(npm test)"],
    "exclude": ["web_fetch"],
    "core": ["read_file", "glob", "grep_search"]
  },
  "defaultApprovalMode": "default"
}
```

**Approval modes** (set via `defaultApprovalMode` or `--approval-mode`):

| Mode | Behavior |
|------|----------|
| `default` | Prompts for each mutating tool call |
| `auto_edit` | Auto-approves file edit tools, still prompts for shell |
| `plan` | Read-only mode — no mutations allowed |
| `yolo` | Auto-approves everything (enables sandbox by default) |

**Permanent approval**: When `security.enablePermanentToolApproval` is true, users get an "Allow for all future sessions" option.

---

## 3. Distribution & Marketplace

### 3.1 Official Extension Gallery

**Yes, there is an official marketplace**: [geminicli.com/extensions](https://geminicli.com/extensions/)

As of March 2026:
- **557 extensions** listed
- Browsable with search functionality
- Extensions ranked by GitHub stars
- Tagged by type: MCP, Context, Skills, Commands, Hooks

**Top extensions by stars** (March 2026):
| Extension | Stars | Description |
|-----------|-------|-------------|
| superpowers | ~104K | Multi-capability enhancement |
| context7 | ~50K | Context management |
| chrome-devtools-mcp | ~31K | Browser DevTools integration |
| github | ~28K | GitHub integration |

**Launch partners** include Dynatrace, Elastic, Figma, Harness, Postman, Shopify, Snyk, and Stripe.

**Important caveat**: "The extensions listed here are sourced from public repositories and created by third-party developers. Google does not vet, endorse, or guarantee the functionality or security of these extensions."

### 3.2 Installing Extensions

```bash
# From GitHub
gemini extensions install https://github.com/gemini-cli-extensions/workspace

# From local path
gemini extensions install ./my-local-extension

# List installed
gemini extensions list

# Update
gemini extensions update <name>

# Configure (v0.28.0+)
gemini extensions config <name>
```

Extensions are **copied** during installation (not symlinked), so `gemini extensions update` is required to pull source changes.

### 3.3 Publishing Extensions

Two distribution methods:

1. **Public Git repository** (simplest) — any public repo with a valid `gemini-extension.json` can be installed by URL
2. **GitHub Releases** — versioned distribution with `.skill` files

To appear in the official gallery, follow the Extension Releasing Guide on geminicli.com.

### 3.4 Google AI Studio Relationship

The relationship is **authentication only**:

- API keys are created and managed in [Google AI Studio](https://aistudio.google.com/)
- Each API key is tied to a Google Cloud project
- Gemini CLI consumes the key via `GEMINI_API_KEY` environment variable
- There is **no shared configuration** between AI Studio and CLI beyond the API key
- AI Studio is a web IDE; CLI is a terminal tool — they don't share sessions, context, or settings
- Vertex AI is an alternative backend (requires `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION`)

### 3.5 Configuration Portability

| What | Per-Machine | Per-Project | Portable |
|------|-------------|-------------|----------|
| `~/.gemini/settings.json` | Yes | No | Must be recreated per machine |
| `.gemini/settings.json` | No | Yes | Committed to repo, shared with team |
| `~/.gemini/GEMINI.md` | Yes | No | Personal, not shared |
| `./GEMINI.md` | No | Yes | Committed to repo |
| `~/.gemini/skills/` | Yes | No | Personal skills |
| `.gemini/skills/` | No | Yes | Project skills, version-controlled |
| `.agents/skills/` | No | Yes | Cross-tool portable skills |
| `~/.gemini/commands/` | Yes | No | Personal commands |
| `.gemini/commands/` | No | Yes | Project commands, shareable |
| Session data | Yes | Yes (project-scoped) | Not portable |
| Installed extensions | Yes | No | Must reinstall per machine |
| API keys / auth | Yes | No | Must configure per machine |

**Key portability insight for Context Monkey**: The project-level `.gemini/` directory is the portable unit. Everything in it (settings.json, GEMINI.md, skills, commands) travels with the repo. User-level `~/.gemini/` is machine-specific.

The `.agents/skills/` path is the most portable — it's recognized by Gemini CLI, Claude Code, and other tools that support the Agent Skills spec.

### 3.6 Community Resources

| Resource | URL | Description |
|----------|-----|-------------|
| Official docs | [geminicli.com/docs](https://geminicli.com/docs/) | Full documentation |
| GitHub repo | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | Source code, issues, discussions |
| Extension gallery | [geminicli.com/extensions](https://geminicli.com/extensions/) | 557+ browsable extensions |
| Extension org | [github.com/gemini-cli-extensions](https://github.com/gemini-cli-extensions) | Official extension repos |
| Awesome list | [Piebald-AI/awesome-gemini-cli](https://github.com/Piebald-AI/awesome-gemini-cli) | Curated community resources |
| Cheatsheet | [philschmid.de/gemini-cli-cheatsheet](https://www.philschmid.de/gemini-cli-cheatsheet) | Quick reference |
| Tutorial series | [Romin Irani on Medium](https://medium.com/google-cloud/gemini-cli-tutorial-series-part-9-understanding-context-memory-and-conversational-branching-095feb3e5a43) | 11-part deep dive |
| Tips & Tricks | [addyosmani.com/blog/gemini-cli](https://addyosmani.com/blog/gemini-cli/) | Practical patterns |
| Google Skills repo | [google-gemini/gemini-skills](https://github.com/google-gemini/gemini-skills) | Official skill examples |

### 3.7 Gemini API Extensions Ecosystem

The Gemini API extensions ecosystem is **separate** from Gemini CLI extensions:

- **Gemini API** is the underlying model API (REST/gRPC)
- **Gemini CLI** is a terminal client that uses the Gemini API
- **Gemini Code Assist** is Google's IDE extension (VS Code, JetBrains) — uses the same API but has its own configuration (`.aiexclude` instead of `.geminiignore`, etc.)
- **Gemini CLI extensions** are CLI-specific packages — they don't work in Code Assist or AI Studio
- The CLI has a VS Code companion extension ([Gemini CLI Companion](https://marketplace.visualstudio.com/items?itemName=Google.gemini-cli-vscode-ide-companion)) for IDE integration

---

## Appendix A: Complete Settings.json Reference

### Settings File Locations (Precedence Low to High)

1. Hardcoded defaults
2. System defaults: `/etc/gemini-cli/system-defaults.json`
3. User settings: `~/.gemini/settings.json`
4. Project settings: `.gemini/settings.json`
5. System settings: `/etc/gemini-cli/settings.json` (enterprise override)
6. Environment variables
7. Command-line arguments

### Key Settings Categories

<details>
<summary><strong>General</strong></summary>

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `vimMode` | boolean | `false` | Vim keybindings |
| `preferredEditor` | string | — | External editor for file ops |
| `defaultApprovalMode` | enum | `"default"` | `"default"`, `"auto_edit"`, `"plan"` |
| `enableAutoUpdate` | boolean | `true` | Check for updates |
| `enableNotifications` | boolean | — | macOS notifications |

</details>

<details>
<summary><strong>Model</strong></summary>

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `model.name` | string | — | Active model |
| `model.maxSessionTurns` | number | — | Conversation history limit (-1 = unlimited) |
| `model.compressionThreshold` | number | — | Context compression trigger (e.g., 0.5 = 50%) |
| `model.disableLoopDetection` | boolean | — | Disable infinite loop prevention |
| `model.summarizeToolOutput` | object | — | Per-tool output summarization with token budgets |

</details>

<details>
<summary><strong>Context & Memory</strong></summary>

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `context.fileName` | string/array | `"GEMINI.md"` | Context file name(s) |
| `context.includeDirectoryTree` | boolean | `true` | Include directory structure |
| `context.discoveryMaxDirs` | number | `200` | Max subdirectories to scan |
| `context.includeDirectories` | array | — | Additional workspace directories |
| `context.fileFiltering.respectGitIgnore` | boolean | `true` | Honor .gitignore |
| `context.fileFiltering.respectGeminiIgnore` | boolean | `true` | Honor .geminiignore |
| `context.fileFiltering.enableFuzzySearch` | boolean | `true` | Fuzzy file matching |

</details>

<details>
<summary><strong>Tools</strong></summary>

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `tools.allowed` | array | — | Tools that bypass confirmation |
| `tools.exclude` | array | — | Disabled tools |
| `tools.core` | array | — | Allowlist of built-in tools |
| `tools.discoveryCommand` | string | — | Shell command for custom tool discovery |
| `tools.callCommand` | string | — | Shell command for custom tool invocation |
| `tools.useRipgrep` | boolean | `true` | Use ripgrep for search |
| `tools.truncateToolOutputThreshold` | number | `40000` | Max chars for tool output |
| `tools.shell.enableInteractiveShell` | boolean | `true` | node-pty interactive shell |
| `tools.shell.inactivityTimeout` | number | `300` | Seconds without output before timeout |
| `tools.sandbox` | string/boolean | — | Sandbox mode: `"docker"`, `"podman"`, `"lxc"`, etc. |
| `tools.sandboxNetworkAccess` | boolean | `false` | Allow network in sandbox |

</details>

<details>
<summary><strong>Security</strong></summary>

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `security.disableYoloMode` | boolean | `false` | Block YOLO mode |
| `security.disableAlwaysAllow` | boolean | — | Remove persistent approval |
| `security.enablePermanentToolApproval` | boolean | — | Allow "always allow" option |
| `security.blockGitExtensions` | boolean | `false` | Block Git-based extension install |
| `security.folderTrust.enabled` | boolean | `true` | Folder-level trust |
| `security.enableConseca` | boolean | `false` | Context-aware security checker |
| `security.environmentVariableRedaction.enabled` | boolean | `false` | Mask secrets |

</details>

<details>
<summary><strong>Session</strong></summary>

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `checkpointing.enabled` | boolean | `false` | Recovery checkpoints |
| `sessionRetention.enabled` | boolean | `true` | Automatic cleanup |
| `sessionRetention.maxAge` | string | `"30d"` | Max session age |
| `sessionRetention.maxCount` | number | — | Max session count |

</details>

## Appendix B: Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | API key authentication |
| `GOOGLE_API_KEY` | Alternative API key |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account JSON path |
| `GOOGLE_CLOUD_PROJECT` | GCP project (Vertex AI) |
| `GOOGLE_CLOUD_LOCATION` | GCP region (Vertex AI) |
| `GEMINI_MODEL` | Default model override |
| `GEMINI_SANDBOX` | Sandbox mode |
| `GEMINI_SYSTEM_MD` | Custom system prompt path |
| `GEMINI_CLI_HOME` | Config directory override |
| `NO_COLOR` | Disable color output |

`.env` files are loaded automatically, searching upward from cwd to `.git` root or home directory.

## Appendix C: Comparison with Claude Code

| Feature | Claude Code | Gemini CLI |
|---------|-------------|------------|
| Context file | `CLAUDE.md` | `GEMINI.md` (configurable) |
| Context hierarchy | 3 levels (global, project, subdirectory) | 3 levels (global, workspace, JIT) |
| Context loading | All concatenated per session | All concatenated per session |
| Modular imports | Not native (convention-based) | `@file.md` syntax |
| Cross-tool context | `.agents/skills/` | `.agents/skills/` + `context.fileName` |
| Persistent memory | Auto-memory to MEMORY.md | `save_memory` to GEMINI.md |
| Skills | `.claude/skills/` with SKILL.md | `.gemini/skills/` with SKILL.md |
| Skills spec | Agent Skills (agentskills.io) | Agent Skills (same spec) |
| Progressive disclosure | Yes (name + description loaded, full on demand) | Yes (identical pattern) |
| Extensions/plugins | Not native | Full extension system with gallery |
| MCP support | Yes | Yes |
| Custom commands | `/` commands via skills | TOML-based slash commands |
| Hooks | Not native | Full hook system (11 event types) |
| Marketplace | No official marketplace | Official gallery (557+ extensions) |
| Session persistence | Conversation history | Full session with tool outputs |
| Tool permissions | Allowlist in settings | Allowlist + exclude + approval modes |
| Sandbox | Yes | Yes (Docker, Podman, LXC, macOS Seatbelt) |
| Custom tools | Via MCP | MCP + shell discovery/call commands |
| Ignore files | Not native (.gitignore only) | `.geminiignore` + `.gitignore` |
