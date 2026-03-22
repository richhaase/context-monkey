# OpenAI Codex Reference

Comprehensive reference for the OpenAI Codex coding agent system, covering memory, skills/agents, and distribution. Produced for the Context Monkey portability project.

**Last updated**: 2026-03-22

**Codex surfaces**: CLI (Rust, open-source), IDE extension (VS Code/Cursor/Windsurf), Desktop app, Codex Web (cloud, at chatgpt.com/codex)

---

## Table of Contents

1. [Memory System](#1-memory-system)
2. [Skills & Agents System](#2-skills--agents-system)
3. [Distribution & Marketplace](#3-distribution--marketplace)
4. [Appendix: Full config.toml Reference](#appendix-full-configtoml-reference)

---

## 1. Memory System

### Overview

Codex has a **genuine persistent memory system** that survives across sessions. It is not stateless. The memory system post-processes completed sessions ("rollouts") asynchronously at startup, extracting structured memories into a SQLite database and consolidating them into markdown files that are injected into future sessions.

This is architecturally significant: Codex is one of the few coding agents with built-in cross-session learning, not just project-level context injection.

### Memory Pipeline Architecture

The memory system runs as a background pipeline with two sequential phases:

#### Phase 1: Rollout Extraction

Triggered at startup for eligible past sessions. For each session:

1. Claims jobs via `claim_startup_jobs` with configurable parameters
2. Loads rollout items from `.jsonl` transcript files
3. Filters to memory-relevant response items
4. Calls the model with a structured output schema to extract:
   - `raw_memory` (string) — detailed markdown memory
   - `rollout_summary` (string) — compact summary line
   - `rollout_slug` (string | null) — filename-friendly label
5. Redacts secrets from all extracted fields
6. Stores results in SQLite (`stage1_outputs` table)
7. Enqueues Phase 2 on success

**Eligibility filters:**
- Session is not ephemeral
- Memory feature is enabled
- Session is not a sub-agent session
- Thread has `memory_mode = 'enabled'`
- Rollout is not from the current thread

#### Phase 2: Global Consolidation

A singleton job (`memory_consolidate_global`) that serializes all consolidation. Only runs when new Phase 1 data exists (watermark-gated).

**Consolidation sub-agent configuration:**
- Approval policy: `AskForApproval::Never`
- Sandbox: `WorkspaceWrite` with `codex_home` as writable root, no network
- Multi-agent/collaboration disabled (prevents recursive delegation)
- Model: configurable via `config.memories.consolidation_model`

**The sub-agent:**
1. Reads `raw_memories.md`, `MEMORY.md`, `rollout_summaries/*.md`, `memory_summary.md`, and `skills/*`
2. Operates in either INIT (first-time) or INCREMENTAL UPDATE mode
3. Produces/updates:
   - `MEMORY.md` — task-grouped handbook
   - `memory_summary.md` — user profile + tips (injected into system prompt)
   - Optionally `skills/<name>/SKILL.md` — learned reusable procedures
4. Applies forgetting for removed/polluted threads

### Filesystem Layout

All memory artifacts live under `<CODEX_HOME>/memories/`:

```
~/.codex/memories/
├── MEMORY.md                        # Consolidated handbook by task group
├── memory_summary.md                # User profile + tips; injected into system prompt
├── raw_memories.md                  # Merged Phase 1 raw_memory fields, latest-first
├── rollout_summaries/
│   ├── <timestamp>-<hash>.md        # Per-rollout summary (no slug)
│   └── <timestamp>-<hash>-<slug>.md # Per-rollout summary (with slug)
└── skills/
    └── <skill-name>/
        └── SKILL.md                 # Auto-generated reusable procedure
```

**Rollout summary filename format:** `<YYYY-MM-DDThh-mm-ss>-<4-char-base62-hash>[-<sanitized-slug>].md`

### SQLite Storage

State DB location: `<CODEX_HOME>/state_<version>.sqlite` (configurable via `sqlite_home` config key or `CODEX_SQLITE_HOME` env var).

| Table | Key Columns | Role |
|-------|------------|------|
| `jobs` | `kind`, `job_key`, `status`, `ownership_token`, `lease_until`, `retry_remaining` | Phase 1/2 job state machine |
| `stage1_outputs` | `thread_id`, `source_updated_at`, `raw_memory`, `rollout_summary`, `selected_for_phase2` | Per-thread Phase 1 extraction results |
| `threads` | `id`, `memory_mode`, `updated_at` | Thread registry; controls eligibility |

**Thread memory modes:**

| Value | Meaning |
|-------|---------|
| `enabled` | Eligible for Phase 1 extraction |
| `disabled` | Excluded (e.g., after fresh-start reset) |
| `polluted` | Contaminated (e.g., web search used); excluded and triggers Phase 2 forgetting |

### Memory Configuration

Available under `[memories]` in `config.toml`:

| Field | Phase | Purpose |
|-------|-------|---------|
| `max_rollouts_per_startup` | 1 | Max Stage 1 jobs claimed per startup |
| `max_rollout_age_days` | 1 | Exclude rollouts older than this window |
| `min_rollout_idle_hours` | 1 | Require rollout idle time before processing |
| `extract_model` | 1 | Model for extraction (optional override) |
| `max_raw_memories_for_consolidation` | 2 | Top-N stage-1 outputs to feed into Phase 2 |
| `max_unused_days` | 2 | Exclude memories not used within this window |
| `consolidation_model` | 2 | Model for the consolidation sub-agent |
| `no_memories_if_mcp_or_web_search` | Session | Disable memory if web/MCP used |

### Session History & Transcripts

Codex stores session transcripts locally. Configuration:

```toml
[history]
persistence = "save-all"  # or "none"
```

Sessions can be resumed via `codex resume`, which restores the transcript, plan history, and approval context.

---

### AGENTS.md — The Primary Context Mechanism

`AGENTS.md` is Codex's primary mechanism for injecting project-specific and personal instructions. It is loaded before every session and merged into the system prompt.

#### Discovery Order

Codex builds an instruction chain at startup (once per run):

1. **Global scope** (`~/.codex/`):
   - `AGENTS.override.md` (if it exists) — **OR** —
   - `AGENTS.md`
   - Only the first non-empty file at this level is used
2. **Project scope** (walking downward from Git root to current working directory):
   - At each directory level, checks in order:
     1. `AGENTS.override.md`
     2. `AGENTS.md`
     3. Fallback filenames from `project_doc_fallback_filenames` config
   - **At most one file per directory**
   - Skips empty files

#### Merging Rules

- Files are **concatenated** from root down, joined with blank lines
- Files closer to the current directory appear **later** in the combined prompt, effectively overriding earlier guidance
- Combined size is capped by `project_doc_max_bytes` (default: **32 KiB**); Codex stops adding files once this limit is reached

#### Configuration

```toml
# In ~/.codex/config.toml
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
project_doc_max_bytes = 65536  # raise the 32 KiB default
```

**Disable entirely:** `--no-project-doc` flag or `CODEX_DISABLE_PROJECT_DOC=1` environment variable.

#### AGENTS.override.md

At any directory level, `AGENTS.override.md` **replaces** `AGENTS.md` at that level. It does not supplement — it substitutes entirely. This enables:

- **Personal global overrides**: `~/.codex/AGENTS.override.md` replaces your global `AGENTS.md`
- **Project-level temporary overrides**: Place in a directory to override instructions without modifying the shared `AGENTS.md`
- **Debugging**: If wrong guidance appears, look for an `AGENTS.override.md` higher in the directory tree

#### `~/.codex/AGENTS.md` — Global Instructions

Personal global guidance that applies to all projects. Typical contents:

- Coding style preferences
- Preferred languages and frameworks
- Communication preferences
- Default review standards

Merged with project-level `AGENTS.md` files (global instructions appear first, project instructions appear later and can override).

#### Hierarchical AGENTS.md (Feature Flag)

When `child_agents_md` is enabled in `[features]`, Codex appends additional guidance about scope and precedence to the user instructions, even when no `AGENTS.md` is present.

### What Persists Between Sessions

| What | How | Where |
|------|-----|-------|
| Extracted memories | Phase 1 + Phase 2 pipeline | `~/.codex/memories/` + SQLite |
| User profile & tips | `memory_summary.md` (injected into system prompt) | `~/.codex/memories/memory_summary.md` |
| Learned procedures | Auto-generated skills | `~/.codex/memories/skills/` |
| Session transcripts | `history.jsonl` | `~/.codex/` (configurable) |
| Configuration | `config.toml` | `~/.codex/config.toml` |
| Project instructions | `AGENTS.md` files | Per-repo, committed to source |
| Credentials | File or keyring | `~/.codex/` |

**Codex does accumulate learned preferences over time.** The memory system extracts user preferences, coding patterns, and project knowledge from completed sessions and consolidates them into `memory_summary.md`, which is injected into future system prompts.

---

## 2. Skills & Agents System

### Agent Skills (SKILL.md Format)

Codex supports the open **Agent Skills** standard (originally developed by Anthropic, adopted by OpenAI and 30+ other tools). Skills are the primary extension mechanism.

#### SKILL.md Specification

A skill is a directory containing at minimum a `SKILL.md` file:

```
skill-name/
├── SKILL.md          # Required: YAML frontmatter + markdown instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: additional documentation
├── assets/           # Optional: templates, resources
└── agents/
    └── openai.yaml   # Optional: Codex-specific UI metadata
```

**Required frontmatter fields:**

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | Max 64 chars. Lowercase `a-z`, digits, hyphens. Must match parent directory name. No leading/trailing/consecutive hyphens. |
| `description` | Yes | Max 1024 chars. Describes what the skill does and when to use it. |

**Optional frontmatter fields:**

| Field | Constraints |
|-------|-------------|
| `license` | License name or reference to bundled LICENSE file |
| `compatibility` | Max 500 chars. Environment requirements (product, packages, network) |
| `metadata` | Arbitrary key-value map (e.g., `author`, `version`) |
| `allowed-tools` | Space-delimited list of pre-approved tools (experimental) |

**Example:**

```yaml
---
name: pdf-processing
description: Extract PDF text, fill forms, merge files. Use when handling PDFs.
license: Apache-2.0
metadata:
  author: example-org
  version: "1.0"
compatibility: Requires Python 3.14+ and uv
allowed-tools: Bash(git:*) Bash(jq:*) Read
---

## Steps
1. Check if the input file exists...
```

#### Progressive Disclosure

Skills are loaded in stages to conserve context:

1. **Metadata** (~100 tokens): `name` and `description` loaded at startup for all skills
2. **Instructions** (< 5000 tokens recommended): Full `SKILL.md` body loaded when skill is activated
3. **Resources** (as needed): `scripts/`, `references/`, `assets/` loaded only when required

Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files.

#### Skill Discovery Locations

Codex searches hierarchically:

| Scope | Path | Notes |
|-------|------|-------|
| Repository | `.agents/skills/` in cwd, parent dirs, and repo root | Project-specific skills |
| User | `$HOME/.agents/skills/` | Personal skills |
| Admin | `/etc/codex/skills/` | System-wide skills |
| System | Built-in skills bundled with Codex | Ship with the CLI |

Symlinked skill folders are followed automatically.

#### Invocation

- **Explicit**: `$skillname` in the composer or `/skills` command
- **Implicit**: Codex autonomously selects skills when task descriptions match metadata

#### Installation

Via the built-in `$skill-installer`:

```bash
# Curated skills (by name)
$skill-installer gh-address-comments

# Experimental skills (by URL or description)
$skill-installer install https://github.com/openai/skills/tree/main/skills/.experimental/create-plan
```

Restart Codex after installation.

#### Skill Configuration in config.toml

```toml
# Disable a skill without deleting it
[[skills.config]]
path = "/path/to/skill/SKILL.md"
enabled = false
```

#### Codex-Specific Metadata (agents/openai.yaml)

```yaml
interface:
  display_name: "User-facing name"
  icon_small: "./assets/small-logo.svg"
  brand_color: "#3B82F6"

policy:
  allow_implicit_invocation: false

dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
```

---

### Custom Agents (Subagents)

Codex supports spawning specialized subagents for parallel work. Custom agents are defined as TOML files.

#### Custom Agent TOML Format

Location:
- **Personal**: `~/.codex/agents/<name>.toml`
- **Project**: `.codex/agents/<name>.toml`

Each file defines one agent.

**Required fields:**

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Identifier used when spawning. Source of truth (filename is convention only). |
| `description` | string | When Codex should use this agent |
| `developer_instructions` | string | Core behavioral instructions defining the agent's role |

**Optional fields:**

| Field | Type | Purpose |
|-------|------|---------|
| `nickname_candidates` | string[] | Display names for spawned instances (presentation-only). ASCII letters, digits, spaces, hyphens, underscores. |
| `model` | string | Override the default model |
| `model_reasoning_effort` | string | `"minimal"`, `"low"`, `"medium"`, `"high"`, `"xhigh"` |
| `sandbox_mode` | string | `"read-only"`, `"workspace-write"`, `"danger-full-access"` |
| `mcp_servers` | table | MCP server configurations for this agent |
| `skills.config` | array | Skill enable/disable toggles |

**Example custom agent:**

```toml
# ~/.codex/agents/pr-reviewer.toml

name = "pr-reviewer"
description = "Reviews pull requests for correctness, security, and style"
developer_instructions = """
You are a code reviewer. Focus on:
1. Correctness: logic bugs, edge cases, error handling
2. Security: injection, auth issues, data exposure
3. Style: consistency with project conventions
Do NOT suggest cosmetic changes. Prioritize actionable findings.
"""

model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
nickname_candidates = ["Atlas", "Beacon", "Cedar"]

[mcp_servers.openaiDeveloperDocs]
url = "https://developers.openai.com/mcp"

[[skills.config]]
path = "/path/to/review-skill/SKILL.md"
enabled = true
```

#### Built-in Agents

Codex ships with three default agents:

| Agent | Purpose |
|-------|---------|
| `default` | General-purpose fallback |
| `worker` | Execution-focused (implementation, fixes) |
| `explorer` | Read-heavy (codebase exploration) |

Custom agents with matching names **override** built-in ones.

#### Global Subagent Settings

```toml
# In config.toml
[agents]
max_threads = 6          # Concurrent thread limit (default: 6)
max_depth = 1            # Nesting depth (default: 1, children only)
job_max_runtime_seconds = 1800  # Per-worker timeout for CSV batch jobs
```

#### Subagent Capabilities

- Independent model and tool access per agent
- Inherit parent's sandbox policy (runtime overrides reapply to children)
- Can use MCP servers independently
- Approval requests surface from inactive threads with source labels
- `/agent` command to switch threads and inspect progress
- Press `o` to open threads before approving

#### CSV Batch Processing (Experimental)

The `spawn_agents_on_csv` tool enables data-parallel work:
- Reads source CSV, spawns one worker per row
- Workers call `report_agent_job_result` exactly once
- Combined results exported to output CSV

---

### Comparison: Skills vs. Custom Agents

| Aspect | Skills (SKILL.md) | Custom Agents (TOML) |
|--------|-------------------|---------------------|
| Format | Markdown + YAML frontmatter | TOML |
| Standard | Open (agentskills.io) | Codex-proprietary |
| Purpose | Instructions, procedures, workflows | Specialized agent configurations |
| Scope | Cross-platform portable | Codex-only |
| Contains | Instructions, scripts, references | Model, sandbox, MCP, instructions |
| Discovery | `.agents/skills/` hierarchy | `~/.codex/agents/` or `.codex/agents/` |
| Invocation | `$name` or implicit matching | Spawned as subagent threads |

---

## 3. Distribution & Marketplace

### Official Skills Catalog

OpenAI maintains a skills catalog at [github.com/openai/skills](https://github.com/openai/skills):

- ~14.9k GitHub stars, 870 forks, 35+ curated skills (as of March 2026)
- Skills organized into three tiers:
  - **`.system`** — Auto-installed with latest Codex
  - **`.curated`** — Optional, installed via `$skill-installer`
  - **`.experimental`** — Development stage, requires explicit installation

#### Installation

```bash
# Curated skill by name
$skill-installer gh-address-comments

# Experimental skill by URL
$skill-installer install https://github.com/openai/skills/tree/main/skills/.experimental/create-plan
```

### No Official Marketplace (Yet)

As of March 2026, there is **no official OpenAI marketplace** with ratings, visual browsing, or one-click installation. The biggest gap is discovery. Skills are shared via:

- GitHub repositories
- The `openai/skills` catalog
- Direct filesystem installation

**Community alternatives:**
- [SkillsMP](https://skillsmp.com) — Independent community project that aggregates and showcases agent skills from GitHub
- [LobeHub Skills Marketplace](https://lobehub.com/skills) — Third-party directory

### Agent Skills Open Standard (agentskills.io)

The SKILL.md format is an open standard, originally developed by Anthropic and adopted broadly:

**Supported platforms (30+):**

| Platform | Type |
|----------|------|
| OpenAI Codex | CLI + Cloud |
| Claude Code | CLI |
| Claude (platform) | API |
| Cursor | IDE |
| VS Code (Copilot) | IDE |
| GitHub Copilot | Platform |
| Gemini CLI | CLI |
| JetBrains Junie | IDE |
| Goose (Block) | CLI |
| OpenHands | Platform |
| Roo Code | IDE |
| Amp | CLI |
| Mistral Vibe | CLI |
| Databricks | Platform |
| Snowflake Cortex Code | Platform |
| Spring AI | Framework |
| Laravel Boost | Framework |
| And many more... | |

This broad adoption makes SKILL.md the most portable agent extension format available.

### AGENTS.md Sharing

`AGENTS.md` files are shared by committing them to repositories. There is no separate sharing mechanism — they travel with the codebase. This is their strength: project context stays with the project.

### Codex & ChatGPT Relationship

- **Authentication**: Codex CLI can authenticate via ChatGPT login (Plus, Pro, Team, Enterprise, Edu plans) or API key
- **Shared billing**: Codex usage counts against ChatGPT plan limits
- **Codex Web**: Accessible at chatgpt.com/codex, runs tasks in cloud sandbox containers
- **Codex App**: Desktop application (macOS, Windows, Linux) launched March 2026
- **No shared configuration**: `config.toml` and `AGENTS.md` are Codex-specific; ChatGPT has its own memory system

### Codex Sandbox Architecture

#### CLI / IDE (Local)

| Platform | Mechanism | Details |
|----------|-----------|---------|
| macOS 12+ | Apple Seatbelt (`sandbox-exec`) | Read-only jail except writable roots (`$PWD`, `$TMPDIR`, `~/.codex`). Network fully blocked. |
| Linux | Landlock + seccomp (when available) | OS-level filesystem and syscall restrictions. Docker recommended for full isolation. |
| Windows | Elevated/unelevated sandbox | Configurable via `[windows] sandbox = "elevated"` |

**Sandbox modes:**

| Mode | Behavior |
|------|----------|
| `read-only` | Can read files, cannot write or execute commands |
| `workspace-write` | Can read/write files in workspace, limited command execution |
| `danger-full-access` | Full filesystem and network access (use with caution) |

**Permissions profiles** (fine-grained):

```toml
[permissions.restricted]
[permissions.restricted.filesystem]
"/path/to/repo" = "read-write"
"/tmp" = "read-write"

[permissions.restricted.network]
enabled = true
mode = "limited"
allowed_domains = ["api.openai.com", "registry.npmjs.org"]
```

#### Codex Web (Cloud)

Cloud tasks run in isolated OpenAI-managed containers:

1. **Container creation**: Checks out repo at selected branch/commit
2. **Setup phase**: Runs setup script **with** full internet access (for `npm install`, etc.)
3. **Agent phase**: Internet **off** by default (configurable to limited or unrestricted)
4. **Completion**: Displays results and file diffs, offers PR creation

**Key properties:**
- Based on `codex-universal` container image (pre-installed common languages/tools)
- Container caches persist up to 12 hours
- Setup scripts run in separate Bash session (exports don't persist; use `~/.bashrc`)
- Environment variables active throughout; secrets decrypted only during execution, removed before agent phase
- All outbound traffic routes through HTTP/HTTPS proxy

**Portability implication:** The cloud sandbox is completely isolated. There is no access to `~/.codex/` configuration, personal agents, or local skills unless they're committed to the repository.

### Programmatic Management

#### Codex SDK (TypeScript)

```bash
npm install @openai/codex-sdk
```

```typescript
import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = await codex.startThread();
const result = await thread.run("fix the failing tests");

// Resume later
const resumed = await codex.resumeThread(thread.id);
```

Requires Node.js 18+.

#### Codex CLI (Non-Interactive)

```bash
# Quiet mode with JSON output
codex -q --json "explain utils.ts"

# Exec subcommand for automation
codex exec "update CHANGELOG for next release"

# Full auto with no interaction
codex -a full-auto "create the todo-list app"
```

#### GitHub Action (`openai/codex-action@v1`)

```yaml
- name: Review PR with Codex
  uses: openai/codex-action@v1
  with:
    prompt: "Review this PR for correctness and security issues"
    model: gpt-5.4
    sandbox: read-only
    safety-strategy: drop-sudo
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_KEY }}
```

**Inputs:** `prompt`, `prompt-file`, `codex-args`, `model`, `effort`, `sandbox`, `output-file`, `codex-version`, `codex-home`, `safety-strategy`, `unprivileged-user`, `read-only`, `allow-users`, `allow-bots`

**Output:** `final-message` — last Codex response text

#### Environment Variables

| Variable | Purpose |
|----------|---------|
| `CODEX_HOME` | Override default `~/.codex/` home directory |
| `CODEX_SQLITE_HOME` | Override SQLite state DB location |
| `CODEX_DISABLE_PROJECT_DOC` | Disable AGENTS.md loading (`=1`) |
| `CODEX_QUIET_MODE` | Silence interactive UI (`=1`) |
| `CODEX_CA_CERTIFICATE` | Custom root CA bundle path |
| `SSL_CERT_FILE` | Fallback CA bundle (if CODEX_CA_CERTIFICATE unset) |
| `DEBUG` | Enable verbose logging (`=true`) |

---

## Appendix: Full config.toml Reference

Location: `~/.codex/config.toml` (user), `.codex/config.toml` (project, requires trust), `/etc/codex/config.toml` (system)

JSON Schema: `https://developers.openai.com/codex/config-schema.json`

**Loading precedence (highest to lowest):**
1. CLI flags and `--config` overrides
2. Profile values (`--profile <name>`)
3. Project config (`.codex/config.toml`, closest to cwd wins; trusted projects only)
4. User config (`~/.codex/config.toml`)
5. System config (`/etc/codex/config.toml`)
6. Built-in defaults

### Top-Level Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `model` | string | `"gpt-5-codex"` | Default model identifier |
| `model_provider` | string | `"openai"` | Provider ID |
| `model_context_window` | number | — | Available context tokens |
| `model_auto_compact_token_limit` | number | — | Auto-compaction threshold |
| `model_reasoning_effort` | enum | — | `"minimal"`, `"low"`, `"medium"`, `"high"`, `"xhigh"` |
| `model_reasoning_summary` | enum | — | `"auto"`, `"concise"`, `"detailed"`, `"none"` |
| `model_verbosity` | enum | — | GPT-5 override: `"low"`, `"medium"`, `"high"` |
| `plan_mode_reasoning_effort` | string | — | Plan-mode-specific reasoning override |
| `personality` | enum | — | `"none"`, `"friendly"`, `"pragmatic"` |
| `sandbox_mode` | enum | `"read-only"` | `"read-only"`, `"workspace-write"`, `"danger-full-access"` |
| `approval_policy` | string/enum | — | `"untrusted"`, `"on-request"`, `"never"`, or granular |
| `default_permissions` | string | — | Default permissions profile name |
| `web_search` | enum | `"cached"` | `"disabled"`, `"cached"`, `"live"` |
| `developer_instructions` | string | — | Additional session-level guidance |
| `model_instructions_file` | string | — | Replace built-in instructions |
| `hide_agent_reasoning` | bool | — | Suppress reasoning display |
| `log_dir` | string | — | Log file location |
| `file_opener` | string | — | URI scheme: `"vscode"`, `"cursor"`, `"windsurf"`, etc. |
| `project_doc_fallback_filenames` | string[] | — | Extra filenames to try when `AGENTS.md` missing |
| `project_doc_max_bytes` | number | `32768` | Max combined AGENTS.md size |
| `project_root_markers` | string[] | `[".git"]` | Files indicating project roots |
| `allow_login_shell` | bool | `true` | Permit login-shell semantics |
| `profile` | string | — | Default profile name |

### Authentication

| Key | Type | Description |
|-----|------|-------------|
| `forced_login_method` | enum | `"chatgpt"` or `"api"` |
| `forced_chatgpt_workspace_id` | string | Limit ChatGPT logins to specific workspace UUID |
| `cli_auth_credentials_store` | enum | `"file"`, `"keyring"`, `"auto"` |
| `openai_base_url` | string | Override OpenAI API endpoint |

### `[agents]` — Subagent Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `max_threads` | number | `6` | Concurrent agent thread limit |
| `max_depth` | number | `1` | Max nesting depth |
| `job_max_runtime_seconds` | number | `1800` | Per-worker timeout for CSV jobs |
| `<name>.description` | string | — | Agent selection guidance |
| `<name>.config_file` | string | — | Path to role-specific config |

### `[features]` — Feature Flags

| Key | Status | Default | Description |
|-----|--------|---------|-------------|
| `shell_tool` | stable | enabled | Default shell command execution |
| `unified_exec` | stable | enabled (not Windows) | PTY-backed execution tool |
| `multi_agent` | stable | enabled | Spawning/managing agent threads |
| `undo` | stable | disabled | Session undo operations |
| `prevent_idle_sleep` | experimental | — | Block system sleep during active turns |
| `child_agents_md` | — | — | Hierarchical AGENTS.md scope guidance |

### `[mcp_servers.<id>]` — MCP Server Configuration

| Key | Type | Description |
|-----|------|-------------|
| `command` | string | Launcher command (stdio transport) |
| `url` | string | Endpoint (HTTP transport) |
| `enabled` | bool | Activation flag |
| `enabled_tools` | string[] | Allow-list of tool names |
| `disabled_tools` | string[] | Deny-list of tool names |
| `env` | table | Environment variable mappings |
| `startup_timeout_sec` | number | Server init timeout (default: 10s) |
| `tool_timeout_sec` | number | Per-tool timeout (default: 60s) |

### `[permissions.<name>]` — Permissions Profiles

| Key | Type | Description |
|-----|------|-------------|
| `filesystem` | table | Per-path access rules (read/write/none) |
| `network.enabled` | bool | Network access toggle |
| `network.mode` | enum | `"limited"` or `"full"` |
| `network.allowed_domains` | string[] | Whitelist |
| `network.denied_domains` | string[] | Blacklist |
| `network.enable_socks5` | bool | Expose SOCKS5 listener |
| `network.allow_local_binding` | bool | Permit bind/listen |

### `[profiles.<name>]` — Named Configuration Sets

Any top-level setting can be overridden per profile. Activated via `codex --profile <name>`.

| Key | Type | Description |
|-----|------|-------------|
| `service_tier` | enum | `"flex"` or `"fast"` |
| `personality` | enum | Communication style override |
| `model_instructions_file` | string | Profile-scoped instruction replacement |

### `[model_providers.<id>]` — Custom Providers

| Key | Type | Description |
|-----|------|-------------|
| `base_url` | string | API endpoint |
| `env_key` | string | Environment variable for API credentials |
| `http_headers` | table | Static headers |
| `requires_openai_auth` | bool | Require OpenAI authentication |
| `wire_api` | string | API format (e.g., `"responses"` for Azure) |
| `stream_idle_timeout_ms` | number | SSE idle threshold (default: 300000) |

### `[shell_environment_policy]` — Environment Inheritance

| Key | Type | Description |
|-----|------|-------------|
| `inherit` | enum | `"none"` or `"core"` base policy |
| `exclude` | string[] | Glob patterns to exclude |
| `include` | string[] | Glob patterns to include |

Automatic KEY/SECRET/TOKEN filtering applies before custom rules.

### `[tui]` — Terminal UI

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `animations` | bool | `true` | Terminal animations |
| `notifications` | bool/string[] | — | Event type notifications |
| `alternate_screen` | enum | `"auto"` | `"auto"`, `"always"`, `"never"` |
| `status_line` | string[]/null | — | Footer status-line items |
| `theme` | string | — | Syntax highlighting theme |

### `[history]` — Transcript Persistence

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `persistence` | enum | `"save-all"` | `"save-all"` or `"none"` |

### `[otel]` — OpenTelemetry

| Key | Type | Description |
|-----|------|-------------|
| `exporter` | enum | `"none"`, `"otlp-http"`, `"otlp-grpc"` |
| `trace_exporter` | string | Separate tracer config |
| `log_user_prompt` | bool | Opt-in prompt export |

### `[analytics]`

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `enabled` | bool | `true` | Metrics collection |

### `[tools.web_search]`

| Key | Type | Description |
|-----|------|-------------|
| `context_size` | number | Search result context |
| `allowed_domains` | string[] | Domain whitelist |
| `location` | string | Geolocation hint |

### `[windows]`

| Key | Type | Description |
|-----|------|-------------|
| `sandbox` | enum | `"elevated"` or `"unelevated"` |

---

## Sources

- [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Configuration Reference](https://developers.openai.com/codex/config-reference)
- [Config Basics](https://developers.openai.com/codex/config-basic)
- [Advanced Configuration](https://developers.openai.com/codex/config-advanced)
- [Sample Configuration](https://developers.openai.com/codex/config-sample)
- [Subagents](https://developers.openai.com/codex/subagents)
- [Agent Skills](https://developers.openai.com/codex/skills)
- [CLI Features](https://developers.openai.com/codex/cli/features)
- [Security](https://developers.openai.com/codex/security)
- [Cloud Environments](https://developers.openai.com/codex/cloud/environments)
- [Codex SDK](https://developers.openai.com/codex/sdk)
- [GitHub Action](https://developers.openai.com/codex/github-action)
- [Memory System (DeepWiki)](https://deepwiki.com/openai/codex/3.7-memory-system)
- [OpenAI Skills Catalog](https://github.com/openai/skills)
- [Agent Skills Standard](https://agentskills.io)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Codex Repository](https://github.com/openai/codex)
- [Codex CLI README (legacy TS)](https://github.com/openai/codex/blob/main/codex-cli/README.md)
