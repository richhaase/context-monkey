# Task 05: ESLint Configuration

**Status**: Planned  
**Estimated Time**: 1 day  
**Complexity**: Low  
**Prerequisites**: Task 01 (Jest Foundation)  
**Dependencies**: Basic testing framework  

## Overview

Add ESLint for code quality and consistency, configured for Node.js CLI development patterns with security-focused rules.

## Objectives

- Install and configure ESLint for Node.js CLI
- Add security-focused linting rules
- Configure Jest integration
- Set up development workflow integration
- Fix existing code quality issues

## Implementation Steps

### Step 1: Install ESLint Dependencies
```bash
npm install --save-dev eslint
npm install --save-dev @eslint/js
npm install --save-dev eslint-plugin-node
npm install --save-dev eslint-plugin-security
npm install --save-dev eslint-plugin-jest
```

### Step 2: Create ESLint Configuration
Create `.eslintrc.js`:
```javascript
module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:security/recommended'
  ],
  plugins: ['security', 'jest'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    // Security rules
    'security/detect-child-process': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-unsafe-regex': 'error',
    
    // Node.js best practices
    'node/no-unpublished-require': 'off',
    'node/no-missing-require': 'error',
    
    // General code quality
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};
```

### Step 3: Create ESLint Ignore File
Create `.eslintignore`:
```
node_modules/
coverage/
dist/
build/
*.min.js
.github/
docs/
```

### Step 4: Add Lint Scripts
Update `package.json`:
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:check": "eslint . --max-warnings 0"
  }
}
```

### Step 5: Run Initial Linting
```bash
npm run lint:fix
```

Fix any remaining issues manually.

### Step 6: Update CI Workflow
Add linting to `.github/workflows/ci.yml`:
```yaml
- name: Run linting
  run: npm run lint:check
```

## Files to Create/Modify

### New Files
- `.eslintrc.js` - ESLint configuration
- `.eslintignore` - Files to ignore

### Modified Files
- `package.json` - Add lint scripts and devDependencies
- `.github/workflows/ci.yml` - Add linting step

## Expected Outcomes

- Consistent code quality standards enforced
- Security-focused linting active
- Jest-specific rules configured
- CI integration preventing quality regressions

## Acceptance Criteria

- [ ] ESLint runs without errors on existing code
- [ ] Security linting rules active and configured
- [ ] Jest-specific rules configured for test files
- [ ] CLI patterns (Commander.js) properly handled
- [ ] `npm run lint` command available and working
- [ ] CI fails on linting violations
- [ ] Auto-fix capability working for common issues

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Many existing lint violations | High | Low | Fix incrementally with --fix flag |
| Jest/Node.js rule conflicts | Medium | Low | Use compatible rule sets and overrides |
| Security rules too strict | Medium | Medium | Configure appropriate warning levels |
| Performance impact | Low | Low | ESLint is generally fast |

## ESLint Rules Focus

### Security Rules
- Detect unsafe filesystem operations
- Prevent command injection vulnerabilities
- Identify unsafe regular expressions
- Flag potential XSS vectors

### Node.js Specific
- Validate require/import statements
- Check for Node.js API best practices
- Ensure proper async/await usage
- Validate package.json dependencies

### Code Quality
- Consistent formatting patterns
- Unused variable detection
- Modern JavaScript features
- Error handling best practices

## Definition of Done

- All acceptance criteria met
- Existing codebase passes linting
- CI integration working
- Development workflow improved
- Ready for Prettier integration (Task 06)

## Notes

- Focus on security rules given CLI tool nature
- Configure overrides for test files
- Use --fix flag to handle simple formatting issues
- Consider adding pre-commit hooks in future
- Document any rule exceptions with reasoning