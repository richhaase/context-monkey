# Task 01: Jest Testing Framework Foundation

**Status**: Planned  
**Estimated Time**: 1-2 days  
**Complexity**: Medium  
**Prerequisites**: None (foundational task)  
**Dependencies**: None  

## Overview

Establish Jest testing framework with proper configuration for Node.js CLI testing, including file system mocking capabilities essential for context-monkey's template processing.

## Objectives

- Install and configure Jest testing framework
- Set up file system mocking for template testing
- Create test directory structure
- Enable test coverage reporting
- Integrate testing into npm scripts

## Implementation Steps

### Step 1: Add Dependencies
```bash
npm install --save-dev jest @types/jest mock-fs memfs
```

### Step 2: Create Jest Configuration
Create `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/**/*.js',
    'bin/**/*.js',
    '!lib/**/*.test.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  clearMocks: true
};
```

### Step 3: Update Package.json
Add test scripts:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 4: Create Test Directory Structure
```
tests/
├── lib/
│   ├── utils/
│   └── commands/
├── integration/
├── fixtures/
│   ├── templates/
│   └── contexts/
└── helpers/
```

### Step 5: Create Sample Test
Create `tests/sample.test.js` to validate setup:
```javascript
const fs = require('fs-extra');
const mockFs = require('mock-fs');

describe('Jest Setup Validation', () => {
  afterEach(() => {
    mockFs.restore();
  });

  test('should setup file system mocking', () => {
    mockFs({
      '/tmp/test': {
        'file.txt': 'test content'
      }
    });

    expect(fs.readFileSync('/tmp/test/file.txt', 'utf8')).toBe('test content');
  });
});
```

## Files to Create/Modify

### New Files
- `jest.config.js` - Jest configuration
- `tests/sample.test.js` - Setup validation test
- `tests/helpers/test-utils.js` - Common test utilities

### Modified Files
- `package.json` - Add devDependencies and test scripts

## Expected Outcomes

- Jest testing framework installed and configured
- File system mocking capabilities available  
- `npm test` command functional
- Basic test structure established
- Test coverage reporting configured

## Acceptance Criteria

- [ ] Jest runs without errors on empty test suite
- [ ] File system mocking works with mock-fs
- [ ] Test coverage reporting configured
- [ ] Test scripts accessible via npm
- [ ] Sample test passes demonstrating file system mocking

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Mock-fs conflicts with fs-extra | Medium | Medium | Test compatibility, have fallback plan with memfs |
| Jest config issues with ES modules | Low | Medium | Use CommonJS configuration initially |
| Coverage reporting overhead | Low | Low | Configure reasonable thresholds |

## Definition of Done

- All acceptance criteria met
- Jest configuration tested and working
- Documentation updated
- Sample test demonstrates key capabilities
- Ready for next task (File System Testing)

## Notes

- Choose mock-fs over memfs for easier file system simulation
- Configure Jest for Node.js CLI environment specifically
- Ensure compatibility with existing fs-extra usage
- Set up coverage thresholds for future enforcement