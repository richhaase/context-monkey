# Task 10: Coverage Reporting

**Status**: Planned  
**Estimated Time**: 1 day  
**Complexity**: Low  
**Prerequisites**: Tasks 01-08 (Complete test suite)  
**Dependencies**: All major tests written  

## Overview

Implement comprehensive test coverage reporting with CI integration, coverage thresholds, and trend tracking to ensure code quality and identify untested areas.

## Objectives

- Configure comprehensive coverage reporting
- Set up coverage thresholds and enforcement
- Integrate coverage reporting in CI
- Create coverage badges and visualization
- Track coverage trends over time

## Implementation Steps

### Step 1: Enhanced Jest Coverage Configuration
Update `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/**/*.js',
    'bin/**/*.js',
    '!lib/**/*.test.js',
    '!**/node_modules/**',
    '!coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'cobertura'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './lib/utils/files.js': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  clearMocks: true
};
```

### Step 2: Update Package.json Scripts
Add comprehensive coverage scripts:
```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:coverage:watch": "jest --coverage --watchAll",
    "test:coverage:ci": "jest --coverage --ci --watchman=false",
    "coverage:open": "open coverage/lcov-report/index.html",
    "coverage:check": "jest --coverage --passWithNoTests --coverageThreshold"
  }
}
```

### Step 3: Update CI Workflow
Modify `.github/workflows/ci.yml` to include coverage:
```yaml
    - name: Run tests with coverage
      run: npm run test:coverage:ci
      
    - name: Check coverage thresholds
      run: npm run coverage:check
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: context-monkey-coverage
        fail_ci_if_error: true
        
    - name: Comment coverage on PR
      if: github.event_name == 'pull_request'
      uses: romeovs/lcov-reporter-action@v0.3.1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        lcov-file: ./coverage/lcov.info
```

### Step 4: Create Coverage Badge
Add coverage badge to `README.md`:
```markdown
[![Coverage Status](https://codecov.io/gh/richhaase/context-monkey/branch/main/graph/badge.svg)](https://codecov.io/gh/richhaase/context-monkey)
```

### Step 5: Create Coverage Analysis Script
Create `scripts/coverage-analysis.js`:
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function analyzeCoverage() {
  const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    console.error('Coverage report not found. Run npm run test:coverage first.');
    process.exit(1);
  }
  
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  
  console.log('\\n📊 Coverage Analysis\\n');
  console.log('Overall Coverage:');
  console.log(`  Lines: ${coverage.total.lines.pct}%`);
  console.log(`  Functions: ${coverage.total.functions.pct}%`);
  console.log(`  Branches: ${coverage.total.branches.pct}%`);
  console.log(`  Statements: ${coverage.total.statements.pct}%`);
  
  console.log('\\nFiles with low coverage (< 90%):');
  Object.entries(coverage).forEach(([file, data]) => {
    if (file !== 'total' && data.lines.pct < 90) {
      console.log(`  ${file}: ${data.lines.pct}% lines`);
    }
  });
  
  console.log('\\nUncovered lines:');
  Object.entries(coverage).forEach(([file, data]) => {
    if (file !== 'total' && data.lines.uncovered.length > 0) {
      console.log(`  ${file}: lines ${data.lines.uncovered.join(', ')}`);
    }
  });
}

analyzeCoverage();
```

### Step 6: Create Coverage Requirements Document
Create `docs/testing/coverage-requirements.md`:
```markdown
# Coverage Requirements

## Minimum Coverage Thresholds

- **Overall Project**: 90% lines, 90% functions, 85% branches, 90% statements
- **Core Utils**: 95% for lib/utils/files.js (critical security component)
- **CLI Commands**: 90% for all command files
- **Template Processing**: 95% for template-related functionality

## Coverage Exclusions

- Test files (`*.test.js`)
- Node modules
- Generated files
- Configuration files

## Coverage Analysis

Run `npm run coverage:check` to verify thresholds are met.
Run `node scripts/coverage-analysis.js` for detailed coverage analysis.

## Improving Coverage

1. Identify uncovered lines: `npm run test:coverage`
2. Add specific tests for uncovered functionality
3. Focus on edge cases and error conditions
4. Ensure integration tests cover full workflows

## Coverage Trends

- Track coverage over time using Codecov
- Aim to maintain or improve coverage with each PR
- Address coverage drops immediately
```

### Step 7: Set Up Coverage Exclusions
Create `.coveragerc` for additional configuration:
```ini
[run]
omit = 
    */node_modules/*
    */coverage/*
    */tests/*
    *.config.js
    *.test.js
    
[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
```

### Step 8: Create Coverage Monitoring
Create `tests/meta/coverage.test.js`:
```javascript
const fs = require('fs');
const path = require('path');

describe('Coverage Monitoring', () => {
  test('should meet minimum coverage thresholds', () => {
    const coveragePath = path.join(__dirname, '../../coverage/coverage-summary.json');
    
    if (!fs.existsSync(coveragePath)) {
      console.warn('Coverage report not found, skipping coverage test');
      return;
    }
    
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const { total } = coverage;
    
    expect(total.lines.pct).toBeGreaterThanOrEqual(90);
    expect(total.functions.pct).toBeGreaterThanOrEqual(90);
    expect(total.branches.pct).toBeGreaterThanOrEqual(85);
    expect(total.statements.pct).toBeGreaterThanOrEqual(90);
  });
  
  test('should have no completely uncovered files', () => {
    const coveragePath = path.join(__dirname, '../../coverage/coverage-summary.json');
    
    if (!fs.existsSync(coveragePath)) {
      return;
    }
    
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    
    Object.entries(coverage).forEach(([file, data]) => {
      if (file !== 'total') {
        expect(data.lines.pct).toBeGreaterThan(0);
      }
    });
  });
});
```

## Files to Create/Modify

### Modified Files
- `jest.config.js` - Enhanced coverage configuration
- `package.json` - Add coverage scripts
- `.github/workflows/ci.yml` - Coverage integration
- `README.md` - Add coverage badge

### New Files
- `scripts/coverage-analysis.js` - Coverage analysis tool
- `docs/testing/coverage-requirements.md` - Coverage documentation
- `.coveragerc` - Coverage configuration
- `tests/meta/coverage.test.js` - Coverage monitoring

## Expected Outcomes

- Comprehensive coverage metrics available
- Coverage thresholds enforced automatically
- Coverage trends tracked over time
- Visual coverage reports for developers

## Acceptance Criteria

- [ ] 90%+ line coverage achieved across project
- [ ] Coverage thresholds enforced in CI
- [ ] Coverage reports generated in multiple formats
- [ ] Coverage badges visible in README
- [ ] Pull request coverage comments working
- [ ] Uncovered code identified and documented
- [ ] Coverage trends tracked over time

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low initial coverage | High | Medium | Incremental improvement plan, realistic initial thresholds |
| Coverage thresholds too strict | Medium | Low | Adjust based on actual achievable coverage |
| CI performance impact | Medium | Low | Optimize coverage collection, use caching |
| Coverage gaming (writing tests just for coverage) | Low | High | Code review focus on test quality, not just coverage |

## Coverage Strategy

### High Priority Areas
- File system operations (security critical)
- Template processing (core functionality)
- CLI command parsing (user interface)
- Error handling paths (reliability)

### Medium Priority Areas
- Configuration loading
- Helper utilities
- Integration workflows
- Performance optimizations

### Coverage Improvement Plan
1. **Week 1**: Achieve 80% overall coverage
2. **Week 2**: Focus on critical path coverage (95%)
3. **Week 3**: Address edge cases and error conditions
4. **Week 4**: Fine-tune thresholds and documentation

## Monitoring and Maintenance

### Daily Monitoring
- Check coverage in CI builds
- Review coverage drops in PRs
- Address failing coverage thresholds

### Weekly Analysis
- Run detailed coverage analysis
- Identify improvement opportunities
- Update coverage goals if needed

### Monthly Review
- Analyze coverage trends
- Adjust thresholds if appropriate
- Update documentation

## Definition of Done

- All acceptance criteria met
- Coverage thresholds consistently met
- Coverage tracking and reporting operational
- Team understands coverage requirements
- Ready for dependency automation (Task 11)

## Notes

- Start with achievable thresholds and increase gradually
- Focus on meaningful tests, not just coverage numbers
- Use coverage to identify untested edge cases
- Consider excluding trivial getter/setter functions if appropriate
- Monitor performance impact of coverage collection