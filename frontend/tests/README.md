# Frontend Tests

This directory contains all test files and test outputs for the Essay Tutor frontend.

## Directory Structure

```
tests/
├── api/                    # API integration tests
│   ├── test-api.js        # Basic API connectivity test
│   └── check-api-structure.js  # API structure validation test
├── puppeteer/             # Puppeteer E2E tests
│   ├── debug-evaluation.js      # Evaluation workflow debugging
│   ├── test-evaluation-workflow.js  # Full evaluation workflow test
│   ├── quick-test.js            # Quick smoke test
│   ├── final-verification.js    # Final verification test
│   ├── quick-evaluation-test.js # Quick evaluation test
│   ├── final-success-test.js    # Final success verification
│   ├── test-enhanced-ux.js      # Enhanced UX flow comprehensive test
│   ├── quick-ux-test.js         # Quick UX functionality test
│   └── simple-test.js           # Simple functionality verification
├── screenshots/           # Test output screenshots
│   ├── test-failure-screenshot.png
│   ├── final-state.png
│   ├── verification-error.png
│   ├── before-click.png
│   ├── debug-error.png
│   ├── evaluation-test-result.png
│   └── final-success-verification.png
└── README.md             # This file
```

## Test Types

### API Tests
- **test-api.js**: Basic API connectivity and endpoint validation
- **check-api-structure.js**: API structure and response format validation

### Puppeteer E2E Tests
- **debug-evaluation.js**: Debugging script for evaluation workflow issues
- **test-evaluation-workflow.js**: Complete end-to-end evaluation workflow test
- **quick-test.js**: Quick smoke test for basic functionality
- **final-verification.js**: Final verification of complete system
- **quick-evaluation-test.js**: Quick evaluation functionality test
- **final-success-test.js**: Final success verification test
- **test-enhanced-ux.js**: Comprehensive test of Phase 5 enhanced UX flow
- **quick-ux-test.js**: Quick test of enhanced text input functionality
- **simple-test.js**: Simple verification of dual input fields

### Screenshots
All test output screenshots are stored in `screenshots/` directory for debugging and verification purposes.

## Running Tests

### API Tests
```bash
# From frontend directory
node tests/api/test-api.js
node tests/api/check-api-structure.js
```

### Puppeteer Tests
```bash
# From frontend directory
node tests/puppeteer/debug-evaluation.js
node tests/puppeteer/test-evaluation-workflow.js
node tests/puppeteer/quick-test.js
# ... etc
```

## Test Dependencies

Ensure you have the following dependencies installed:
```bash
npm install puppeteer
```

## Notes

- Screenshots are automatically generated during test failures for debugging
- All tests assume the development server is running on `http://localhost:5174`
- API tests assume the backend server is running on `http://localhost:3001`
- Tests are organized by type (API vs E2E) for better maintainability

## 🚨 IMPORTANT: Test File Organization

**ALL TEST FILES MUST BE CREATED IN THE `tests/` DIRECTORY STRUCTURE**

- **NEVER** create test files in the frontend root directory
- **ALWAYS** place test files in the appropriate subdirectory:
  - API tests → `tests/api/`
  - Puppeteer E2E tests → `tests/puppeteer/`
  - Screenshots → `tests/screenshots/`
- **ALWAYS** update this README.md when adding new test files
- **ALWAYS** use the provided npm scripts for running tests

### Quick Reference for Test Creation:
```bash
# ❌ WRONG - Don't create tests in frontend root
frontend/my-test.js

# ✅ CORRECT - Create tests in proper directories
frontend/tests/api/my-api-test.js
frontend/tests/puppeteer/my-e2e-test.js
```