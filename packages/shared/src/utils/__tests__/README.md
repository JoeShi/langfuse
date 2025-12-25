# Utility Functions Test Suite

This directory contains comprehensive unit tests for all utility functions in the `packages/shared/src/utils/` directory.

## Test Coverage

### Files Tested
- ✅ `environment.ts` - Environment variable utilities
- ✅ `json.ts` - JSON parsing and manipulation
- ✅ `jsonSchemaValidation.ts` - JSON schema validation utilities
- ✅ `objects.ts` - Object manipulation utilities
- ✅ `prompts.ts` - Prompt message utilities
- ✅ `scores.ts` - Score validation utilities
- ✅ `stringChecks.ts` - String validation utilities
- ✅ `typeChecks.ts` - Type checking utilities
- ✅ `zod.ts` - Zod schema utilities

### Statistics
- **Total Test Files**: 9
- **Total Test Cases**: 307
- **Coverage Target**: 90%+ for lines, functions, branches, and statements

## Running Tests

### Prerequisites
```bash
# Install dependencies (from project root)
pnpm install
```

### Test Commands
```bash
# Run all tests once
pnpm --filter @langfuse/shared test

# Run tests in watch mode (for development)
pnpm --filter @langfuse/shared test:watch

# Generate coverage report
pnpm --filter @langfuse/shared coverage
```

## Test Structure

Each test file follows this structure:
```typescript
import { describe, it, expect } from "vitest";
import { functionToTest } from "../sourceFile";

describe("sourceFile.ts", () => {
  describe("functionToTest", () => {
    it("should handle normal case", () => {
      // Test implementation
    });
    
    it("should handle edge case", () => {
      // Test implementation
    });
  });
});
```

## Test Philosophy

### Independence
- Each test is independent and can run in isolation
- No shared state between tests
- No test depends on the execution order

### Determinism
- All tests produce consistent, reproducible results
- No flaky tests or race conditions
- No reliance on external services or timing

### Comprehensiveness
- Normal use cases
- Edge cases (null, undefined, empty values)
- Boundary conditions (size limits, numeric ranges)
- Error handling (invalid input, malformed data)
- Security concerns (injection attacks, prototype pollution)

### Documentation
- Clear, descriptive test names
- Tests serve as living documentation
- Complex scenarios include explanatory comments

## Coverage Areas by File

### environment.test.ts (10 tests)
- Empty string removal
- Value preservation
- Edge cases (null, undefined, special characters)

### json.test.ts (43 tests)
- JSON parsing (valid, invalid, nested)
- Python dict/list parsing
- Large data handling (>1MB)
- Safe number parsing
- Dangerous key filtering

### jsonSchemaValidation.test.ts (32 tests)
- Schema validation
- Data validation against schemas
- DatasetSchemaValidator class methods
- Error reporting
- Performance (schema reuse)

### objects.test.ts (16 tests)
- Key removal
- Immutability
- Type preservation
- Edge cases

### prompts.test.ts (17 tests)
- Placeholder extraction
- Invalid message handling
- Order preservation
- Duplicate handling

### scores.test.ts (18 tests)
- Valid ID combinations (traceId, sessionId, datasetRunId)
- Invalid ID combinations
- ObservationId requirements
- Error messages

### stringChecks.test.ts (51 tests)
- Character validation
- Variable name validation
- Mustache template parsing
- Value stringification
- Edge cases (circular refs, BigInt)

### typeChecks.test.ts (36 tests)
- Presence checking (null, undefined, empty string)
- Type guard functionality
- DateTime validation (ISO 8601)
- Timezone handling
- Nullish behavior

### zod.test.ts (84 tests)
- JSON schema validation
- Pagination schemas (3 variants)
- URL regex
- HTML detection
- Email subject sanitization (security)
- Query string decoding
- JSON value schemas

## Special Test Cases

### Security Tests
- **CRLF Injection**: Email subject sanitization
- **Prototype Pollution**: Dangerous key filtering (__proto__, constructor, prototype)
- **HTML Injection**: Tag detection and removal
- **Control Characters**: ASCII 0-31 and 127 filtering

### Performance Tests
- Large data structures (>1MB)
- Schema compilation and reuse
- Depth limits for recursive parsing

### Type Safety Tests
- Type guard functionality
- TypeScript type inference
- Generic type preservation

## Maintenance

### Adding New Tests
1. Create test file matching the source file: `<filename>.test.ts`
2. Import from parent directory: `from "../sourceFile"`
3. Follow the existing test structure
4. Aim for 90%+ coverage
5. Include edge cases and error scenarios

### Test Naming Convention
- Describe what the function should do: `"should handle X case"`
- Be specific: `"should remove empty string values from object"`
- Use clear, readable names

### Best Practices
- Keep tests focused and small
- One assertion per logical concept
- Use descriptive variable names
- Mock external dependencies if needed
- Test both success and failure paths

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (no external dependencies)
- Deterministic results
- Clear failure messages
- Coverage reporting

## Troubleshooting

### Tests Fail to Run
```bash
# Ensure dependencies are installed
pnpm install

# Build the shared package first
pnpm --filter @langfuse/shared build
```

### Coverage Below Threshold
```bash
# Run coverage report to identify gaps
pnpm --filter @langfuse/shared coverage

# Check HTML report in coverage/index.html
```

### Import Errors
- Verify the import path is correct relative to __tests__ directory
- Ensure the source file exports the function/constant
- Check for TypeScript compilation errors

## Contributing

When adding new utility functions:
1. Write tests first (TDD approach) or immediately after implementation
2. Ensure 90%+ coverage for the new function
3. Include edge cases and error scenarios
4. Update this README if adding a new test file
5. Run full test suite before committing

## Related Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Langfuse Contributing Guide](../../../../CONTRIBUTING.md)
- [Worker Test Examples](../../../../worker/src/__tests__/)
