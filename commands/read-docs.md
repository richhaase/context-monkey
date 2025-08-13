---
description: "Read all markdown documentation files into context, with optional filtering"
---

# Read Documentation Files

This command finds and reads markdown files into context.

Usage:
- `/read-docs` - reads all .md files in the project
- `/read-docs search_term` - reads .md files matching *search_term*.md

## Finding and reading files

!if [ -z "$ARGUMENTS" ]; then
  echo "Finding all .md files in the project..."
  find . -name "*.md" -type f -not -path "./.claude/*" | head -20
else
  echo "Finding .md files matching pattern: *$ARGUMENTS*.md"
  find . -name "*$ARGUMENTS*.md" -type f -not -path "./.claude/*" | head -20
fi

Reading all matching files into context:

!if [ -z "$ARGUMENTS" ]; then
  for file in $(find . -name "*.md" -type f -not -path "./.claude/*"); do
    echo "@$file"
  done
else
  for file in $(find . -name "*$ARGUMENTS*.md" -type f -not -path "./.claude/*"); do
    echo "@$file"
  done
fi