# Test Development Guidelines

## 🚨 CRITICAL: Test File Organization

**ALL TEST FILES MUST BE CREATED IN THE `tests/` DIRECTORY STRUCTURE**

### Directory Structure Rules

```
frontend/
├── tests/                  # ✅ ALL tests go here
│   ├── api/               # API integration tests
│   ├── puppeteer/         # Puppeteer E2E tests
│   ├── screenshots/       # Test output images
│   └── README.md          # Test documentation
├── src/                   # ✅ Source code only
└── package.json           # ✅ Configuration only
```

### ❌ FORBIDDEN: Test Files in Root

**NEVER create test files in these locations:**
- `frontend/test-*.js`
- `frontend/quick-*.js`
- `frontend/debug-*.js`
- `frontend/*-test.js`
- `frontend/*-verification.js`

### ✅ CORRECT: Test Files in Proper Locations

**ALWAYS create test files in these locations:**
- `frontend/tests/api/my-api-test.js`
- `frontend/tests/puppeteer/my-e2e-test.js`
- `frontend/tests/screenshots/my-output.png`

## Development Workflow

### 1. Before Creating Tests
- Check existing tests in `tests/` directories
- Determine test type (API vs E2E)
- Choose appropriate subdirectory

### 2. Creating New Tests
```bash
# ✅ CORRECT - Create in proper directory
touch frontend/tests/puppeteer/my-new-test.js

# ❌ WRONG - Never create in root
touch frontend/my-new-test.js
```

### 3. After Creating Tests
- Update `tests/README.md` with new test descriptions
- Add npm script to `package.json` if needed
- Test file should be immediately runnable from frontend directory

### 4. Running Tests
```bash
# Use npm scripts (preferred)
npm run test:api
npm run test:e2e
npm run test:ux

# Or direct node execution
node tests/puppeteer/my-test.js
```

## Test File Naming Conventions

### API Tests
- `test-api.js` - Basic API connectivity
- `check-api-structure.js` - API structure validation
- `test-[feature]-api.js` - Feature-specific API tests

### Puppeteer E2E Tests
- `test-[feature].js` - Comprehensive feature tests
- `quick-[feature].js` - Quick smoke tests
- `debug-[feature].js` - Debugging scripts
- `final-verification.js` - Final system verification

### Screenshots
- `[test-name]-success.png` - Success state screenshots
- `[test-name]-error.png` - Error state screenshots
- `[test-name]-mobile.png` - Mobile responsive tests

## Quality Standards

### Test File Requirements
- Must include comprehensive error handling
- Must generate screenshots on failure
- Must include descriptive console output
- Must be runnable from frontend directory
- Must not require additional setup beyond npm install

### Documentation Requirements
- Update `tests/README.md` when adding tests
- Include test purpose and expected outcomes
- Document any special requirements or dependencies
- Add npm script entries for easy execution

## Emergency Cleanup

If test files are accidentally created in the root directory:

```bash
# Move to proper location
mv frontend/test-*.js frontend/tests/puppeteer/
mv frontend/quick-*.js frontend/tests/puppeteer/
mv frontend/debug-*.js frontend/tests/puppeteer/

# Update documentation
# Edit tests/README.md
# Edit package.json scripts
```

## Remember: Clean Root Directory

The frontend root directory should only contain:
- Configuration files (package.json, vite.config.ts, etc.)
- Source code directory (src/)
- Build output directory (dist/)
- Test directory (tests/)
- Documentation files (README.md)

**NO test files should ever be in the root directory!**