# Troubleshooting Guide

Common issues and solutions for this codebase.

## How to Use
- Search for your error message or issue description
- Follow the recommended solution
- If issue not listed, document problem and solution here after resolving

---

## Next.js 15: Asynchronous Route Parameters

### Problem
In Next.js 15, route parameters are asynchronous and must be awaited. Accessing them synchronously results in errors or undefined values.

### Solution
Always extract and await route parameters at the beginning of route handlers.

**INCORRECT:**
```typescript
export async function GET(request, { params }) {
  // ❌ params.id is not available synchronously
  const user = await prisma.user.findUnique({
    where: { id: params.id }
  });
}
```

**CORRECT:**
```typescript
export async function GET(request, { params }) {
  // ✅ Await params before accessing properties
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id }
  });
}
```

---

## Build Errors: Module-Level Environment Variables

### Problem
Accessing `process.env` at module level causes build failures when env vars aren't available during build.

### Solution
Wrap in async server functions. See `/sdk-initialization` command for full pattern.

**INCORRECT:**
```typescript
const API_KEY = process.env.OPENAI_API_KEY; // Runs at build time!
const openai = new OpenAI({ apiKey: API_KEY });
```

**CORRECT:**
```typescript
'use server';

export async function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY required');
  return new OpenAI({ apiKey });
}
```

---

## TypeScript: Missing Type Definitions

### Problem
`Type 'X' is not assignable to type 'Y'` or missing properties.

### Solution
1. Check if using Prisma types - import from `@prisma/client`
2. For external APIs, import official type definitions
3. For custom data, define proper interfaces

```typescript
// Import Prisma types
import type { User, Assignment } from '@prisma/client';

// Import OpenAI types
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
```

---

## React: useEffect Infinite Loops

### Problem
Component re-renders infinitely, browser becomes unresponsive.

### Solution
Wrap functions in `useCallback` when used as dependencies.

**INCORRECT:**
```typescript
const loadData = () => { /* ... */ };

useEffect(() => {
  loadData();
}, [loadData]); // Infinite loop - function recreated each render
```

**CORRECT:**
```typescript
const loadData = useCallback(() => {
  /* ... */
}, [dependency1, dependency2]);

useEffect(() => {
  loadData();
}, [loadData]); // Stable reference
```

---

## Prisma: Type Mismatch with Null/Undefined

### Problem
`Type 'undefined' is not assignable to type 'string | null'`

### Solution
Trust Prisma's generated types. Use `null` for database null values, not `undefined`.

```typescript
// For nullable fields
const data = {
  description: formData.description || null, // Use null, not undefined
};
```

---

## Next.js Image: External URL 400 Errors

### Problem
Using Next.js `<Image>` with external URLs causes 400 errors in production.

### Solution
Use regular `<img>` for external/CDN images.

**INCORRECT:**
```typescript
import Image from 'next/image';
<Image src="https://cdn.example.com/image.png" alt="..." />
```

**CORRECT:**
```typescript
<img
  src="https://cdn.example.com/image.png"
  alt="..."
  className="w-full h-auto"
/>
```

---

## Translation: Missing Keys

### Problem
`MISSING_MESSAGE: namespace.key (locale)`

### Solution
1. Check key exists in correct translation file
2. Verify namespace is loaded in ClientIntlProvider
3. Server components can only access main namespace, not feature files

---

## Reporting New Issues

When you encounter a new recurring issue, add a section with:
- Description of the problem
- Error message (if any)
- Solution or workaround
- Sample code if applicable
