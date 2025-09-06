# Task 12: Performance Testing

**Status**: Planned  
**Estimated Time**: 2 days  
**Complexity**: High  
**Prerequisites**: Tasks 01-08 (Complete functional testing)  
**Dependencies**: Full test suite operational  

## Overview

Implement performance testing for CLI operations, template processing, and file system operations to establish benchmarks, detect regressions, and ensure acceptable performance characteristics.

## Objectives

- Create performance test suite for core operations
- Establish performance benchmarks and thresholds
- Implement performance regression detection
- Add performance monitoring to CI pipeline
- Document performance requirements and characteristics

## Implementation Steps

### Step 1: Install Performance Testing Dependencies
```bash
npm install --save-dev benchmark
npm install --save-dev clinic
npm install --save-dev 0x # For flame graphs
```

### Step 2: Create Performance Test Infrastructure
Create `tests/performance/performance-test-runner.js`:
```javascript
const Benchmark = require('benchmark');
const fs = require('fs-extra');
const path = require('path');

class PerformanceTestRunner {
  constructor() {
    this.suite = new Benchmark.Suite();
    this.results = [];
    this.thresholds = {
      templateProcessing: 100, // operations per second minimum
      fileOperations: 50,
      cliStartup: 2000 // milliseconds maximum
    };
  }

  addTest(name, testFn, options = {}) {
    this.suite.add(name, testFn, {
      ...options,
      onComplete: (event) => {
        const result = {
          name,
          hz: event.target.hz,
          stats: event.target.stats,
          timestamp: new Date().toISOString()
        };
        this.results.push(result);
      }
    });
  }

  async run() {
    return new Promise((resolve) => {
      this.suite
        .on('complete', () => {
          this.generateReport();
          resolve(this.results);
        })
        .run({ async: true });
    });
  }

  generateReport() {
    console.log('\\n📊 Performance Test Results\\n');
    
    this.results.forEach(result => {
      const opsPerSec = Math.round(result.hz);
      const deviation = `±${result.stats.rme.toFixed(2)}%`;
      
      console.log(`${result.name}:`);
      console.log(`  ${opsPerSec} ops/sec ${deviation}`);
      console.log(`  Mean: ${(result.stats.mean * 1000).toFixed(2)}ms`);
      console.log('');
    });

    this.checkThresholds();
  }

  checkThresholds() {
    const failures = [];
    
    this.results.forEach(result => {
      const threshold = this.getThreshold(result.name);
      if (threshold && result.hz < threshold) {
        failures.push({
          test: result.name,
          actual: Math.round(result.hz),
          expected: threshold
        });
      }
    });

    if (failures.length > 0) {
      console.log('❌ Performance threshold failures:');
      failures.forEach(failure => {
        console.log(`  ${failure.test}: ${failure.actual} < ${failure.expected} ops/sec`);
      });
      throw new Error('Performance thresholds not met');
    } else {
      console.log('✅ All performance thresholds met');
    }
  }

  getThreshold(testName) {
    if (testName.includes('template')) return this.thresholds.templateProcessing;
    if (testName.includes('file')) return this.thresholds.fileOperations;
    return null;
  }
}

module.exports = { PerformanceTestRunner };
```

### Step 3: Template Processing Performance Tests
Create `tests/performance/template-processing.test.js`:
```javascript
const { PerformanceTestRunner } = require('./performance-test-runner');
const Mustache = require('mustache');
const fs = require('fs-extra');
const path = require('path');

describe('Template Processing Performance', () => {
  let runner;
  let templateContent;
  let largeContext;

  beforeAll(async () => {
    runner = new PerformanceTestRunner();
    
    // Load a real template for testing
    templateContent = await fs.readFile(
      path.join(__dirname, '../../templates/commands/analyze.mustache'),
      'utf8'
    );
    
    // Create large context for stress testing
    largeContext = {
      stack: '#'.repeat(1000) + ' Large Stack Description',
      rules: '#'.repeat(1000) + ' Large Rules Description',
      projectName: 'large-project-with-long-name',
      items: Array.from({ length: 100 }, (_, i) => ({ name: `item-${i}` }))
    };
  });

  test('template rendering performance', async () => {
    const simpleContext = {
      stack: '# Stack\\nNode.js CLI',
      rules: '# Rules\\nUse Commander.js',
      projectName: 'test-project'
    };

    runner.addTest('Simple template rendering', () => {
      Mustache.render(templateContent, simpleContext);
    });

    runner.addTest('Large context template rendering', () => {
      Mustache.render(templateContent, largeContext);
    });

    runner.addTest('Template compilation and rendering', () => {
      Mustache.render(templateContent, simpleContext);
    });

    const results = await runner.run();
    
    // Verify minimum performance thresholds
    const simpleResult = results.find(r => r.name === 'Simple template rendering');
    expect(simpleResult.hz).toBeGreaterThan(100); // 100 ops/sec minimum
  }, 30000);
});
```

### Step 4: File Operations Performance Tests
Create `tests/performance/file-operations.test.js`:
```javascript
const { PerformanceTestRunner } = require('./performance-test-runner');
const fs = require('fs-extra');
const path = require('path');
const mockFs = require('mock-fs');

describe('File Operations Performance', () => {
  let runner;
  const tempDir = '/tmp/perf-test';

  beforeAll(() => {
    runner = new PerformanceTestRunner();
  });

  beforeEach(() => {
    mockFs({
      [tempDir]: {},
      '/templates/test.mustache': 'Hello {{name}}!',
      '.monkey/stack.md': '# Stack\\nNode.js',
      '.monkey/rules.md': '# Rules\\nUse Jest'
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  test('file system operations performance', async () => {
    const { copyFileWithTemplate, loadProjectContext } = require('../../lib/utils/files');

    runner.addTest('File reading', async () => {
      await fs.readFile('.monkey/stack.md', 'utf8');
    });

    runner.addTest('File writing', async () => {
      await fs.writeFile(`${tempDir}/test-${Date.now()}.txt`, 'test content');
    });

    runner.addTest('Template file copying', async () => {
      await copyFileWithTemplate(
        '/templates/test.mustache',
        `${tempDir}/output-${Date.now()}.txt`,
        { name: 'World' }
      );
    });

    runner.addTest('Project context loading', async () => {
      await loadProjectContext();
    });

    await runner.run();
  }, 30000);
});
```

### Step 5: CLI Startup Performance Tests
Create `tests/performance/cli-startup.test.js`:
```javascript
const { spawn } = require('child_process');
const path = require('path');

describe('CLI Startup Performance', () => {
  const binPath = path.join(__dirname, '../../bin/context-monkey.js');

  test('CLI startup time', async () => {
    const startTimes = [];
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      await new Promise((resolve, reject) => {
        const child = spawn('node', [binPath, '--help'], {
          stdio: 'pipe'
        });

        child.on('close', () => {
          const endTime = performance.now();
          startTimes.push(endTime - startTime);
          resolve();
        });

        child.on('error', reject);
      });
    }

    const averageStartTime = startTimes.reduce((a, b) => a + b, 0) / iterations;
    const maxStartTime = Math.max(...startTimes);

    console.log(`Average CLI startup time: ${averageStartTime.toFixed(2)}ms`);
    console.log(`Max CLI startup time: ${maxStartTime.toFixed(2)}ms`);

    // CLI should start within reasonable time
    expect(averageStartTime).toBeLessThan(500); // 500ms average
    expect(maxStartTime).toBeLessThan(1000); // 1s maximum
  }, 30000);
});
```

### Step 6: Memory Usage Testing
Create `tests/performance/memory-usage.test.js`:
```javascript
describe('Memory Usage', () => {
  test('memory usage during template processing', async () => {
    const initialMemory = process.memoryUsage();
    
    // Process many templates
    const templates = Array.from({ length: 100 }, (_, i) => 
      `Template ${i}: {{name}} {{description}}`
    );
    
    const context = {
      name: 'test',
      description: 'A'.repeat(1000) // Large description
    };

    templates.forEach(template => {
      Mustache.render(template, context);
    });

    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    
    // Should not use excessive memory
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
  });
});
```

### Step 7: Add Performance Scripts
Update `package.json`:
```json
{
  "scripts": {
    "perf:test": "jest --testPathPattern=performance --runInBand",
    "perf:profile": "clinic doctor -- node bin/context-monkey.js install",
    "perf:flame": "0x -- node bin/context-monkey.js install",
    "perf:benchmark": "node scripts/benchmark.js",
    "perf:ci": "npm run perf:test -- --ci --silent"
  }
}
```

### Step 8: Create Performance Benchmark Script
Create `scripts/benchmark.js`:
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function runBenchmarks() {
  console.log('🚀 Running performance benchmarks...\\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    benchmarks: {}
  };

  // Template processing benchmark
  console.log('📄 Template processing benchmark...');
  const templateStart = performance.now();
  
  // Simulate template processing workload
  for (let i = 0; i < 1000; i++) {
    const Mustache = require('mustache');
    Mustache.render('Hello {{name}}! {{#items}}{{name}} {{/items}}', {
      name: 'World',
      items: [{ name: 'item1' }, { name: 'item2' }]
    });
  }
  
  const templateTime = performance.now() - templateStart;
  results.benchmarks.templateProcessing = {
    iterations: 1000,
    totalTime: templateTime,
    opsPerSecond: 1000 / (templateTime / 1000)
  };

  // CLI startup benchmark
  console.log('⚡ CLI startup benchmark...');
  const startupTimes = [];
  
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    execSync('node bin/context-monkey.js --help', { stdio: 'pipe' });
    startupTimes.push(performance.now() - start);
  }
  
  results.benchmarks.cliStartup = {
    iterations: 5,
    times: startupTimes,
    average: startupTimes.reduce((a, b) => a + b) / startupTimes.length,
    min: Math.min(...startupTimes),
    max: Math.max(...startupTimes)
  };

  // Save results
  const resultsPath = path.join(__dirname, '../performance-results.json');
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\\n📊 Benchmark Results:');
  console.log(`Template processing: ${results.benchmarks.templateProcessing.opsPerSecond.toFixed(0)} ops/sec`);
  console.log(`CLI startup average: ${results.benchmarks.cliStartup.average.toFixed(2)}ms`);
  console.log(`\\nResults saved to: ${resultsPath}`);
}

runBenchmarks().catch(console.error);
```

### Step 9: Add Performance Testing to CI
Update `.github/workflows/ci.yml`:
```yaml
    - name: Run performance tests
      run: npm run perf:ci
      continue-on-error: true # Don't fail CI on performance issues initially
      
    - name: Upload performance results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: performance-results
        path: performance-results.json
```

## Files to Create

### Performance Test Files
- `tests/performance/performance-test-runner.js` - Test infrastructure
- `tests/performance/template-processing.test.js` - Template performance
- `tests/performance/file-operations.test.js` - File operation performance  
- `tests/performance/cli-startup.test.js` - CLI startup performance
- `tests/performance/memory-usage.test.js` - Memory usage tests

### Scripts and Tools
- `scripts/benchmark.js` - Benchmark runner
- `performance-results.json` - Results storage (generated)

### Modified Files
- `package.json` - Add performance scripts
- `.github/workflows/ci.yml` - Add performance testing

## Expected Outcomes

- Performance benchmarks established for core operations
- Performance regression detection in place
- Performance characteristics documented
- CI integration provides performance feedback

## Acceptance Criteria

- [ ] Template processing benchmarked (>100 ops/sec)
- [ ] File operations benchmarked (>50 ops/sec)
- [ ] CLI startup time measured (<500ms average)
- [ ] Memory usage monitored and bounded
- [ ] Performance regression detection working
- [ ] CI integration provides performance feedback
- [ ] Performance thresholds documented

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance test variability | High | Medium | Use statistical methods, multiple runs |
| CI environment performance differences | Medium | Low | Establish environment-specific baselines |
| Performance testing overhead | Medium | Low | Run performance tests separately, not on every CI |
| False positive regressions | Medium | Medium | Set reasonable thresholds with margin |

## Performance Targets

### Template Processing
- **Simple templates**: >500 ops/sec
- **Complex templates**: >100 ops/sec  
- **Large contexts**: >50 ops/sec

### File Operations
- **File reading**: >200 ops/sec
- **File writing**: >100 ops/sec
- **Template copying**: >50 ops/sec

### CLI Performance
- **Startup time**: <500ms average, <1s maximum
- **Help display**: <200ms
- **Command parsing**: <100ms

### Memory Usage
- **Template processing**: <50MB for 100 templates
- **CLI operations**: <20MB peak usage
- **Memory leaks**: None detected

## Definition of Done

- All acceptance criteria met
- Performance baselines established
- Regression detection operational
- Performance requirements documented
- CI/CD pipeline complete with all 12 tasks

## Notes

- Start with baseline measurements before optimization
- Use realistic test data that matches production usage
- Performance tests should be separate from unit tests
- Consider environmental factors (CI vs local development)
- Monitor performance trends over time, not just absolutes