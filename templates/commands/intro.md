---
description: Context Monkey introduction and command overview
allowed-tools: Glob, Read
---


# Intent

Provide a friendly introduction to Context Monkey and overview of available commands by reading the installed command files.

# Procedure

1. **Welcome message**: Introduce Context Monkey and its purpose
2. **Scan commands**: Use Glob to find all installed /monkey: commands  
3. **Read descriptions**: Extract descriptions from command files
4. **Present overview**: Show organized list of available commands with descriptions
5. **Project context**: Show status of .monkey/ configuration files
6. **Next steps**: Suggest getting started commands based on project state

# Execution

When this command runs, Claude Code will:

1. Display Context Monkey welcome and version information
2. Use Glob tool to scan `~/.claude/commands/monkey/*.md` (or `./.claude/commands/monkey/*.md` for local installs)
3. Use Read tool to extract description from each command file's frontmatter
4. Present categorized command overview:
   - **Analysis**: Commands for understanding your codebase
   - **Development**: Commands for coding assistance  
   - **Configuration**: Commands for managing project rules
5. Check for existing .monkey/ files and provide contextual next steps
6. Offer quick start suggestions based on project setup status

The intro command serves as a dynamic help system that stays current with installed commands and provides contextual guidance based on the project's Context Monkey configuration state.