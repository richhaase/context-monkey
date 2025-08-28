---
description: Deep research on a specific topic or component
argument-hint: "[topic]"
allowed-tools: Task, WebSearch, WebFetch, Bash
---

# Intent

Provide in-depth research and analysis on a specific topic, combining repository analysis with current internet research for comprehensive understanding.

# Implementation

Use the general-purpose agent to conduct thorough research combining:

1. **Get Current Date** - Run `date` command to determine current timeframe for research
2. **Repository Analysis** - Examine existing code, patterns, and implementations
3. **Current External Research** - Search web for latest documentation, best practices, libraries (prioritize recent information)
4. **Synthesis** - Combine repo context with current external knowledge
5. **Actionable Summary** - Provide comprehensive understanding with next steps
6. **Follow-up Options** - Suggest specific aspects for further exploration

The agent should first determine the current date to ensure web searches prioritize the most recent and relevant information.