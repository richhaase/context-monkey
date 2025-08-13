# Workflow State Validation

## Document Validation

Before any state-modifying operation:
1. **Structure Check**: Verify YAML frontmatter is valid and complete
2. **Content Validation**: Ensure required fields are present and properly formatted
3. **Relationship Check**: Verify references between documents are valid
4. **State Consistency**: Check workflow state is logically consistent

## Error Detection

Common issues to detect:
- Invalid phase status transitions
- Missing dependencies or circular references
- Corrupted YAML frontmatter
- Conflicting agent modifications
- Broken document references

## Recovery Procedures

When validation fails:
1. **Stop Operation**: Do not proceed with state changes
2. **Diagnose Issue**: Clearly identify what validation failed
3. **Suggest Fix**: Provide specific steps to resolve the problem
4. **Safe Mode**: Offer read-only operations while issues are resolved

## State Repair

For common issues, provide repair instructions:
- YAML syntax errors → Show correct syntax
- Invalid status transitions → Explain valid progression
- Missing dependencies → Identify what needs to be completed
- Broken references → Show how to fix document links

## Validation Checks

### YAML Structure Validation
```bash
# Check if YAML frontmatter is valid
if ! head -20 "$DOC" | grep -q "^---$"; then
  echo "Error: Missing YAML frontmatter delimiter"
  exit 1
fi

# Validate required fields exist
REQUIRED_FIELDS="type status"
for field in $REQUIRED_FIELDS; do
  if ! grep -q "$field:" "$DOC"; then
    echo "Error: Missing required field: $field"
    exit 1
  fi
done
```

### Status Transition Validation
```bash
# Validate status transitions are allowed
CURRENT_STATUS=$(grep "status:" "$DOC" | head -1 | cut -d' ' -f4)
VALID_NEXT_STATUS="ready_to_implement in_progress completed needs_specification"

validate_transition() {
  local current="$1"
  local next="$2"
  
  case "$current" in
    "planned") [[ "$next" == "ready_to_implement" ]] ;;
    "ready_to_implement") [[ "$next" == "in_progress" ]] ;;
    "in_progress") [[ "$next" == "completed" || "$next" == "needs_specification" ]] ;;
    "completed") [[ "$next" == "in_progress" ]] ;;  # Allow rework after review
    "needs_specification") [[ "$next" == "ready_to_implement" ]] ;;
    *) false ;;
  esac
}
```

## Document Integrity Checks

Ensure documents maintain referential integrity:
- Implementation plans reference valid strategic plan phases
- Phase dependencies exist and are properly formatted
- File paths in references are valid and accessible
- Cross-references between documents are bidirectional