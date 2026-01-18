# Nutritrack v1.0.0 Release Notes

## Overview

This release includes comprehensive security fixes, code quality improvements, database optimizations, accessibility enhancements, and developer experience improvements. All changes have been verified with TypeScript compilation passing with zero errors.

---

## 🔒 Security Fixes

### 1. Edge Functions JWT Authentication

**Files Modified:**
- `supabase/functions/_shared/auth.ts` (NEW)
- `supabase/functions/analyze-food/index.ts`
- `supabase/functions/chat/index.ts`

**What Changed:**
- Added JWT token verification to both `analyze-food` and `chat` Edge Functions
- Unauthorized requests now receive a 401 error with proper CORS headers
- Created a shared authentication module (`_shared/auth.ts`) for code reuse

**Implementation Details:**

```typescript
// _shared/auth.ts - Shared JWT verification
export async function verifyAuth(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error || !user ? null : { userId: user.id, email: user.email };
}
```

**Security Benefits:**
- ✅ Prevents unauthorized API access
- ✅ Validates user identity before processing requests
- ✅ Consistent authentication across all Edge Functions

---

### 2. Input Sanitization (Prompt Injection Prevention)

**Files Modified:**
- `services/ai.ts` (client-side)
- `supabase/functions/analyze-food/index.ts` (server-side)
- `supabase/functions/chat/index.ts` (server-side)

**What Changed:**
- Added defense-in-depth sanitization on both client and server
- Filters common prompt injection patterns

**Patterns Blocked:**
| Pattern | Description |
|---------|-------------|
| `[SYSTEM]` | System prompt override attempts |
| `[INST]` / `[/INST]` | Instruction injection markers |
| `<<SYS>>` | System prompt delimiters |
| `</s>` | End-of-sequence tokens |
| `system:` / `assistant:` | Role override attempts |
| `ignore previous instructions` | Jailbreak attempts |
| `pretend you are` | Role-play manipulation |

**Implementation:**

```typescript
function sanitizeUserInput(input: string, maxLength = 2000): string {
  const sanitized = input
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/\[INST\]/gi, '')
    .replace(/<<SYS>>/gi, '')
    .replace(/ignore previous instructions/gi, '')
    .replace(/pretend you are/gi, '')
    // ... more patterns
    .trim()
    .slice(0, maxLength);
  return sanitized;
}
```

**Security Benefits:**
- ✅ Prevents AI model manipulation
- ✅ Limits input length to prevent abuse
- ✅ Defense-in-depth (client + server validation)

---

### 3. app.json Cleanup

**File Modified:** `app.json`

**What Changed:**
- Removed duplicate iOS URL schemes
- Removed duplicate Android permissions
- Consolidated configuration to prevent conflicts

**Before (duplicates):**
```json
"CFBundleURLSchemes": [
  "nutritrack",
  "com.nutritrack.app",
  "nutritrack",  // duplicate
  "com.googleusercontent.apps...."
]
```

**After (cleaned):**
```json
"CFBundleURLSchemes": [
  "nutritrack",
  "com.nutritrack.app",
  "com.googleusercontent.apps.269611860485-..."
]
```

---

## 📦 Code Quality - Large File Splitting

### 4. Onboarding Component Refactoring

**Original:** `onboarding.tsx` - 1,832 lines  
**After:** 14 files, main component reduced to 314 lines

**New File Structure:**
```
app/(auth)/onboarding/
├── index.tsx              # Main orchestration (314 lines)
├── components/
│   ├── index.ts           # Barrel export
│   ├── BasicsStep.tsx     # Name, gender, DOB
│   ├── MetricsStep.tsx    # Height, weight, activity
│   ├── GoalsStep.tsx      # Primary & health goals
│   ├── ConditionsStep.tsx # Medical conditions
│   ├── MedicationsStep.tsx# Medications & supplements
│   ├── DietaryStep.tsx    # Diet preferences & allergies
│   └── SummaryStep.tsx    # Review & confirmation
├── hooks/
│   └── useOnboardingState.ts  # State management hook
├── options.ts             # Translated option generators
├── styles.ts              # StyleSheet definitions
└── types.ts               # TypeScript interfaces
```

**Benefits:**
- ✅ Single Responsibility Principle
- ✅ Easier testing of individual steps
- ✅ Better code navigation
- ✅ Reusable hooks and styles

---

### 5. Types Directory Restructuring

**Original:** `types/index.ts` - 537 lines  
**After:** 8 domain-specific files

**New Structure:**
```
types/
├── index.ts       # Re-exports all types
├── user.ts        # User profile, settings, preferences
├── nutrition.ts   # Food logs, nutrition data, meals
├── activity.ts    # Exercise logs, activity tracking
├── wellness.ts    # Health metrics, wellness data
├── calculator.ts  # BMR, TDEE, energy calculations
├── notification.ts# Notification types & settings
└── summary.ts     # Daily/weekly summary types
```

**Benefits:**
- ✅ Domain-driven organization
- ✅ Easier to find related types
- ✅ Better tree-shaking potential
- ✅ Clearer import paths

---

### 6. Duplicate Code Removal in userStore

**File Modified:** `stores/userStore.ts`

**What Changed:**
- Removed duplicate `calculateBMR()` function
- Removed duplicate `getActivityMultiplier()` function
- Now imports from centralized `lib/energy-calculator.ts`

**Before:**
```typescript
// userStore.ts had its own implementations
function calculateBMR(...) { /* duplicate code */ }
function getActivityMultiplier(...) { /* duplicate code */ }
```

**After:**
```typescript
// userStore.ts now imports from lib
import { calculateBMR, getActivityMultiplier } from '../lib/energy-calculator';
```

**Benefits:**
- ✅ DRY principle (Don't Repeat Yourself)
- ✅ Single source of truth for calculations
- ✅ Easier to update formulas in one place

---

## 🗄️ Database Optimizations

### 7. Repository Pagination

**Files Modified:**
- `services/database/repositories/foodRepository.ts`
- `services/database/repositories/habitRepository.ts`
- `services/database/repositories/exerciseRepository.ts`

**What Changed:**
- Added `limit` and `offset` parameters to query functions
- Default limit: 50 records per query
- Prevents loading excessive data into memory

**Example Implementation:**

```typescript
export function getFoodLogsByUserId(
  userId: string,
  limit: number = 50,
  offset: number = 0
): FoodLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<FoodLogRow>(
    'SELECT * FROM food_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );
  return rows.map(rowToFoodLog);
}
```

**Benefits:**
- ✅ Improved app performance
- ✅ Reduced memory usage
- ✅ Better battery life on mobile
- ✅ Supports infinite scroll patterns

---

## ♿ Accessibility Features (App Store Required)

### 8. Tab Navigation Accessibility

**File Modified:** `app/(tabs)/_layout.tsx`

**What Changed:**
- Added `tabBarAccessibilityLabel` to all 5 tabs
- Added accessibility attributes to header buttons

**Implementation:**

```tsx
<Tabs.Screen
  name="index"
  options={{
    tabBarAccessibilityLabel: t('nav.home'),
    // ...
  }}
/>

<TouchableOpacity
  accessibilityLabel="Settings"
  accessibilityRole="button"
  accessibilityHint="Opens settings page"
>
  <Ionicons name="settings-outline" />
</TouchableOpacity>
```

---

### 9. Main Pages Accessibility

**Files Modified:**
- `app/(tabs)/index.tsx`
- `app/(tabs)/camera.tsx`
- `app/(tabs)/chat.tsx`
- `app/(tabs)/habits.tsx`
- `app/(tabs)/settings.tsx`

**What Changed:**
- All interactive elements now have accessibility properties
- Added 17 new translation keys for accessibility labels (English & Chinese)

**Accessibility Properties Added:**
| Property | Purpose |
|----------|---------|
| `accessibilityLabel` | Screen reader text |
| `accessibilityRole` | Element type (button, link, etc.) |
| `accessibilityHint` | Action description |
| `accessibilityState` | Current state (selected, disabled) |

**Benefits:**
- ✅ VoiceOver/TalkBack support
- ✅ App Store compliance
- ✅ Better user experience for all users

---

## 🛠️ Developer Experience

### 10. Centralized Logger

**File Created:** `lib/logger.ts`

**Features:**
- Log levels: `debug`, `log`, `info`, `warn`, `error`
- Development mode only (production silent except errors)
- Timestamp formatting
- Prefixed logger support for modules

**Usage:**

```typescript
import { logger, createLogger } from '../lib/logger';

// Basic usage
logger.log('[UserStore]', 'User logged in', { userId });
logger.error('[API]', 'Request failed', error);

// Module-specific logger
const log = createLogger('[FoodRepository]');
log.debug('Querying food logs');
log.info('Created new food log', { id });
```

**Configuration:**

```typescript
// Custom configuration
const customLogger = new Logger({
  forceEnable: true,      // Enable in production
  minLevel: 'warn',       // Only warn and error
});
```

**Benefits:**
- ✅ Consistent logging format
- ✅ No console noise in production
- ✅ Easy to add Sentry integration later
- ✅ ESLint compliant (uses `console.warn`/`console.error`)

---

### 11. GitHub Actions CI

**File Created:** `.github/workflows/ci.yml`

**Pipeline Steps:**
1. Checkout code
2. Setup Node.js
3. Install pnpm
4. Install dependencies
5. Run ESLint
6. Run TypeScript type checking

**Triggers:**
- Every push to any branch
- Every pull request

**Benefits:**
- ✅ Automated code quality checks
- ✅ Catch errors before merge
- ✅ Consistent code standards
- ✅ PR status checks

---

## ✅ Verification

### TypeScript Compilation
```bash
$ pnpm tsc --noEmit
# Exit code: 0 (no errors)
```

### Build Status
- ✅ TypeScript: No errors
- ✅ All imports resolved
- ✅ No type mismatches

---

## 📋 Summary of Changes

| Category | Changes | Impact |
|----------|---------|--------|
| **Security** | 3 fixes | Critical - prevents unauthorized access |
| **Code Quality** | 3 refactors | High - maintainability |
| **Database** | 1 optimization | Medium - performance |
| **Accessibility** | 2 enhancements | Required for App Store |
| **DevEx** | 2 additions | High - developer productivity |

**Total Commits:** 9  
**Files Changed:** ~30+  
**Lines Added/Removed:** Significant refactoring

---

## 🔜 Recommended Next Steps

1. **Phase 6.1**: Integrate Sentry for production error tracking (logger is ready)
2. **Testing**: Add unit tests for the new step components
3. **CI Enhancement**: Add build verification to the GitHub Actions pipeline
4. **Documentation**: Update API documentation with new auth requirements

---

## 📚 References

- [Edge Functions Authentication](https://supabase.com/docs/guides/functions/auth)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [App Store Accessibility Guidelines](https://developer.apple.com/accessibility/)
- [Prompt Injection Prevention](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
