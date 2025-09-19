# Multi-Agent Command Templating Proposal

## Context

Context Monkey's command set was authored first for Claude Code, where rich features such as subagents, Task tool invocations, and notification hooks are available. As we extend support to Codex CLI, Gemini CLI, and future assistants, we need an architecture that:

- **Keeps the shared baseline useful everywhere** – Commands should behave sensibly in the lowest-common-denominator environment without assuming Claude-specific capabilities.
- **Adds enhancements when agents support them** – Claude (and any future agent with similar power) should get subagent orchestration, extra tooling, or richer context injection as additive behavior layered on top of the generic version.
- **Remains template/config driven** – Adding a new agent or feature should mostly involve editing configuration or supplying an override snippet, not duplicating whole commands.

## Requirements

1. **Generic first** – The default template for every command should be platform-neutral: clear intent, step-by-step instructions, and generic tool usage (read files, run shell commands, etc.).
2. **Optional Specialization** – Agents advertise capabilities (e.g., `supportsSubagents`, `supportsHooks`), and the renderer conditionally merges in extra sections only when the agent can use them.
3. **Reusable Blueprint Data** – Subagent prompts and contextual files remain in `resources/agents/` and `@.cm/*`; the renderer decides whether to inline or reference them depending on the target agent.
4. **Config-Driven Overrides** – Per-agent enhancements live in configuration (e.g., `agents.ts`) or optional template snippets (`command.claude.md`, `<!-- agent:claude -->` blocks).
5. **Future Agent Friendly** – A new assistant that only supports basic text prompts should work immediately by consuming the generic template. Extra capabilities can be added later by updating configuration.

## Command Template Hierarchy

### File layout

- **Base template**: `resources/commands/<name>.md`
  - Must contain the generic workflow text that any agent can execute.
- **Agent override file (optional)**: `resources/commands/<name>.<agent>.md`
  - `<agent>` is the lowercased identifier from `TargetAgent` (`claude`, `codex`, `gemini`, etc.).
  - When present, this file is merged on top of the base template for that agent.
- **Inline conditional blocks (optional)** inside the base template:

  ```md
  <!-- agent:claude -->

  Claude-specific subagent instructions.

  <!-- /agent -->

  <!-- agent:codex -->

  Codex-specific tweaks.

  <!-- /agent -->

  <!-- agent:default -->

  Generic fallback (optional; defaults to base content).

  <!-- /agent -->
  ```

  - Blocks can appear multiple times. The renderer includes only those whose agent tag matches the current agent or `default`.
  - Nested blocks are not supported; blocks must be well formed (matching closing tag on the same indentation level).
  - When both an override file and inline block exist, the override file takes precedence (renderer loads override file content and then processes inline blocks inside it).

### Agent capability flags

Define capabilities in `src/config/agents.ts`:

```ts
export interface AgentCapabilities {
  subagents: boolean;
  notificationHooks: boolean;
  contextFiles: boolean; // expects @.cm/ behaviour
  blueprintMode: 'skip' | 'inline';
  blueprintHeadingDepth: number; // base heading level when inlining
  blueprintDrops: RegExp[]; // headings to remove when inlining
  blueprintReplacements: Array<{ pattern: RegExp; replace: string }>;
}
```

Example entries:

```ts
export const AGENT_CONFIG: Record<TargetAgent, AgentCapabilities> = {
  [TargetAgent.CLAUDE_CODE]: {
    subagents: true,
    notificationHooks: true,
    contextFiles: true,
    blueprintMode: 'skip', // do not inline agent blueprint (delegates to subagent)
    blueprintHeadingDepth: 2, // unused when skip
    blueprintDrops: [],
    blueprintReplacements: [],
  },
  [TargetAgent.CODEX_CLI]: {
    subagents: false,
    notificationHooks: false,
    contextFiles: false,
    blueprintMode: 'inline',
    blueprintHeadingDepth: 2,
    blueprintDrops: [/^Execution/i],
    blueprintReplacements: [
      { pattern: /@\.cm\/[\w\-.]+/g, replace: 'project documentation' },
      { pattern: /\bsubagent(s)?\b/gi, replace: 'assistant workflow$1' },
    ],
  },
  [TargetAgent.GEMINI_CLI]: {
    subagents: false,
    notificationHooks: false,
    contextFiles: false,
    blueprintMode: 'inline',
    blueprintHeadingDepth: 3,
    blueprintDrops: [/^Execution/i],
    blueprintReplacements: [
      { pattern: /@\.cm\/[\w\-.]+/g, replace: 'project documentation' },
      { pattern: /\bsubagent(s)?\b/gi, replace: 'assistant workflow$1' },
    ],
  },
};
```

## Blueprint Injection Rules

- The renderer parses `resources/agents/cm-*.md` via gray-matter into `{ metadata, sections }`.
- When a command references an agent (detected during template load), the renderer uses the capability config:
  - If `blueprintMode === 'skip'` → no inline content (Claude delegates to subagents).
  - If `inline` →
    1. Drop any headings matching `blueprintDrops` (e.g., "Execution").
    2. Normalize heading depth so the top-level heading becomes `blueprintHeadingDepth`.
    3. Apply `blueprintReplacements` to text (remove `@.cm/...`, rename "Task tool", etc.).
    4. Prepend a heading `#{depth} Agent Blueprint: ${displayName}` and include metadata (description/tools) before the transformed body.
- The inline block is appended at the end of the rendered prompt under a horizontal rule (`---`).
- Future agents can set `blueprintMode` to another value (e.g., `reference`) if they prefer linking instead of inlining.

## Renderer Workflow (Implementation Checklist)

1. **Template selection**
   - Load base template; if `<command>.<agent>.md` exists, use that as the starting content.
   - Process inline `<!-- agent:... -->` blocks, including those whose tag matches the target agent or the literal `default`.
2. **Agent reference tracking**
   - During template load, record occurrences of `cm-<name>` in frontmatter or body to know which blueprints to inline.
3. **Blueprint injection**
   - For each referenced agent:
     - Fetch capability config.
     - If `inline`, use the rules above to generate the injected section.
4. **Generic replacements**
   - Apply per-agent replacements (already handled today – e.g., `/cm:` → `/cm-` for Codex).
5. **Output formatting**
   - Claude/Codex: write Markdown.
   - Gemini: convert to TOML command with triple-quoted prompt (sanitize `"""`).

## Command Categories & To-Do

| Command         | Status                                                                                                                                                              | Notes |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| add-rule        | Base template OK; ensure references to `@.cm/rules.md` explain manual steps                                                                                         |
| edit-rule       | Same as above                                                                                                                                                       |
| list-rules      | Same as above                                                                                                                                                       |
| deep-dive       | Needs generic prompt + Claude override                                                                                                                              |
| docs            | Needs generic prompt; current version causes Gemini to scaffold the CLI. Create generic instructions, then guard Claude subagent block with `<!-- agent:claude -->` |
| explain-repo    | Needs generic rewrite                                                                                                                                               |
| onboard-project | Should work generically; verify                                                                                                                                     |
| plan            | Needs generic rewrite                                                                                                                                               |
| review-code     | Needs generic rewrite                                                                                                                                               |
| stack-scan      | Needs generic rewrite                                                                                                                                               |

## Acceptance Criteria

After implementation:

- **Claude**: commands still delegate to subagents and behave as today.
- **Codex**: running `/cm:<command>` executes the generic instructions without referencing subagents or creating Context Monkey files.
- **Gemini**: no command writes into `resources/` or `src/`; prompts explain what to analyze and generate.
- **Future agent onboarding**: To add a new agent, define its `AgentCapabilities` entry, create optional override blocks, and ensure the generic template already produces sensible results.

## Migration Plan

1. Implement renderer support for conditional blocks, override files, and capability-driven merging.
2. Refactor Tier-1 commands to provide generic content + Claude override blocks.
3. Update agent configs for Codex/Gemini to inline the appropriate blueprint sections.
4. Validate rendered output for all commands across agents (manual QA + snapshot tests).
5. Document the process in the README/SETUP for maintainers adding new commands or agents.

With this structure, generic prompts become the foundation, and richer agents like Claude attach specialized behavior declaratively through configuration and targeted overrides.
