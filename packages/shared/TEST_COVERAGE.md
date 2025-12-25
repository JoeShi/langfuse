# Test Coverage Summary for packages/shared

This document summarizes the comprehensive unit tests added to the `packages/shared` directory.

## Test Infrastructure

### Configuration Files
- **vitest.config.ts**: Vitest configuration with 80% coverage thresholds
- **src/__tests__/setup.ts**: Test setup with environment variables and mocks

### Coverage Goals
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Test Files Created

### 1. Utils Tests (src/utils/__tests__/)

#### zod.test.ts (434 lines)
Tests for Zod schema utilities including:
- `jsonSchema` and `jsonSchemaNullable` - JSON schema validation
- `paginationZod`, `publicApiPaginationZod`, `optionalPaginationZod` - Pagination schemas
- `queryStringZod` - URL query string decoding
- `paginationMetaResponseZod` - Pagination metadata
- `urlRegex` and `noUrlCheck` - URL validation
- `NonEmptyString`, `StringNoHTML`, `StringNoHTMLNonEmpty` - String validation
- `validateZodSchema` - Schema validation helper
- `JSONPrimitiveValueSchema`, `JSONValueSchema`, `JSONObjectSchema`, `JSONArraySchema` - JSON types
- `sanitizeEmailSubject` - Email security (CRLF injection prevention)

**Coverage**: Comprehensive edge cases including security vulnerabilities, empty values, special characters

#### stringChecks.test.ts (245 lines)
Tests for string manipulation utilities:
- `getIsCharOrUnderscore` - Character validation
- `VARIABLE_REGEX`, `MUSTACHE_REGEX`, `MULTILINE_VARIABLE_REGEX`, `UNCLOSED_VARIABLE_REGEX` - Pattern matching
- `isValidVariableName` - Variable name validation
- `extractVariables` - Mustache template variable extraction
- `stringifyValue` - Value to string conversion

**Coverage**: Edge cases, invalid inputs, complex templates, deduplication

#### typeChecks.test.ts (70 lines)
Tests for type checking utilities:
- `isPresent` - Null/undefined/empty checks with type guards
- `stringDateTime` - ISO datetime validation

**Coverage**: Type guards, array filtering, nullish values

#### objects.test.ts (80 lines)
Tests for object manipulation:
- `removeObjectKeys` - Key removal without mutation

**Coverage**: Single/multiple keys, immutability, mixed types, edge cases

#### json.test.ts (330 lines)
Tests for JSON parsing utilities:
- `deepParseJson` - Recursive JSON parsing
- `deepParseJsonIterative` - Iterative implementation
- `parseJsonPrioritised` - Lossless JSON parsing

**Coverage**: 
- Nested JSON strings
- Python dict/list syntax conversion
- Prototype pollution prevention (__proto__, constructor, prototype)
- MaxDepth and maxSize limits
- Large numbers preservation
- Edge cases and invalid JSON

#### environment.test.ts (135 lines)
Tests for environment utilities:
- `removeEmptyEnvVariables` - Empty string removal from env vars

**Coverage**: Null/undefined/false/0 preservation, mutations, mixed types

#### scores.test.ts (150 lines)
Tests for score validation:
- `applyScoreValidation` - Zod refinement for score IDs

**Coverage**: traceId/sessionId/datasetRunId validation rules, observationId requirements

#### prompts.test.ts (150 lines)
Tests for prompt utilities:
- `extractPlaceholderNames` - Placeholder extraction from messages

**Coverage**: Filtering, type safety, edge cases

#### jsonSchemaValidation.test.ts (330 lines)
Tests for JSON Schema validation:
- `createAjvInstanceInternal` - Ajv instance creation
- `isValidJSONSchema` - Schema validation
- `validateFieldAgainstSchema` - Data validation
- `validateWithCompiledSchema` - Compiled validator reuse

**Coverage**: Complex schemas, nested objects, arrays, enums, formats, error handling

### 2. Encryption Tests (src/encryption/__tests__/)

#### encryption.test.ts (180 lines)
Tests for encryption/decryption:
- `keyGen` - Key generation
- `encrypt` - AES-256-GCM encryption
- `decrypt` - Decryption with auth tag

**Coverage**: Round-trip encryption, tamper detection, special characters, empty strings, missing env var

#### signature.test.ts (250 lines)
Tests for webhook signatures:
- `generateWebhookSecret` - Secret generation
- `getDisplaySecretKey` - Secret masking
- `generateWebhookSignature` - HMAC-SHA256 signatures
- `createSignatureHeader` - Signature header format

**Coverage**: Secret uniqueness, timestamp handling, different inputs, integration flow

### 3. Error Tests (src/errors/__tests__/)

#### errors.test.ts (280 lines)
Tests for all error classes:
- `BaseError` - Base error class
- `ApiError`, `LangfuseNotFoundError`, `InvalidRequestError`
- `UnauthorizedError`, `ForbiddenError`, `ConflictError`
- `InternalServerError`, `NotImplementedError`, `MethodNotAllowedError`
- `ServiceUnavailableError`

**Coverage**: All error types, HTTP codes, inheritance, operational flags, stack traces

### 4. Constants Tests (src/__tests__/)

#### constants.test.ts (75 lines)
Tests for constants:
- `ModelUsageUnit` enum

**Coverage**: All enum values, comparisons, switch statements

## Test Statistics

### Total Test Files: 11
### Total Test Lines: ~2,700+
### Total Test Cases: ~350+

### Modules Tested:
- ✅ utils/zod.ts
- ✅ utils/stringChecks.ts
- ✅ utils/typeChecks.ts
- ✅ utils/objects.ts
- ✅ utils/json.ts
- ✅ utils/environment.ts
- ✅ utils/scores.ts
- ✅ utils/prompts.ts
- ✅ utils/jsonSchemaValidation.ts
- ✅ encryption/encryption.ts
- ✅ encryption/signature.ts
- ✅ errors/* (all error classes)
- ✅ constants.ts

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Coverage Exclusions

The following are excluded from coverage requirements:
- Server-side code (src/server/**)
- Feature modules (src/features/**)
- Prisma/Clickhouse schemas
- Scripts
- Type definitions only files
- Generated files

## Test Patterns Used

1. **Arrange-Act-Assert**: Clear test structure
2. **Edge Case Testing**: Empty strings, null, undefined, special characters
3. **Security Testing**: Injection attacks, prototype pollution
4. **Type Safety**: TypeScript type guards and inference
5. **Error Handling**: Invalid inputs, missing data, malformed data
6. **Integration**: Round-trip operations, complex workflows

## Key Features Tested

### Security
- ✅ CRLF injection prevention in email subjects
- ✅ Prototype pollution prevention in JSON parsing
- ✅ HTML tag sanitization
- ✅ Webhook signature verification
- ✅ Encryption tamper detection

### Data Validation
- ✅ Zod schema validation
- ✅ JSON Schema validation
- ✅ Pagination constraints
- ✅ Variable name validation
- ✅ Score ID validation rules

### Data Transformation
- ✅ Deep JSON parsing
- ✅ Python dict/list conversion
- ✅ URL decoding
- ✅ Value stringification
- ✅ Object key removal

### Error Handling
- ✅ All HTTP error classes
- ✅ Operational vs non-operational errors
- ✅ Error inheritance
- ✅ Stack traces

## Notes

- All tests follow existing patterns from worker tests
- Tests use Vitest (matching worker package)
- Mocking is minimal and focused on crypto randomness
- Tests are isolated and can run in any order
- Coverage thresholds are enforced in vitest.config.ts
