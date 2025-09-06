# Task 06: Prettier Integration

**Status**: Planned  
**Estimated Time**: 1 day  
**Complexity**: Low  
**Prerequisites**: Task 05 (ESLint Configuration)  
**Dependencies**: ESLint established  

## Overview

Add Prettier for consistent code formatting, integrated with ESLint for seamless development workflow without conflicts.

## Objectives

- Install and configure Prettier
- Integrate with ESLint without conflicts
- Format existing codebase consistently
- Add formatting scripts to development workflow
- Ensure CI validates formatting

## Implementation Steps

### Step 1: Install Prettier Dependencies
```bash
npm install --save-dev prettier
npm install --save-dev eslint-config-prettier
npm install --save-dev eslint-plugin-prettier
```

### Step 2: Create Prettier Configuration
Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Step 3: Create Prettier Ignore File
Create `.prettierignore`:
```
node_modules/
coverage/
dist/
build/
*.min.js
package-lock.json
CHANGELOG.md
.github/
docs/plan/
```

### Step 4: Update ESLint Configuration
Modify `.eslintrc.js` to integrate Prettier:
```javascript
module.exports = {\n  // ... existing config\n  extends: [\n    'eslint:recommended',\n    'plugin:node/recommended',\n    'plugin:security/recommended',\n    'prettier' // Must be last to override other configs\n  ],\n  plugins: ['security', 'jest', 'prettier'],\n  rules: {\n    // ... existing rules\n    'prettier/prettier': 'error'\n  }\n};\n```

### Step 5: Add Format Scripts
Update `package.json`:\n```json\n{\n  \"scripts\": {\n    \"format\": \"prettier --write .\",\n    \"format:check\": \"prettier --check .\",\n    \"format:diff\": \"prettier --list-different .\"\n  }\n}\n```

### Step 6: Format Existing Code\n```bash\nnpm run format\n```

### Step 7: Update CI Workflow\nAdd formatting check to `.github/workflows/ci.yml`:\n```yaml\n- name: Check code formatting\n  run: npm run format:check\n```

## Files to Create/Modify\n\n### New Files\n- `.prettierrc` - Prettier configuration\n- `.prettierignore` - Files to ignore\n\n### Modified Files\n- `.eslintrc.js` - Add Prettier integration\n- `package.json` - Add format scripts\n- `.github/workflows/ci.yml` - Add formatting check\n\n## Expected Outcomes\n\n- Consistent code formatting across the project\n- No conflicts between ESLint and Prettier\n- Automated formatting available via npm scripts\n- CI ensures code is properly formatted\n\n## Acceptance Criteria\n\n- [ ] Prettier formats code consistently\n- [ ] No conflicts between ESLint and Prettier rules\n- [ ] `npm run format` command works correctly\n- [ ] `npm run format:check` validates formatting\n- [ ] Existing code formatted without breaking functionality\n- [ ] CI fails on formatting violations\n- [ ] Development workflow improved\n\n## Risk Assessment\n\n| Risk | Probability | Impact | Mitigation |\n|------|-------------|--------|-----------|\n| Large formatting changes | High | Low | Review changes carefully, test functionality |\n| ESLint rule conflicts | Medium | Medium | Use eslint-config-prettier to disable conflicts |\n| Breaking code during formatting | Low | High | Test thoroughly after formatting |\n| Team resistance to formatting | Low | Low | Document benefits and provide clear guidelines |\n\n## Prettier Configuration Rationale\n\n### Settings Chosen\n- `semi: true` - Explicit semicolons for clarity\n- `singleQuote: true` - Consistent with modern JS practices\n- `trailingComma: \"es5\"` - Cleaner git diffs\n- `printWidth: 80` - Readable line lengths\n- `tabWidth: 2` - Standard for JavaScript\n- `arrowParens: \"avoid\"` - Cleaner arrow functions\n\n### Files Ignored\n- Generated files (coverage, dist)\n- Package manager files (package-lock.json)\n- Documentation that shouldn't be reformatted\n- Third-party or template files\n\n## Integration Points\n\n### ESLint Integration\n- Use `eslint-config-prettier` to disable conflicting rules\n- Add `prettier/prettier` rule to catch formatting issues\n- Ensure Prettier config comes last in extends array\n\n### CI Integration\n- Run `prettier --check` before tests\n- Fail CI on formatting violations\n- Consider auto-formatting in future with commits\n\n## Definition of Done\n\n- All acceptance criteria met\n- Code formatting consistent across project\n- ESLint/Prettier integration working smoothly\n- CI validates formatting\n- Ready for security auditing (Task 07)\n\n## Notes\n\n- Run formatting after ESLint to ensure compatibility\n- Review all formatting changes before committing\n- Consider adding format-on-save to development setup\n- Document formatting standards for contributors\n- Keep Prettier config minimal and standard