# Task 04: Template Processing Tests

**Status**: Planned  
**Estimated Time**: 2 days  
**Complexity**: High  
**Prerequisites**: Tasks 01-02 (Testing foundation)  
**Dependencies**: File system testing established  

## Overview

Create specialized tests for Mustache template processing, context injection, and template generation accuracy. This is critical since context-monkey's core functionality revolves around template processing.

## Objectives

- Test all template types in `/templates/` directory
- Verify context injection from `.monkey/` files
- Validate template rendering accuracy
- Test template security and error handling
- Create integration tests for full template workflow

## Implementation Steps

### Step 1: Inventory Template Files
Analyze existing templates:
```bash
find templates/ -name "*.mustache" -type f
```

Expected template types:
- Command templates (`/commands/`)
- Agent templates (`/agents/`)
- Configuration templates

### Step 2: Create Template Test Fixtures
```bash
mkdir -p tests/fixtures/templates
mkdir -p tests/fixtures/contexts
mkdir -p tests/fixtures/expected-outputs
```

Create sample contexts matching real `.monkey/` file structure:
```javascript
// tests/fixtures/contexts/sample-project.json
{
  "stack": "# Sample Stack\\nNode.js + Express",
  "rules": "# Sample Rules\\nUse TypeScript",
  "projectName": "sample-project",
  "description": "Sample project for testing"
}
```

### Step 3: Test Template Rendering
```javascript
describe('Template Processing', () => {
  test('should render command templates correctly', async () => {
    const context = await loadFixture('sample-project.json');
    const template = fs.readFileSync('templates/commands/analyze.mustache', 'utf8');
    
    const result = Mustache.render(template, context);
    
    expect(result).toContain(context.stack);
    expect(result).toContain(context.rules);
    expect(result).not.toContain('{{'); // No unresolved variables
  });
});
```

### Step 4: Test Context Injection
```javascript
describe('Context Injection', () => {
  test('should inject .monkey/ file contents', async () => {
    mockFs({
      '.monkey/stack.md': '# Test Stack\\nReact + TypeScript',
      '.monkey/rules.md': '# Test Rules\\nUse Jest for testing'
    });

    const context = await loadProjectContext();
    
    expect(context.stack).toContain('React + TypeScript');
    expect(context.rules).toContain('Use Jest for testing');
  });
});
```

### Step 5: Test Template Security
```javascript
describe('Template Security', () => {
  test('should reject malicious template content', () => {
    const maliciousContext = {
      projectName: '{{#lambda}}{{/lambda}}',
      stack: '<script>alert("xss")</script>'
    };

    expect(() => {
      Mustache.render('{{projectName}}', maliciousContext);
    }).not.toThrow(); // Mustache should be safe by default
  });
});
```

### Step 6: Integration Tests
Test full install workflow:
```javascript
describe('Template Installation Integration', () => {
  test('should install command with proper context', async () => {
    mockFs({
      '.monkey/stack.md': '# Stack\\nNode.js CLI',
      '.monkey/rules.md': '# Rules\\nUse Commander.js',
      'templates/commands/test.mustache': 'Stack: {{stack}}\\nRules: {{rules}}'
    });

    await installCommand('test', '/tmp/output');
    
    const result = fs.readFileSync('/tmp/output/test', 'utf8');
    expect(result).toContain('Node.js CLI');
    expect(result).toContain('Commander.js');
  });
});
```

## Files to Create

### Test Files
- `tests/lib/commands/install.test.js` - Installation workflow tests
- `tests/lib/commands/upgrade.test.js` - Upgrade workflow tests  
- `tests/lib/commands/uninstall.test.js` - Uninstall workflow tests
- `tests/templates/` - Template-specific tests

### Fixture Files
- `tests/fixtures/templates/sample-command.mustache`
- `tests/fixtures/templates/sample-agent.mustache`
- `tests/fixtures/contexts/minimal.json`
- `tests/fixtures/contexts/complete.json`
- `tests/fixtures/expected-outputs/` - Expected template outputs

### Helper Files
- `tests/helpers/template-helper.js` - Template testing utilities
- `tests/helpers/context-helper.js` - Context generation utilities

## Expected Outcomes

- All template types tested for correct rendering
- Context injection from `.monkey/` files verified
- Template security validated
- Edge cases and error conditions covered
- Integration workflow tested end-to-end

## Acceptance Criteria

- [ ] All 13+ templates tested for correct rendering
- [ ] Context injection from `.monkey/` files verified
- [ ] Security validation prevents malicious templates
- [ ] Error handling for corrupted templates
- [ ] Integration tests cover install/upgrade/uninstall workflows
- [ ] Template variables properly substituted
- [ ] No unresolved Mustache variables in output

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Template complexity makes testing difficult | High | Medium | Break down into smaller test cases per template |
| Context injection edge cases | Medium | Medium | Create comprehensive fixture data |
| Mustache rendering edge cases | Medium | High | Test with various data types and edge cases |
| Template file synchronization | Low | Medium | Keep fixture templates in sync with real ones |

## Test Categories

### Unit Tests
- Individual template rendering
- Context variable substitution
- Error handling for malformed templates

### Integration Tests
- Full install/upgrade workflow
- Context loading and injection
- File system operations with templates

### Security Tests
- Malicious context injection
- Template injection attacks
- Path traversal in template names

## Template Test Matrix

| Template Type | Context Required | Expected Output | Security Concerns |
|---------------|------------------|-----------------|-------------------|
| Commands | stack, rules, projectName | Executable command files | Path injection |
| Agents | stack, rules, description | Agent configuration | Content injection |
| Configs | projectName, settings | Configuration files | Setting validation |

## Definition of Done

- All acceptance criteria met
- Template rendering tests pass consistently
- Security vulnerabilities addressed
- Integration with file system testing working
- Ready for CLI integration testing (Task 08)

## Notes

- Focus on actual template files in `/templates/` directory
- Use realistic context data that matches real `.monkey/` files
- Test both successful rendering and error conditions
- Ensure template security doesn't allow code injection
- Consider template versioning and compatibility testing