# Task 09: Multi-Node Version Testing

**Status**: Planned  
**Estimated Time**: 1 day  
**Complexity**: Medium  
**Prerequisites**: Task 03 (Basic GitHub Actions CI)  
**Dependencies**: Basic CI pipeline working  

## Overview

Extend CI pipeline to test against multiple Node.js versions, ensuring compatibility across supported versions and catching version-specific issues early.

## Objectives

- Test against Node.js LTS versions (16, 18, 20, latest)
- Configure matrix strategy in GitHub Actions
- Handle version-specific differences
- Optimize CI execution time
- Update documentation with supported versions

## Implementation Steps

### Step 1: Update GitHub Actions Workflow
Modify `.github/workflows/ci.yml` to use matrix strategy:
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20, 'latest']
      fail-fast: false # Continue testing other versions if one fails
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint:check
      
    - name: Check code formatting
      run: npm run format:check
      
    - name: Run tests
      run: npm test
      
    - name: Security Audit
      run: npm audit --audit-level moderate
```

### Step 2: Handle Version-Specific Dependencies
Create `package.json` engines field if not present:
```json
{
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=7.0.0"
  }
}
```

### Step 3: Version-Specific Test Configuration
Create version-specific test configurations if needed:
```javascript
// tests/helpers/version-helper.js
const semver = require('semver');

function getNodeMajorVersion() {
  return parseInt(process.version.slice(1).split('.')[0]);
}

function skipIfNodeVersion(version, reason) {
  if (getNodeMajorVersion() === version) {
    return test.skip;
  }
  return test;
}

module.exports = {
  getNodeMajorVersion,
  skipIfNodeVersion
};
```

### Step 4: Add Version-Specific Tests
Create `tests/compatibility/node-versions.test.js`:
```javascript
const { getNodeMajorVersion } = require('../helpers/version-helper');

describe('Node.js Version Compatibility', () => {
  test('should work with current Node.js version', () => {
    const version = getNodeMajorVersion();
    expect(version).toBeGreaterThanOrEqual(16);
  });

  test('should handle fs-extra correctly across versions', async () => {
    const fs = require('fs-extra');
    
    // Test fs-extra functionality that might vary between Node versions
    const tempDir = '/tmp/version-test';
    await fs.ensureDir(tempDir);
    await fs.writeFile(`${tempDir}/test.txt`, 'version test');
    
    const content = await fs.readFile(`${tempDir}/test.txt`, 'utf8');
    expect(content).toBe('version test');
    
    await fs.remove(tempDir);
  });

  test('should handle async/await patterns consistently', async () => {
    // Test patterns that might behave differently across Node versions
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
```

### Step 5: Update Package Scripts
Add version testing scripts to `package.json`:
```json
{
  "scripts": {
    "test:node16": "NODE_VERSION=16 npm test",
    "test:node18": "NODE_VERSION=18 npm test",
    "test:node20": "NODE_VERSION=20 npm test",
    "test:all-versions": "npm run test:node16 && npm run test:node18 && npm run test:node20"
  }
}
```

### Step 6: Create Version Compatibility Documentation
Create `docs/compatibility.md`:
```markdown
# Node.js Version Compatibility

## Supported Versions

- Node.js 16.x (LTS) - Minimum supported version
- Node.js 18.x (LTS) - Recommended version
- Node.js 20.x (LTS) - Latest LTS
- Node.js Latest - Current stable release

## Version-Specific Notes

### Node.js 16.x
- Minimum version due to fs-extra requirements
- Some ES2022 features may not be available
- Use CommonJS module syntax

### Node.js 18.x
- Full ES2022 support
- Improved performance for file operations
- Recommended for development

### Node.js 20.x
- Latest LTS with all modern features
- Best performance characteristics
- Future-proof choice

## Testing Strategy

All versions are tested in CI to ensure compatibility.
Version-specific issues are documented and addressed.
```

### Step 7: Add Performance Benchmarking
Create `tests/performance/version-performance.test.js`:
```javascript
describe('Performance Across Node Versions', () => {
  test('template processing performance', async () => {
    const start = performance.now();
    
    // Run template processing benchmark
    for (let i = 0; i < 100; i++) {
      await processTemplate('sample-template', { iteration: i });
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Performance should be reasonable across all versions
    expect(duration).toBeLessThan(5000); // 5 seconds max
  }, 10000); // 10 second timeout
});
```

### Step 8: Optimize CI Execution
Add caching and parallel execution optimizations:
```yaml
    strategy:
      matrix:
        node-version: [16, 18, 20, 'latest']
      fail-fast: false
      max-parallel: 4 # Run up to 4 versions in parallel
    
    steps:
    # ... existing steps
    
    - name: Cache test results
      uses: actions/cache@v3
      with:
        path: coverage
        key: test-results-${{ matrix.node-version }}-${{ hashFiles('**/*.js') }}
```

## Files to Create/Modify

### Modified Files
- `.github/workflows/ci.yml` - Add matrix strategy
- `package.json` - Add engines field and version scripts

### New Files
- `tests/compatibility/node-versions.test.js` - Version compatibility tests
- `tests/helpers/version-helper.js` - Version testing utilities
- `tests/performance/version-performance.test.js` - Performance benchmarks
- `docs/compatibility.md` - Compatibility documentation

## Expected Outcomes

- Multi-version compatibility verified automatically
- Version-specific issues identified early
- Performance characteristics documented across versions
- CI provides comprehensive version coverage

## Acceptance Criteria

- [ ] Tests pass on Node.js 16, 18, 20, and latest
- [ ] Matrix builds run in parallel for efficiency
- [ ] Version-specific issues are documented
- [ ] CI execution time remains reasonable (<10 minutes)
- [ ] Failed version builds don't block other versions
- [ ] Compatibility documentation is comprehensive

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Version-specific test failures | Medium | Medium | Isolate and document differences, skip if necessary |
| Increased CI execution time | High | Low | Optimize with caching and parallelism |
| Dependency compatibility issues | Medium | High | Test thoroughly, document version requirements |
| Maintenance overhead | Medium | Low | Automate as much as possible |

## Version Testing Strategy

### Core Functionality Testing
- Template processing across versions
- File system operations compatibility
- CLI command execution consistency
- Error handling behavior

### Performance Testing
- Template rendering speed
- File I/O performance
- Memory usage patterns
- Startup time variations

### Compatibility Testing
- API feature availability
- Async/await behavior
- Module loading differences
- Path handling variations

## CI Optimization Techniques

### Caching Strategy
- Node.js installation caching
- npm dependency caching
- Test result caching
- Coverage report caching

### Parallel Execution
- Run versions simultaneously
- Independent failure handling
- Resource-efficient scheduling
- Fast feedback loops

## Definition of Done

- All acceptance criteria met
- Multi-version CI running successfully
- Version compatibility documented
- Performance baselines established
- Ready for coverage reporting (Task 10)

## Notes

- Use fail-fast: false to test all versions even if one fails
- Monitor CI execution time and optimize as needed
- Document any version-specific workarounds
- Consider dropping old versions as they reach end-of-life
- Keep version matrix updated with new LTS releases