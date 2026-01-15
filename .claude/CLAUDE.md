# Evoke-Square Project

## Quick Reference
- See @README.md for project overview
- See @package.json for npm commands
- See @readme/structure.md for function/component registry

## Tech Stack
- **Framework**: Next.js 15 with TypeScript
- **ORM**: Prisma (SQLite dev, SQL Server prod)
- **Package Manager**: pnpm (ALWAYS use pnpm, never npm or yarn)
- **State Management**: Zustand for global, React hooks for local
- **Styling**: TailwindCSS exclusively
- **AI Services**: OpenAI, Gemini, Gamma, Google TTS (see `server/lib/ai-models.ts`)

## Key Directories
```
server/
├── app/
│   ├── [locale]/         # Localized pages (en, zh-TW)
│   ├── actions/          # Server actions
│   ├── api/              # API route handlers
│   ├── components/       # Page-specific components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # SDK factory functions (OpenAI, Gemini, Gamma, TTS)
│   ├── stores/           # Zustand stores
│   └── types/            # TypeScript type definitions
├── lib/                  # Shared utilities
│   ├── ai-models.ts      # AI model registry (IMPORT FROM HERE)
│   ├── api-middleware.ts # API middleware utilities
│   ├── subscription-utils.ts # Subscription logic
│   └── prisma.ts         # Database client
├── prompts/              # AI prompt templates (.txt files)
├── prisma/               # Database schema and migrations
└── messages/             # i18n translations
    ├── en/               # English translations
    └── zh-TW/            # Traditional Chinese translations
client/                   # Frontend components
readme/                   # Project documentation
scripts/                  # Utility scripts
```

---

# ESSENTIAL COMMANDS

```bash
# Development
cd server && pnpm run dev       # Start dev server (MUST be in server/)
cd server && pnpm run build     # Build the application (MUST be in server/)

# Database
pnpm db:dev:migrate             # Run migrations (names: release_33, release_34, etc.)

# Quality
npx next lint                   # Run ESLint
npx tsc --noEmit                # Type check without build
```

## Migration Naming Convention
**ALWAYS** name migrations as `release_{n}` where `{n}` is the next sequential number.
- Current latest: `release_32`
- Next migration: `release_33`
- Command: `pnpm db:dev:migrate` (will prompt for name, enter `release_33`)

---

# INDUSTRY STANDARDS (MANDATORY)

The following standards are based on Apple, Microsoft, and Amazon engineering practices.

---

## 1. File Size Limit: 300 Lines Maximum

**EVERY file MUST be under 300 lines of code.** No exceptions.

### Critical Violations (Requiring Immediate Refactoring)
| File | Current Lines | Max Allowed | Priority |
|------|---------------|-------------|----------|
| `server/app/[locale]/apps/comics-generator/components/ComicsGeneratorWizard.tsx` | 4,308 | 300 | CRITICAL |
| `server/app/[locale]/apps/components/AppWizard.tsx` | 3,370 | 300 | CRITICAL |
| `server/app/[locale]/apps/story-generator/components/StoryGeneratorWizard.tsx` | 2,383 | 300 | CRITICAL |
| `server/app/[locale]/apps/slide-generator/components/SlideGeneratorWizard.tsx` | 2,000+ | 300 | CRITICAL |
| `server/app/api/comics-generator/plan/route.ts` | 1,974 | 300 | CRITICAL |
| `server/lib/tool-model-config.ts` | 1,927 | 300 | CRITICAL |

### Splitting Strategy
When a file exceeds 300 lines:
1. **Identify logical sections** - group related functions/components
2. **Create max 3-4 new files** - don't over-fragment
3. **Run tests after each extraction** - verify no regressions
4. **Update imports** - ensure clean dependency graph

---

## 2. Zero Code Redundancy

**NEVER duplicate code.** Every function must be reusable.

### Identified Redundancy Issues (Fix Required)
| Issue | Files Affected | Action |
|-------|----------------|--------|
| `buildContentDisposition()` duplicated | 5 API routes | Extract to `lib/download-utils.ts` |
| AI filename generation duplicated | 4 API routes | Extract to `lib/ai-filename-generator.ts` |
| Admin action handlers boilerplate | 5 routes | Create factory pattern in `lib/admin-action-handler.ts` |
| Error status mapping repeated | 10+ files | Create `lib/error-status-mapper.ts` |

### Before Creating ANY New Code:
1. **CHECK `readme/structure.md`** - Is there an existing function?
2. **Search codebase** - Use grep/Explore agent
3. **Extract common patterns** - If similar code exists, refactor first
4. **Document new code** - Add to `readme/structure.md`

---

## 3. Variable Naming Standards (Industry Standard)

Variables must be self-documenting. Follow these rules:

### Forbidden Patterns
```typescript
// WRONG - Single letter variables (except loop counters)
const a = document.createElement('a');
const j = await res.json();
const p = progress;
const d = new Date();

// CORRECT - Descriptive names
const downloadLink = document.createElement('a');
const responseData = await res.json();
const progressValue = progress;
const parsedDate = new Date();
```

### Boolean Naming (MUST use prefix)
```typescript
// WRONG
success: boolean;
visible: boolean;
htpMode: boolean;

// CORRECT
isSuccessful: boolean;
isVisible: boolean;
shouldEnableHighTonePreservation: boolean;
```

### Function Naming (MUST start with verb)
```typescript
// WRONG
filename();
data();
user();

// CORRECT
generateFilename();
fetchData();
getCurrentUser();
```

### Type/Interface Naming
```typescript
// WRONG - Generic names
interface Props { }
type Data = { }

// CORRECT - Domain-specific names
interface SlideGeneratorProps { }
type UserSubscriptionData = { }
```

### Abbreviations (Expand cryptic ones)
```typescript
// WRONG
const chi = 'chinese';
const htp = true;

// CORRECT
const languageChinese = 'chinese';
const highTonePreservation = true;
```

---

## 4. Code Quality Standards

### TypeScript Safety
```typescript
// FORBIDDEN - Never use any
const data: any = response;

// REQUIRED - Use unknown with type guards
const data: unknown = response;
if (isValidResponse(data)) {
  // data is now typed
}
```

### Error Handling
```typescript
// FORBIDDEN - Empty catch blocks
try { } catch (error) { }

// FORBIDDEN - Generic error messages
return errorResponse('Internal server error');

// REQUIRED - Meaningful error handling
try {
  // operation
} catch (error) {
  logger.error('Failed to process subscription', { error, userId });
  return errorResponse(
    'Subscription processing failed',
    ERROR_CODES.SUBSCRIPTION_ERROR,
    500
  );
}
```

### Environment Variables
```typescript
// FORBIDDEN - Module-level access
const API_KEY = process.env.OPENAI_API_KEY;

// REQUIRED - Runtime access via factory function
'use server';
export async function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY required');
  return new OpenAI({ apiKey });
}
```

### Consistent API Responses
```typescript
// REQUIRED - Always use api-middleware helpers
import { successResponse, errorResponse } from '@/lib/api-middleware';

// Good
return successResponse({ data: result });
return errorResponse('Not found', ERROR_CODES.NOT_FOUND, 404);

// Bad - Don't use raw NextResponse.json
return NextResponse.json({ success: true, data: result });
```

---

## 5. Build Error Resolution

### FORBIDDEN Practices
```typescript
// eslint-disable-next-line  // NEVER
// eslint-disable            // NEVER
// @ts-ignore                // NEVER
// @ts-expect-error          // NEVER
: any                        // NEVER
```

### REQUIRED Approach
- **Fix root causes** - Don't suppress errors
- **Add proper types** - Use Prisma generated types
- **Use type guards** - Validate unknown data
- **Update schema** - If types are missing, update source of truth

---

# CRITICAL RULES SUMMARY

1. **MAX 300 lines per file** - Split larger files immediately
2. **ZERO code duplication** - Extract and reuse
3. **Descriptive variable names** - No single letters, no abbreviations
4. **Boolean prefix required** - is/has/should/can
5. **NEVER use `any` type** - Use `unknown` with type guards
6. **NEVER hardcode AI models** - Import from `lib/ai-models.ts`
7. **NEVER manually create Prisma types** - Use generated types only
8. **NEVER access env vars at module level** - Use factory functions
9. **ALWAYS await route params** - Next.js 15 requirement
10. **ALWAYS check `readme/structure.md`** before creating functions

---

# AI Models Registry

All AI model identifiers are centralized in `server/lib/ai-models.ts`. **NEVER hardcode model strings.**

### OpenAI Models
| Constant | Model ID | Capability |
|----------|----------|------------|
| `OPENAI_GPT_5` | `gpt-5` | Text (flagship reasoning) |
| `OPENAI_GPT_5_NANO` | `gpt-5-nano` | Text (medium reasoning) |
| `OPENAI_GPT_4_1` | `gpt-4.1` | Text (standard) |
| `OPENAI_GPT_4_1_MINI` | `gpt-4.1-mini` | Text (fast) |
| `OPENAI_GPT_4_1_NANO` | `gpt-4.1-nano` | Text (cheapest) |
| `OPENAI_GPT_4O` | `gpt-4o` | Text + Vision |
| `OPENAI_GPT_4O_MINI` | `gpt-4o-mini` | Text + Vision (fast) |
| `OPENAI_O3_MINI` | `o3-mini` | Text (reasoning) |
| `OPENAI_O4_MINI` | `o4-mini` | Text (next-gen reasoning) |
| `OPENAI_GPT_IMAGE_1` | `gpt-image-1` | Image generation |
| `OPENAI_SORA_2` | `sora-2` | Video generation |

### Gemini Models
| Constant | Model ID | Capability |
|----------|----------|------------|
| `GEMINI_3_PRO_PREVIEW` | `gemini-3-pro-preview` | Text + Multimodal |
| `GEMINI_3_FLASH_PREVIEW` | `gemini-3-flash-preview` | Text + Multimodal (fast) |
| `GEMINI_2_5_PRO` | `gemini-2.5-pro` | Text (complex tasks) |
| `GEMINI_2_5_FLASH` | `gemini-2.5-flash` | Text (quick responses) |

### Usage Example
```typescript
import { AI_MODELS } from '@/lib/ai-models';

// CORRECT
const response = await openai.responses.create({ model: AI_MODELS.OPENAI_GPT_5 });

// WRONG - Never do this
const response = await openai.responses.create({ model: 'gpt-5' });
```

---

# API Routes (Next.js 15)

```typescript
// CORRECT - await params
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
}

// WRONG - don't destructure directly
export async function GET(request: Request, { params: { id } }: Props) { }
```

---

# Security Rules

### Never Write Credentials to Source Code
- **NEVER** hardcode credentials, secrets, or tokens
- **NEVER** include example credentials in comments
- **ALWAYS** use environment variables at runtime
- **ALWAYS** add `.env`, `.env.local` to `.gitignore`

### Authentication
- ALWAYS use NextAuth.js for authentication
- ALWAYS use server components for data fetching where possible
- Validate ALL user inputs
- Sanitize HTML output with `lib/document-sanitize.ts`
- Never expose sensitive data in responses

---

# Hooks Configuration

| Hook | Purpose | Script |
|------|---------|--------|
| PostToolUse | Visual notifications on file changes | `hooks/task-notify.sh` |
| PostToolUse | Test file change detection | `hooks/test-runner.sh` |
| Notification | Alert when Claude needs input | Inline osascript |
| SessionStart | Set development environment | `hooks/session-start.sh` |

---

# MCP Tools Usage

When available MCP servers match the task, **ALWAYS use them**:

### Chrome DevTools MCP
- `mcp__chrome-devtools__take_snapshot` - Get page accessibility tree
- `mcp__chrome-devtools__take_screenshot` - Capture page screenshots
- `mcp__chrome-devtools__click` / `fill` - Interact with elements
- `mcp__chrome-devtools__navigate_page` - Navigate browser
- `mcp__chrome-devtools__list_console_messages` - Debug console logs
- `mcp__chrome-devtools__list_network_requests` - Inspect network

---

# Session Progress Tracking
1. Use TodoWrite tool to create task lists
2. Mark tasks in_progress before starting
3. Mark tasks completed immediately after finishing
4. Never batch completions - update in real-time

# Context Management for Long Sessions
- Use `/compact` when context exceeds 80% capacity
- Name sessions descriptively with `/rename`
- Use `/rewind` for checkpoints before risky changes
- Break large tasks into focused episodes

---

# Pre-Commit Checklist

Before committing ANY code:
- [ ] File is under 300 lines
- [ ] No code duplication (checked `readme/structure.md`)
- [ ] All variables have descriptive names
- [ ] Boolean fields use is/has/should/can prefix
- [ ] No `any` types used
- [ ] No eslint-disable or ts-ignore comments
- [ ] Build passes: `cd server && pnpm run build`
- [ ] Updated `readme/structure.md` if new functions added

---

# Git Conventions (Industry Standard)

Based on practices from Google, Angular, GitHub, and the Conventional Commits specification.

## Branch Naming Convention

**Format:** `<type>/<ticket-id>-<short-description>`

### Branch Type Prefixes
| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New functionality | `feature/JIRA-123-user-auth` |
| `fix/` | Bug fixes | `fix/PROD-456-login-error` |
| `hotfix/` | Urgent production fixes | `hotfix/critical-payment-bug` |
| `release/` | Release preparation | `release/v2.1.0` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code restructuring | `refactor/auth-module` |
| `debug/` | Debugging/investigation | `debug/RAG-structure-implementation` |

### Branch Naming Rules
- **Use lowercase only** - Avoids case-sensitivity issues
- **Use hyphens as separators** - Not underscores or spaces
- **Include ticket/issue numbers** - Enables traceability
- **Keep names short** - 3-5 words max after prefix

---

## Commit Message Convention (Conventional Commits)

**Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types
| Type | Purpose | SemVer Impact |
|------|---------|---------------|
| `feat` | New feature | MINOR bump |
| `fix` | Bug fix | PATCH bump |
| `docs` | Documentation only | No bump |
| `style` | Formatting (no code change) | No bump |
| `refactor` | Code restructuring | No bump |
| `perf` | Performance improvement | PATCH bump |
| `test` | Adding/fixing tests | No bump |
| `build` | Build system changes | No bump |
| `ci` | CI configuration | No bump |
| `chore` | Maintenance tasks | No bump |

### Commit Message Rules
1. **Subject line ≤50 characters** - Concise summary
2. **Use imperative mood** - "Add feature" not "Added feature"
3. **Don't capitalize first letter** - `feat: add login` not `feat: Add login`
4. **No period at end** - `fix: resolve bug` not `fix: resolve bug.`
5. **Body wraps at 72 characters** - For readability
6. **Explain WHY in body** - Not just what changed

### Breaking Changes
Two ways to indicate:
```bash
# Method 1: Exclamation mark
feat!: remove deprecated API

# Method 2: Footer notation
feat(auth): change authentication flow

BREAKING CHANGE: removes support for OAuth 1.0
```

### Examples
```bash
# Simple fix
fix: resolve login redirect loop

# Feature with scope
feat(rag): add document chunking for CJK content

# With body explaining why
fix(api): handle race condition in job polling

The previous implementation could return stale data when multiple
polling requests arrived simultaneously. This adds optimistic locking
to ensure consistent responses.

Closes #1234

# Breaking change
feat(auth)!: migrate to OAuth 2.0

BREAKING CHANGE: OAuth 1.0 endpoints have been removed.
Users must update their authentication flow.
```

### Scopes for This Project
| Scope | Usage |
|-------|-------|
| `api` | API route changes |
| `ui` | UI component changes |
| `db` | Database/Prisma changes |
| `auth` | Authentication changes |
| `rag` | RAG system changes |
| `i18n` | Translation changes |
| `ai` | AI service changes |
| `admin` | Admin panel changes |

---

## Git Workflow (GitHub Flow)

This project uses **GitHub Flow**:

1. **Create branch** from `main` with proper naming
2. **Make commits** following Conventional Commits
3. **Open Pull Request** for review
4. **Merge to `main`** after approval

### Commit Frequency
- Commit at least once per logical change
- Each commit should be a single, reversible unit
- Run `git diff --check` before committing to catch whitespace errors

---

## Co-Author Attribution

When Claude assists with code, commits should include:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

# Available Commands

Detailed guidance is available in `.claude/commands/`:

### Core Rules
| Command | Description |
|---------|-------------|
| `core-rules` | Core programming principles |
| `typescript-rules` | TypeScript best practices |
| `nextjs-rules` | Next.js 15 patterns |
| `error-handling` | Error handling best practices |

### Development Patterns
| Command | Description |
|---------|-------------|
| `database-prisma` | Prisma ORM usage |
| `ai-prompting` | AI API usage |
| `component-creation` | Component architecture |
| `file-splitting` | Large file refactoring |
| `state-management` | Zustand guidelines |
| `sdk-initialization` | SDK factory pattern |

### Usage
```bash
cat .claude/commands/nextjs-rules.md
cat .claude/commands/component-creation.md
```
