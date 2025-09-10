---
name: docs
description: "Interactive documentation generator for project README, architecture, setup guides, and changelogs"
subagent: cm-doc-generator
---

# Generate Project Documentation

Interactive documentation generation for your project.

## Description

The `/monkey:docs` command launches an interactive documentation generator that analyzes your codebase and creates comprehensive project documentation based on your selection.

## Features

- **README.md**: Project overview, installation instructions, and usage guide
- **ARCHITECTURE.md**: System design, components, and architectural decisions  
- **SETUP.md**: Development environment and installation guide
- **CHANGELOG.md**: Version history generated from git commits
- **Batch Generation**: Option to generate/update all documentation at once

## Usage

```
/monkey:docs
```

The command will present an interactive menu allowing you to select which documentation to generate or update.

## Context Awareness

The documentation generator uses your project's context:
- **Stack Detection**: Analyzes @.monkey/stack.md for technology-specific instructions
- **Project Rules**: Respects conventions from @.monkey/rules.md
- **Existing Docs**: Preserves manual content while updating generated sections
- **Git History**: Uses commit messages for changelog generation

## Generated Documentation Quality

- ✅ **Accurate**: All information verified against actual codebase
- ✅ **Complete**: Covers essential aspects for each document type
- ✅ **Maintainable**: Structured for easy updates and maintenance
- ✅ **User-Focused**: Tailored for intended audience
- ✅ **Consistent**: Follows project conventions and style

Use this command when you need to create or update project documentation efficiently while maintaining accuracy and consistency.

---

## Command Definition

```yaml
name: docs
description: "Interactive documentation generator for project README, architecture, setup guides, and changelogs"
subagent: cm-doc-generator
version: "{{version}}"
```