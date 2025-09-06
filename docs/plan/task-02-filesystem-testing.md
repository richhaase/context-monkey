# Task 02: File System & Utils Testing

**Status**: Planned  
**Estimated Time**: 1-2 days  
**Complexity**: High  
**Prerequisites**: Task 01 (Jest Foundation)  
**Dependencies**: Jest framework established  

## Overview

Create comprehensive tests for `lib/utils/files.js` module, focusing on path validation, template processing, and security features that are critical for context-monkey's safe operation.

## Objectives

- Test all functions in `lib/utils/files.js`
- Verify path validation security features
- Test template processing with Mustache
- Cover error handling scenarios
- Achieve 90%+ test coverage for files module

## Implementation Steps

### Step 1: Analyze Target Module
Review `lib/utils/files.js` functions:
- `validatePath(filePath, allowedDir)` - Security validation
- `loadProjectContext()` - Read .monkey/ files
- `copyFileWithTemplate(src, dest, context)` - Template processing
- `ensureDirectoryExists(dirPath)` - Directory creation

### Step 2: Create Test Fixtures
```bash
mkdir -p tests/fixtures/templates
mkdir -p tests/fixtures/contexts
```

Create sample templates and context files for testing.

### Step 3: Write Security Tests
Focus on path traversal attacks:
```javascript
describe('validatePath security', () => {
  test('should reject path traversal attacks', () => {
    expect(() => validatePath('../../../etc/passwd', '/safe/dir')).toThrow();
    expect(() => validatePath('/absolute/path', '/safe/dir')).toThrow();
    expect(() => validatePath('..\\windows\\path', '/safe/dir')).toThrow();
  });
});
```

### Step 4: Write Template Processing Tests
```javascript
describe('copyFileWithTemplate', () => {
  beforeEach(() => {
    mockFs({
      '/templates/test.mustache': 'Hello {{name}}!',
      '/output': {}
    });
  });

  test('should process mustache templates correctly', async () => {
    await copyFileWithTemplate(
      '/templates/test.mustache',
      '/output/result.txt',
      { name: 'World' }
    );
    
    const result = fs.readFileSync('/output/result.txt', 'utf8');
    expect(result).toBe('Hello World!');
  });
});
```

### Step 5: Write Context Loading Tests
Test `.monkey/` file reading:
```javascript
describe('loadProjectContext', () => {
  test('should load stack.md and rules.md', async () => {
    mockFs({
      '.monkey/stack.md': '# Stack Info\nNode.js project',
      '.monkey/rules.md': '# Rules\nUse TypeScript'
    });

    const context = await loadProjectContext();
    expect(context.stack).toContain('Node.js project');
    expect(context.rules).toContain('Use TypeScript');
  });
});
```

## Files to Create

### Test Files
- `tests/lib/utils/files.test.js` - Main test suite
- `tests/fixtures/templates/sample.mustache` - Template fixture
- `tests/fixtures/templates/complex.mustache` - Complex template
- `tests/fixtures/contexts/basic.json` - Basic context data
- `tests/fixtures/contexts/complete.json` - Full context data

### Helper Files
- `tests/helpers/mock-fs-helper.js` - File system mocking utilities
- `tests/helpers/template-helper.js` - Template testing utilities

## Expected Outcomes

- Complete test coverage for file utilities
- Security path validation verified
- Template processing edge cases covered
- Error scenarios properly tested
- Mock file system working reliably

## Acceptance Criteria

- [ ] 90%+ test coverage for `lib/utils/files.js` module
- [ ] Path traversal attacks blocked and tested
- [ ] Template processing works with mock data
- [ ] All error conditions tested
- [ ] Context loading from `.monkey/` files tested
- [ ] File system operations work with mock-fs
- [ ] Security validation prevents malicious paths

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complex file system mocking | High | Medium | Use comprehensive mock fixtures and test incrementally |
| Security validation testing | Medium | High | Create specific attack vectors for testing |
| Template processing edge cases | Medium | Medium | Test with various template complexities |
| Mock-fs limitations | Medium | Low | Have fallback to real temp directories if needed |

## Test Categories

### Unit Tests
- Individual function testing
- Pure logic validation
- Error condition handling

### Integration Tests  
- File operations with templates
- Context injection workflow
- Directory creation and validation

### Security Tests
- Path traversal prevention
- Input validation
- File permission handling

## Definition of Done

- All acceptance criteria met
- Tests pass consistently
- Security vulnerabilities covered
- Edge cases documented and tested
- Ready for template testing (Task 04)

## Notes

- Focus on security testing - this module handles file system operations
- Use realistic template fixtures that match actual usage
- Test both Unix and Windows path handling
- Mock file system should be restored after each test
- Consider async/await patterns in testing