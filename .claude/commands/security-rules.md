# Security Rules

Security best practices and credential handling for this project.

## Never Write Credentials to Source Code

### Core Principle
Credentials (API keys, secrets, passwords, private keys) must NEVER be written directly into source code or committed to the repository.

### Guidelines

1. **Never Write Credentials in Code**
   - Do NOT hardcode any credentials in source files, configs, or scripts
   - Do NOT include example credentials or placeholders in comments

2. **Environment Variables**
   - ALWAYS use environment variables to access credentials at runtime
   - Reference `process.env.MY_SECRET_KEY`, but NEVER include actual values

3. **Guiding Users**
   When credentials are required, provide clear instructions:
   1. Sign up for the required service (Google Cloud, OpenAI, etc.)
   2. Generate/download API key from provider's dashboard
   3. Open (or create) `.env.local` file in project root
   4. Add: `MY_SECRET_KEY=your-key-here`
   5. Save file. Do NOT commit if it contains secrets
   6. Restart application to load new variables

4. **.env and Secrets Files**
   - Ensure `.env`, `.env.local`, and secrets files are in `.gitignore`
   - Provide `env.example` with variable names, but NEVER with real/fake secrets

5. **Code Review and Automation**
   - Reviewers MUST reject any code that includes credentials
   - Use automated checks to scan for secret leaks

## Authentication

- ALWAYS use NextAuth.js for authentication
- ALWAYS use environment variables for sensitive data
- ALWAYS use NextAuth session provider at root layout
- ALWAYS use server components for data fetching where possible

## Runtime SDK Initialization

Wrap SDK clients in async factory functions to prevent build-time credential access:

```typescript
'use server';

export async function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({ apiKey });
}
```

## Input Validation

- Validate ALL user inputs
- Use parameterized queries (Prisma handles this)
- Sanitize HTML output with `lib/document-sanitize.ts`
- Never expose sensitive data in responses

## Common Anti-Patterns to Avoid

### WRONG: Module-level credential access
```typescript
// Causes build errors when env vars aren't available
const API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: API_KEY });
```

### WRONG: Hardcoded credentials
```typescript
const apiKey = 'sk-abc123...'; // NEVER do this
```

### CORRECT: Runtime access via factory
```typescript
'use server';

export async function createClient() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error('API_KEY required');
  return new Client({ apiKey });
}
```

## Client-Server Separation

- **NEVER expose system prompts to the client** - security vulnerability
- Create separate `.client.ts` files for client-side metadata
- Server-side files handle actual prompt loading and sensitive configs
- Use API endpoints to get configured sessions without exposing prompts
