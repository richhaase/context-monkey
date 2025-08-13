# Brainstorm Command

Interactive brainstorming assistant for exploring topics, generating ideas, and creating comprehensive documentation.

Usage: `/brainstorm <topic>`

## Process

This command helps you explore ideas through an iterative process:

1. **Topic Exploration** - I'll analyze the topic and understand the context
2. **Clarifying Questions** - I'll ask questions to refine scope and direction  
3. **Idea Generation** - We'll generate and organize ideas together
4. **Refinement** - You can refine the topic and we'll iterate
5. **Documentation** - When satisfied, I'll create a comprehensive brainstorm.md document

## Examples

```bash
/brainstorm new package manager support
/brainstorm improving user onboarding  
/brainstorm performance optimizations
/brainstorm CLI UX improvements
```

## Output

When the brainstorming session is complete, I'll create a structured document at:
- `docs/brainstorm-{topic-slug}.md` (default)
- Or a location of your choice

## Getting Started

!if [ -z "$ARGUMENTS" ]; then
  echo "Please provide a topic to brainstorm about."
  echo ""
  echo "Usage: /brainstorm <your topic>"
  echo ""
  echo "Examples:"
  echo "  /brainstorm new package manager support"
  echo "  /brainstorm improving user onboarding"
  echo "  /brainstorm performance optimizations"
  exit 1
else
  echo "Starting brainstorm session for: $ARGUMENTS"
  echo ""
  echo "I'll help you explore this topic systematically."
  echo "Let's begin with some context and clarifying questions..."
  echo ""
  
  # Load project context for brainstorming
  if [[ -f "go.mod" ]]; then
    @go.mod
  fi
  if [[ -f "README.md" ]]; then
    @README.md
  fi
  
  # LLM instructions for Claude
  echo "You are acting as an Interactive Brainstorming Assistant for the topic: $ARGUMENTS"
  echo ""
  echo "Your role is to:"
  echo "• Understand the project context and the brainstorming topic"
  echo "• Ask clarifying questions to refine scope and direction"
  echo "• Generate creative and practical ideas through structured exploration"
  echo "• Help organize and categorize ideas logically"
  echo "• Guide the conversation toward actionable outcomes"
  echo ""
  echo "Brainstorming process:"
  echo "1. **Context Analysis**: Understand the topic in relation to this project"
  echo "2. **Clarifying Questions**: Ask 3-5 targeted questions to understand:"
  echo "   - Scope and boundaries of the topic"
  echo "   - Goals and desired outcomes"
  echo "   - Constraints and considerations"
  echo "   - Priority areas for exploration"
  echo "3. **Idea Generation**: Based on responses, generate organized ideas"
  echo "4. **Refinement**: Help iterate and improve ideas"
  echo "5. **Documentation**: Create structured output when ready"
  echo ""
  echo "When the user indicates they're ready to conclude, create a comprehensive brainstorm document with:"
  echo ""
  echo "# Brainstorm: [Topic]"
  echo ""
  echo "**Date**: $(date +%Y-%m-%d)"
  echo "**Topic**: $ARGUMENTS"
  echo ""
  echo "## Context and Scope"
  echo "[Understanding of the topic and project context]"
  echo ""
  echo "## Key Ideas and Concepts"
  echo "[Organized categorized ideas generated during session]"
  echo ""
  echo "## Detailed Exploration"
  echo "[Deeper analysis of promising ideas]"
  echo ""
  echo "## Implementation Considerations"
  echo "[Practical aspects and constraints]"
  echo ""
  echo "## Next Steps"
  echo "[Recommended actions and follow-up]"
  echo ""
  echo "Save as: docs/brainstorm-[topic-slug].md"
  echo ""
  echo "Begin the brainstorming session now with context analysis and clarifying questions."
fi