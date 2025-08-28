---
description: Deep, critical planning for a change (smart, option-aware, read-only). Never edits, never runs commands, never writes files without explicit approval.
argument-hint: "<goal…>"
allowed-tools: Read, Glob, Grep
---

# Intent
Given the goal: "$ARGUMENTS", produce a high-quality plan that shows real engineering judgment:
- Understand the problem and context.
- Explore multiple approaches with trade-offs.
- Identify risks, unknowns, and dependencies.
- Specify exactly what to change and how to prove it works.
- Remain strictly read-only (no shell, no edits, no writes).

# Clarification gate (ask only if truly necessary)
- If the goal is ambiguous on **requirements** or **acceptance**, ask up to **3 targeted questions** maximum.
- If unanswered, proceed using the smallest, safest **explicit assumptions** and label them clearly.

# Procedure (thinking checklist — do not execute commands)
1) **Restate goal & constraints** from loaded project context (CLAUDE.md + imports). Note scope boundaries (what’s in/out).
2) **Current state snapshot**: using Read/Glob/Grep, list the modules/paths likely involved and the hot data/control paths (paths only).
3) **Options analysis (2–3 alternatives)**:
   - For each option: short description, *why it fits*, complexity level, blast radius, performance/latency implications, migration cost.
   - Choose a **recommended approach** and explain briefly *why*.
4) **Design sketch (recommended)**:
   - Interfaces/contracts to add/change (names & locations).
   - Data model or schema impacts.
   - Error handling & boundary rules to enforce.
   - Backwards compatibility notes (public APIs, flags).
5) **Step-by-step plan (≤7 steps)**:
   - Order changes to minimize risk and diff size.
   - Include feature flags or config toggles if helpful.
6) **Test plan (evidence first)**:
   - Unit: cases & file locations.
   - Integration: key scenarios, data setup.
   - Regression: previous bugs to cover.
   - Performance checks: what to measure and thresholds.
7) **Observability & rollout**:
   - Logs/metrics/traces to add or watch.
   - Rollout strategy (flagged, canary, or dark-launch).
8) **Docs & comms**:
   - Files/sections to update (README/CHANGELOG/API/ADR).
   - One-line **Decision Log** entry text to copy/paste.
9) **Risks & mitigations**:
   - Top risks, detection signals, mitigations.
   - **Backout plan** (exact steps/files to revert).
10) **Acceptance checklist**:
   - Concrete checks a reviewer will run to accept the change.

# Output format (exact — keep headers)
```md
## Goal & Constraints
- …

## Current State (paths only)
- …

## Options & Trade-offs
- Option A — …
- Option B — …
**Recommendation:** …

## Design Sketch (recommended)
- Interfaces/contracts: …
- Data/schema: …
- Error & boundaries: …
- Compatibility: …

## Plan (≤7 steps)
1. …

## Test Plan
- Unit: …
- Integration: …
- Regression: …
- Performance: …

## Observability & Rollout
- …

## Docs & Comms
- …

## Risks & Mitigations
- …

## Backout Plan
- …

## Acceptance Checklist
- …
```


# Write rule
Do **not** edit or write files. After showing the plan, you may *offer once* to save it under `docs/plans/<timestamp>-<short-slug>.md` (or a location the user prefers) **only if the user explicitly approves**.

