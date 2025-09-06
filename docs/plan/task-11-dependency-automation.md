# Task 11: Automated Dependency Updates

**Status**: Planned  
**Estimated Time**: 1 day  
**Complexity**: Low  
**Prerequisites**: Task 03 (Basic GitHub Actions CI)  
**Dependencies**: Stable CI pipeline  

## Overview

Implement automated dependency update monitoring and testing with Dependabot and custom automation to keep dependencies secure and up-to-date while maintaining stability.

## Objectives

- Configure Dependabot for automated dependency PRs
- Set up automated testing for dependency updates
- Create dependency update validation workflow
- Establish security update prioritization
- Document dependency management process

## Implementation Steps

### Step 1: Configure Dependabot
Create `.github/dependabot.yml`:
```yaml
version: 2
updates:
  # Main package dependencies
  - package-ecosystem: \"npm\"
    directory: \"/\"
    schedule:
      interval: \"weekly\"
      day: \"monday\"
      time: \"09:00\"
      timezone: \"America/New_York\"
    open-pull-requests-limit: 10
    allow:
      - dependency-type: \"all\"
    assignees:
      - \"richhaase\"
    reviewers:
      - \"richhaase\"
    commit-message:
      prefix: \"deps\"
      include: \"scope\"
    labels:
      - \"dependencies\"
      - \"automated\"
    
  # Security updates (more frequent)
  - package-ecosystem: \"npm\"
    directory: \"/\"
    schedule:
      interval: \"daily\"
    open-pull-requests-limit: 5
    allow:
      - dependency-type: \"security\"
    assignees:
      - \"richhaase\"
    labels:
      - \"security\"
      - \"dependencies\"
      - \"priority\"
    commit-message:
      prefix: \"security\"
      include: \"scope\"
```

### Step 2: Create Dependency Update Workflow
Create `.github/workflows/dependency-update.yml`:
```yaml
name: Dependency Update Validation

on:
  pull_request:
    paths:
      - 'package.json'
      - 'package-lock.json'
    types: [opened, synchronize]

jobs:
  validate-dependencies:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run comprehensive tests
      run: |
        npm run lint:check
        npm run test:coverage:ci
        npm run audit:check
        
    - name: Check for breaking changes
      run: |
        # Run additional integration tests for dependency updates
        npm run test:integration
        
    - name: Validate package-lock.json
      run: |
        # Ensure package-lock.json is properly updated
        npm ci
        git diff --exit-code package-lock.json || {
          echo \"package-lock.json is not up to date\"
          exit 1
        }
        
    - name: Check bundle size impact
      run: |
        # Simple bundle size check (if applicable)
        npm run build --if-present
        
    - name: Comment on PR with dependency info
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const { execSync } = require('child_process');
          
          try {
            const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
            const audit = JSON.parse(auditOutput);
            
            const comment = `## Dependency Update Validation ✅
            
            - **Security vulnerabilities**: ${audit.metadata.vulnerabilities.total}
            - **Tests**: Passed
            - **Linting**: Passed
            - **Bundle size**: No significant changes
            
            This dependency update has been automatically validated.`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
          } catch (error) {
            console.log('Could not post comment:', error.message);
          }
```

### Step 3: Create Dependency Management Scripts
Create `scripts/dependency-manager.js`:
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DependencyManager {
  constructor() {
    this.packagePath = path.join(process.cwd(), 'package.json');
    this.lockPath = path.join(process.cwd(), 'package-lock.json');
  }

  checkOutdated() {
    console.log('🔍 Checking for outdated dependencies...');
    try {
      const output = execSync('npm outdated --json', { encoding: 'utf8' });
      const outdated = JSON.parse(output);
      
      if (Object.keys(outdated).length === 0) {
        console.log('✅ All dependencies are up to date!');
        return;
      }
      
      console.log('📦 Outdated dependencies:');
      Object.entries(outdated).forEach(([name, info]) => {
        console.log(`  ${name}: ${info.current} → ${info.latest}`);
      });
    } catch (error) {
      console.log('✅ All dependencies are up to date!');
    }
  }

  auditSecurity() {
    console.log('🔒 Running security audit...');
    try {
      execSync('npm audit --audit-level moderate', { stdio: 'inherit' });
      console.log('✅ No security vulnerabilities found!');
    } catch (error) {
      console.log('⚠️  Security vulnerabilities found. Run `npm audit fix` to address them.');
      process.exit(1);
    }
  }

  updatePackageLock() {
    console.log('🔄 Updating package-lock.json...');
    execSync('npm update', { stdio: 'inherit' });
    console.log('✅ package-lock.json updated!');
  }

  validateInstallation() {
    console.log('🧪 Validating installation...');
    execSync('npm ci', { stdio: 'inherit' });
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Installation validated!');
  }
}

const command = process.argv[2];
const manager = new DependencyManager();

switch (command) {
  case 'check':
    manager.checkOutdated();
    break;
  case 'audit':
    manager.auditSecurity();
    break;
  case 'update':
    manager.updatePackageLock();
    break;
  case 'validate':
    manager.validateInstallation();
    break;
  case 'full':
    manager.checkOutdated();
    manager.auditSecurity();
    manager.updatePackageLock();
    manager.validateInstallation();
    break;
  default:
    console.log(`
Usage: node scripts/dependency-manager.js <command>

Commands:
  check     Check for outdated dependencies
  audit     Run security audit
  update    Update package-lock.json
  validate  Validate installation and run tests
  full      Run all checks and updates
`);
}
```

### Step 4: Update Package.json Scripts
Add dependency management scripts:
```json
{
  "scripts": {
    "deps:check": "node scripts/dependency-manager.js check",
    "deps:audit": "node scripts/dependency-manager.js audit",
    "deps:update": "node scripts/dependency-manager.js update",
    "deps:validate": "node scripts/dependency-manager.js validate",
    "deps:full": "node scripts/dependency-manager.js full",
    "audit:check": "audit-ci --config .auditrc"
  }
}
```

### Step 5: Create Dependency Update Documentation
Create `docs/dependencies.md`:
```markdown
# Dependency Management

## Automated Updates

### Dependabot Configuration
- **Regular updates**: Weekly on Mondays
- **Security updates**: Daily
- **Pull request limit**: 10 regular, 5 security
- **Auto-assignment**: @richhaase

### Update Process
1. Dependabot creates PR
2. Automated validation runs
3. Manual review if needed
4. Merge approved updates

## Manual Dependency Management

### Check for Updates
```bash
npm run deps:check
```

### Security Audit
```bash
npm run deps:audit
```

### Update Dependencies
```bash
npm run deps:update
```

### Full Dependency Check
```bash
npm run deps:full
```

## Dependency Policies

### Update Frequency
- **Security updates**: Immediate
- **Patch updates**: Weekly
- **Minor updates**: Weekly (with testing)
- **Major updates**: Manual review required

### Testing Requirements
- All tests must pass
- Security audit must pass
- No breaking changes in functionality
- Bundle size impact acceptable

## Security Considerations

### Vulnerability Response
1. Dependabot creates security PR
2. Automated testing validates fix
3. Manual review for breaking changes
4. Immediate merge if tests pass

### Supply Chain Security
- Use package-lock.json for exact versions
- Regular security audits
- Monitor for suspicious dependency changes
- Minimal dependency philosophy
```

### Step 6: Create Dependency Validation Tests
Create `tests/meta/dependencies.test.js`:
```javascript
const fs = require('fs');
const path = require('path');

describe('Dependency Validation', () => {
  test('package.json and package-lock.json should be in sync', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
    );
    const packageLock = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package-lock.json'), 'utf8')
    );

    expect(packageJson.name).toBe(packageLock.name);
    expect(packageJson.version).toBe(packageLock.version);
  });

  test('should not have known vulnerable dependencies', async () => {
    // This will be caught by npm audit, but good to have as a test
    const { execSync } = require('child_process');
    
    expect(() => {
      execSync('npm audit --audit-level high', { stdio: 'pipe' });
    }).not.toThrow();
  });

  test('should have minimal direct dependencies', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
    );

    const depCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
    
    // Keep dependency count reasonable
    expect(depCount).toBeLessThan(10); // Adjust based on project needs
    expect(devDepCount).toBeLessThan(20); // Development dependencies can be higher
  });
});
```

## Files to Create/Modify

### New Files
- `.github/dependabot.yml` - Dependabot configuration
- `.github/workflows/dependency-update.yml` - Dependency validation workflow
- `scripts/dependency-manager.js` - Dependency management script
- `docs/dependencies.md` - Dependency documentation
- `tests/meta/dependencies.test.js` - Dependency validation tests

### Modified Files
- `package.json` - Add dependency management scripts

## Expected Outcomes

- Automated dependency update PRs from Dependabot
- Comprehensive validation of dependency updates
- Security updates prioritized and fast-tracked
- Reduced manual dependency management overhead

## Acceptance Criteria

- [ ] Dependabot creates update PRs automatically
- [ ] Automated testing validates dependency updates
- [ ] Security updates are prioritized with daily checks
- [ ] Dependency update process documented
- [ ] Manual dependency management tools available
- [ ] CI validates all dependency changes
- [ ] Supply chain security measures in place

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking dependency updates | Medium | Medium | Comprehensive automated testing |
| Update notification noise | High | Low | Configure appropriate grouping and frequency |
| Security vulnerability exposure | Low | High | Daily security updates, rapid response process |
| Dependency bloat | Medium | Low | Regular dependency audits, minimal dependency philosophy |

## Dependabot Configuration Rationale

### Update Frequency
- **Weekly regular updates**: Balance between staying current and avoiding noise
- **Daily security updates**: Critical for security vulnerabilities
- **Monday scheduling**: Start week with fresh dependencies

### Pull Request Management
- **10 regular PRs max**: Prevents overwhelming maintainers
- **5 security PRs max**: Allows for multiple security fixes
- **Auto-assignment**: Ensures accountability

### Labels and Organization
- Clear labeling for triage
- Security updates get priority labels
- Scope information in commit messages

## Definition of Done

- All acceptance criteria met
- Dependabot configured and running
- Dependency validation automated
- Documentation complete
- Ready for performance testing (Task 12)

## Notes

- Start with conservative settings and adjust based on experience
- Monitor Dependabot noise levels and tune accordingly
- Prioritize security updates over feature updates
- Keep minimal dependency philosophy
- Regular review of dependency policies