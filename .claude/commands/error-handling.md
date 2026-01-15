# Error Handling Rules

Guidelines for robust, observable, and maintainable error handling.

## Core Principles

### 1. Never Catch Errors Prematurely
- Do NOT catch errors unless you can handle them meaningfully
- Avoid empty catch blocks or blocks that suppress errors without logging
- Let errors propagate to a level where they can be logged/handled globally
- **NEVER mask real errors with generic "Internal server error" messages**

### 2. Always Log Errors
- All unhandled errors must be logged using Microsoft Application Insights
- Include sufficient context: error message, stack trace, request/user info
- If Application Insights unavailable, use alternatives (Sentry, Datadog, etc.)

### 3. API Endpoint Error Handling
- Let database errors, external API failures, and service errors propagate
- Only catch expected validation errors (invalid JWT, missing fields)
- Framework-level handlers will log to Application Insights with proper context

## Examples

### INCORRECT - Error Masking

```typescript
// BAD: Masks real errors, prevents debugging
export async function POST(request: Request) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    const result = await openai.chat.completions.create(params);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error); // Not sufficient for production
    return NextResponse.json(
      { error: 'Internal server error' }, // Generic, unhelpful
      { status: 500 }
    );
  }
}
```

### CORRECT - Let Errors Propagate

```typescript
// GOOD: Let real errors bubble up to Application Insights
export async function POST(request: Request) {
  // Validate input (expected errors)
  const { text, targetLanguage } = await request.json();
  if (!text || !targetLanguage) {
    return NextResponse.json(
      { error: 'Text and target language are required' },
      { status: 400 }
    );
  }

  // Let service errors propagate (database, OpenAI, etc.)
  const user = await prisma.user.findUnique({ where: { id } });
  const result = await openai.responses.create(params);

  return NextResponse.json({ success: true, data: result });
}
```

### CORRECT - Specific Error Handling

```typescript
// GOOD: Handle specific expected errors, let unexpected propagate
try {
  decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
} catch (jwtError) {
  // Expected error - invalid/expired token
  return {
    success: false,
    error: 'Invalid or expired token',
    status: 401
  };
}
// Database and other errors propagate automatically
```

## Build Error Resolution

### NEVER Use ESLint Disables
- **Forbidden:** `// eslint-disable-next-line`
- **Forbidden:** `// eslint-disable`
- **Forbidden:** `/* eslint-disable */`

### NEVER Use TypeScript Suppressions
- **Forbidden:** `// @ts-ignore`
- **Forbidden:** `// @ts-expect-error` (except in specific test scenarios)
- **Forbidden:** `any` type in controlled code

### Fix Root Causes
- Address the underlying type safety or code quality issue
- Understand WHY the error exists before fixing
- Ensure the fix improves code quality

## Proper Resolution Examples

### TypeScript Type Errors

```typescript
// WRONG: Using any to hide error
const messages: any[] = [...]

// CORRECT: Import and use proper types
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
const messages: ChatCompletionMessageParam[] = [...]
```

### React Hook Dependencies

```typescript
// WRONG: Ignoring dependency warnings
useEffect(() => {
  loadData()
}, [id]) // eslint-disable-next-line react-hooks/exhaustive-deps

// CORRECT: Proper dependency management
const loadData = useCallback(async () => {
  // implementation
}, [id, dependency]);

useEffect(() => {
  loadData();
}, [loadData]);
```

## Benefits of This Approach

1. **Better Debugging**: Real errors reach Application Insights with full stack traces
2. **Proper Monitoring**: Database issues, API failures visible in logs
3. **Faster Resolution**: Developers see actual error causes
4. **Production Insights**: Application Insights can track and alert on real issues
