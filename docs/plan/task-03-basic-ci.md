# Task 03: Basic GitHub Actions CI

**Status**: Planned  
**Estimated Time**: 1 day  
**Complexity**: Low  
**Prerequisites**: Tasks 01-02 (Testing foundation)  
**Dependencies**: Jest tests passing  

## Overview

Establish basic GitHub Actions CI pipeline with Node.js testing and dependency installation to automate testing on every push and pull request.

## Objectives

- Create GitHub Actions workflow for CI
- Configure Node.js environment
- Set up dependency caching
- Run Jest tests automatically
- Provide CI status feedback

## Implementation Steps

### Step 1: Create Workflow Directory
```bash
mkdir -p .github/workflows
```

### Step 2: Create Basic CI Workflow
Create `.github/workflows/ci.yml`:
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
      
    - name: Run tests
      run: npm test
      
    - name: Check for test coverage
      run: npm run test:coverage
```

### Step 3: Test Workflow Locally
Using act or similar tool:
```bash
# Optional: Test locally before pushing
npx act push
```

### Step 4: Commit and Test
```bash
git add .github/workflows/ci.yml
git commit -m "Add basic CI workflow"
git push origin main
```

### Step 5: Verify CI Execution
- Check GitHub Actions tab
- Verify tests run successfully
- Confirm caching works

## Files to Create

### New Files
- `.github/workflows/ci.yml` - Main CI workflow

## Expected Outcomes

- Automated testing on pull requests
- Node.js dependency caching working
- CI status checks on GitHub
- Fast feedback on code changes

## Acceptance Criteria

- [ ] CI runs on push to main branch
- [ ] CI runs on pull request creation
- [ ] Tests execute successfully in CI
- [ ] Dependency caching working (faster subsequent runs)
- [ ] CI status visible on GitHub commits
- [ ] Failed tests block pull request merging

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| GitHub Actions quota limits | Low | Low | Monitor usage, optimize workflows |
| CI environment differences | Medium | Medium | Test locally with act or similar tools |
| Node.js version mismatch | Low | Medium | Use same version as package.json engines |
| Dependency installation failures | Low | Medium | Use npm ci for consistent installs |

## CI Configuration Details

### Triggers
- Push to `main` and `develop` branches
- Pull requests to `main` branch
- Manual workflow dispatch (optional)

### Environment
- Ubuntu latest (fast and reliable)
- Node.js 18 (matches package.json engines)
- npm caching enabled

### Steps Explained
1. **Checkout**: Get source code
2. **Setup Node**: Install Node.js with caching
3. **Install**: Use `npm ci` for consistent dependencies
4. **Test**: Run Jest test suite
5. **Coverage**: Generate coverage report

## Future Enhancements

- Multi-Node version testing (Task 09)
- Security scanning (Task 07)
- Performance testing (Task 12)
- Deployment automation (if needed)

## Definition of Done

- All acceptance criteria met
- CI workflow tested and working
- Documentation updated
- Team can see CI status on PRs
- Ready for security integration (Task 07)

## Notes

- Keep workflow simple initially
- Use established actions (checkout@v4, setup-node@v4)
- Enable dependency caching for faster builds
- Consider branch protection rules after setup
- Monitor GitHub Actions minutes usage