# Running Tests for @langfuse/shared

This package now includes comprehensive unit tests with 80% coverage goals.

## Prerequisites

Ensure you have dependencies installed:

```bash
pnpm install
```

## Running Tests

### Run all tests once
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Generate coverage report
```bash
pnpm test:coverage
```

The coverage report will be generated in multiple formats:
- **Terminal**: Summary displayed in console
- **HTML**: `coverage/index.html` - Open in browser for detailed view
- **JSON**: `coverage/coverage-final.json`
- **LCOV**: `coverage/lcov.info` - For CI/CD integration

## Coverage Thresholds

The following thresholds must be met:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Test Structure

```
src/
├── __tests__/
│   ├── setup.ts              # Test configuration and mocks
│   └── constants.test.ts     # Constants tests
├── utils/
│   └── __tests__/
│       ├── zod.test.ts
│       ├── stringChecks.test.ts
│       ├── typeChecks.test.ts
│       ├── objects.test.ts
│       ├── json.test.ts
│       ├── environment.test.ts
│       ├── scores.test.ts
│       ├── prompts.test.ts
│       └── jsonSchemaValidation.test.ts
├── encryption/
│   └── __tests__/
│       ├── encryption.test.ts
│       └── signature.test.ts
└── errors/
    └── __tests__/
        └── errors.test.ts
```

## What's Tested

### Core Utilities
- ✅ Zod schema validation and sanitization
- ✅ String manipulation and validation
- ✅ Type checking and guards
- ✅ Object operations
- ✅ JSON parsing (including Python dict syntax)
- ✅ Environment variable handling
- ✅ Score validation rules
- ✅ Prompt placeholder extraction
- ✅ JSON Schema validation (Ajv)

### Security
- ✅ Encryption/decryption (AES-256-GCM)
- ✅ Webhook signature generation and verification
- ✅ CRLF injection prevention
- ✅ Prototype pollution prevention
- ✅ HTML sanitization

### Error Handling
- ✅ All custom error classes
- ✅ HTTP status codes
- ✅ Error inheritance
- ✅ Stack traces

### Constants
- ✅ Enum definitions and usage

## Writing New Tests

When adding new functionality to `@langfuse/shared`, follow these guidelines:

1. **Create test file**: Place tests next to the module being tested in a `__tests__` directory
2. **Follow naming**: Use `*.test.ts` suffix
3. **Structure tests**: Use `describe` and `it` blocks
4. **Cover edge cases**: Test happy paths, errors, and boundary conditions
5. **Security focus**: Test for injection attacks and data sanitization
6. **Mock sparingly**: Only mock external dependencies or non-deterministic operations

Example:
```typescript
import { describe, it, expect } from "vitest";
import { yourFunction } from "../yourModule";

describe("yourModule", () => {
  describe("yourFunction", () => {
    it("should handle normal input", () => {
      const result = yourFunction("input");
      expect(result).toBe("expected");
    });

    it("should handle edge cases", () => {
      expect(yourFunction("")).toBe("");
      expect(() => yourFunction(null)).toThrow();
    });
  });
});
```

## CI/CD Integration

The tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: pnpm test

- name: Check coverage
  run: pnpm test:coverage
```

## Debugging Tests

### Run specific test file
```bash
pnpm test utils/__tests__/zod.test.ts
```

### Run tests matching pattern
```bash
pnpm test -t "sanitizeEmailSubject"
```

### Run with verbose output
```bash
pnpm test --reporter=verbose
```

## Troubleshooting

### Tests timing out
If tests are timing out, check for:
- Async operations without proper awaits
- Missing mocks for external services
- Infinite loops in test data

### Coverage not meeting threshold
Run with coverage to see which lines are missed:
```bash
pnpm test:coverage
```
Open `coverage/index.html` to see detailed line-by-line coverage.

### Environment variable issues
Ensure `ENCRYPTION_KEY` is set in tests. This is handled automatically by `src/__tests__/setup.ts`.

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Zod Documentation](https://zod.dev/)
- [Test Coverage Best Practices](https://martinfowler.com/bliki/TestCoverage.html)
