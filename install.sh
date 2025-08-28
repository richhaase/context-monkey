#!/bin/bash
set -euo pipefail

# Context Monkey Installation Script
# Deploy Claude Code context rules to any repository
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/richhaase/context-monkey/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/richhaase/context-monkey/main/install.sh | bash -s -- --force

REPO_URL="https://raw.githubusercontent.com/richhaase/context-monkey/main"
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force|-f)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo "Context Monkey Installer"
            echo ""
            echo "Usage:"
            echo "  curl -fsSL URL | bash"
            echo "  curl -fsSL URL | bash -s -- --force"
            echo ""
            echo "Options:"
            echo "  --force, -f    Overwrite existing files"
            echo "  --help, -h     Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Check if we're in a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "Error: Must be run from within a git repository" >&2
    exit 1
fi

# Check for existing installation
if [[ -f "CLAUDE.md" ]] && [[ "$FORCE" != "true" ]]; then
    echo "Context Monkey already installed. Use --force to overwrite."
    exit 1
fi

echo "Installing Context Monkey..."

# Create directories  
mkdir -p .claude/commands/cxm

# Download files with error checking
download_file() {
    local url="$1"
    local output="$2"
    
    if ! curl -fsSL "$url" -o "$output"; then
        echo "Error: Failed to download $url" >&2
        exit 1
    fi
}

# Download main context file
echo "📋 Installing main context file..."
download_file "$REPO_URL/context/context.md" "CLAUDE.md"

# Download command files
echo "🔧 Installing commands..."
commands=("add-rule" "edit-rule" "plan-change" "review-code" "stack-scan")
for cmd in "${commands[@]}"; do
    download_file "$REPO_URL/commands/${cmd}.md" ".claude/commands/cxm/${cmd}.md"
done

# Add to .gitignore if it exists
if [[ -f ".gitignore" ]] && ! grep -q "^\.cxm/\*\.md$" .gitignore; then
    echo "" >> .gitignore
    echo "# Context Monkey generated files" >> .gitignore
    echo ".cxm/*.md" >> .gitignore
fi

echo ""
echo "✅ Context Monkey installed successfully!"
echo ""
echo "Next steps:"
echo "1. Run '/stack-scan' in Claude Code to detect your tech stack"
echo "2. Use '/add-rule' to create project-specific development rules"
echo "3. Use '/plan-change' for deep planning of complex changes"
echo ""
echo "Files installed:"
echo "  CLAUDE.md              - Main context file"
echo "  .claude/commands/cxm/  - Slash commands (5 files)"