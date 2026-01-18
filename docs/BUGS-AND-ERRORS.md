# Nutritrack Bugs and Errors Report

> Last Updated: 2026-01-18
> Analysis Type: Code Quality Audit

## Executive Summary

Nutritrack passes TypeScript and ESLint checks with **zero errors**. However, the codebase has **19 files exceeding the 300-line limit**, several **empty catch blocks**, one **unprotected JSON.parse**, and **4 TODO items** indicating incomplete features.

---

## 1. Automated Check Results

| Check | Status | Count |
|-------|--------|-------|
| TypeScript Errors | **PASS** | 0 |
| ESLint Errors | **PASS** | 0 |
| `any` Type Usage | **PASS** | 0 |
| `@ts-ignore` / `@ts-expect-error` | **PASS** | 0 |
| `eslint-disable` | **PASS** | 0 |

---

## 2. Code Quality Issues

### 2.1 JSON.parse Without Try-Catch

| File | Line | Severity | Issue |
|------|------|----------|-------|
| `services/ai.ts` | 437 | **HIGH** | `JSON.parse(jsonMatch[0])` - Not wrapped in try-catch |

**Risk:** Malformed JSON from AI response will crash the app.

**Fix:**
```typescript
// Before
const parsed = JSON.parse(jsonMatch[0]);

// After
try {
  const parsed = JSON.parse(jsonMatch[0]);
} catch (error) {
  logger.error('Failed to parse AI response', { error });
  return { success: false, error: 'Invalid AI response format' };
}
```

### 2.2 Empty Catch Blocks

| File | Line | Severity | Issue |
|------|------|----------|-------|
| `app/_layout.tsx` | 25 | **MEDIUM** | `.catch(() => {})` swallows font loading errors |
| `app/_layout.tsx` | 52 | **MEDIUM** | `.catch(() => {})` swallows SplashScreen errors |

**Fix:**
```typescript
// Before
SplashScreen.preventAutoHideAsync().catch(() => {});

// After
SplashScreen.preventAutoHideAsync().catch((error) => {
  logger.warn('Failed to prevent splash screen auto-hide', { error });
});
```

### 2.3 Missing Error Handler

| File | Line | Severity | Issue |
|------|------|----------|-------|
| `hooks/useTranslation.ts` | 34 | **MEDIUM** | `.then()` without `.catch()` for i18n initialization |

**Fix:**
```typescript
// Before
loadInitialLanguage().then((initialLanguage) => {
  setLanguage(initialLanguage);
});

// After
loadInitialLanguage()
  .then((initialLanguage) => {
    setLanguage(initialLanguage);
  })
  .catch((error) => {
    logger.error('Failed to load initial language', { error });
    setLanguage('en'); // Fallback
  });
```

---

## 3. Deprecated API Usage

| File | Line | Severity | Issue |
|------|------|----------|-------|
| `services/supabase.ts` | 249 | **MEDIUM** | `clearSession()` is deprecated |

**Fix:**
```typescript
// Before
await supabaseClient.auth.clearSession();

// After
await supabaseClient.auth.signOut();
```

---

## 4. Console Logging

### Production-Ready (Using Logger)

Most files correctly use the `logger` utility from `lib/logger.ts`.

### Needs Migration

| File | Line | Usage |
|------|------|-------|
| `supabase/functions/_shared/auth.ts` | 32 | `console.error('Missing SUPABASE_URL...')` |

**Note:** Edge Functions may need to use `console.error` for Supabase logging. Acceptable.

---

## 5. TODO/FIXME Comments

| File | Line | Comment | Priority |
|------|------|---------|----------|
| `stores/habitStore.ts` | 140 | `// TODO: Implement sync logic` | HIGH |
| `stores/exerciseStore.ts` | 398 | `// TODO: Implement actual health app integration` | MEDIUM |
| `stores/foodStore.ts` | 84 | `// TODO: Implement sync logic` | HIGH |
| `lib/logger.ts` | 98 | `// TODO: Add Sentry integration when Phase 6.1 is implemented` | LOW |

---

## 6. Simulated/Mock Functionality

| File | Line | Issue | Status |
|------|------|-------|--------|
| `app/contact.tsx` | 87 | Simulated form submission delay | Needs real implementation |
| `stores/exerciseStore.ts` | 386 | Mock health app integration | Needs HealthKit/Google Fit |
| `services/ai.ts` | 511, 558 | Demo mode simulated delays | Acceptable for demo |

---

## 7. Files Exceeding 300-Line Limit

Per CLAUDE.md coding standards, all files should be under 300 lines.

| File | Lines | Excess | Priority |
|------|-------|--------|----------|
| `locales/zh-TW.ts` | 1153 | +853 | LOW (data file) |
| `locales/en.ts` | 1153 | +853 | LOW (data file) |
| `services/ai.ts` | 563 | +263 | **HIGH** |
| `stores/userStore.ts` | 529 | +229 | **HIGH** |
| `services/social-auth.ts` | 518 | +218 | **HIGH** |
| `components/onboarding/styles.ts` | 518 | +218 | MEDIUM |
| `app/(auth)/login.tsx` | 484 | +184 | MEDIUM |
| `app/profile-edit.tsx` | 476 | +176 | MEDIUM |
| `components/ui/PieChart.tsx` | 474 | +174 | MEDIUM |
| `services/database/repositories/userRepository.ts` | 436 | +136 | MEDIUM |
| `app/tools/calculators/insulin-calculator.tsx` | 432 | +132 | MEDIUM |
| `app/tools/calculators/creon-calculator.tsx` | 432 | +132 | MEDIUM |
| `services/database/repositories/habitRepository.ts` | 422 | +122 | MEDIUM |
| `services/auth.ts` | 418 | +118 | MEDIUM |
| `constants/exercises.ts` | 414 | +114 | LOW (data file) |
| `services/database/repositories/exerciseRepository.ts` | 411 | +111 | MEDIUM |
| `stores/exerciseStore.ts` | 406 | +106 | MEDIUM |
| `components/ui/NutritionBadge.tsx` | 370 | +70 | LOW |
| `components/navigation/HamburgerMenu.tsx` | 353 | +53 | LOW |

### Recommended Splitting

**services/ai.ts (563 lines) -> Split into:**
- `services/ai/food-analysis.ts` - Food image analysis
- `services/ai/chat.ts` - Chat functionality
- `services/ai/demo-responses.ts` - Demo mode responses
- `services/ai/index.ts` - Exports

**stores/userStore.ts (529 lines) -> Split into:**
- `stores/user/auth-actions.ts` - Sign in/out/up
- `stores/user/profile-actions.ts` - Profile updates
- `stores/user/demo-actions.ts` - Demo mode
- `stores/user/store.ts` - State definition
- `stores/user/index.ts` - Exports

**services/social-auth.ts (518 lines) -> Split into:**
- `services/auth/google-auth.ts` - Google OAuth
- `services/auth/apple-auth.ts` - Apple Sign-In
- `services/auth/token-storage.ts` - Token handling
- `services/auth/index.ts` - Exports

---

## 8. Potential XSS Vectors

| File | Line | Risk Level | Notes |
|------|------|------------|-------|
| `app/+html.tsx` | 32 | **LOW** | Uses innerHTML pattern but only with static CSS defined in same file |

**Assessment:** The content is a static string constant defined locally, not user input. Safe in this specific case.

---

## 9. Remediation Priority

### Immediate (Before Next Release)

| Issue | File | Line | Action |
|-------|------|------|--------|
| JSON.parse crash | `services/ai.ts` | 437 | Wrap in try-catch |
| Empty catch #1 | `app/_layout.tsx` | 25 | Add error logging |
| Empty catch #2 | `app/_layout.tsx` | 52 | Add error logging |
| Missing catch | `hooks/useTranslation.ts` | 34 | Add error handler |

### Short-Term (Next Sprint)

| Issue | Action |
|-------|--------|
| Deprecated API | Replace `clearSession()` with `signOut()` |
| TODO: sync logic | Implement cloud sync for habit/food/exercise stores |
| Large files | Split `services/ai.ts`, `stores/userStore.ts`, `services/social-auth.ts` |

### Long-Term (Backlog)

| Issue | Action |
|-------|--------|
| Health app integration | Implement HealthKit/Google Fit |
| Contact form | Implement real submission |
| Sentry integration | Add error tracking service |
| Remaining large files | Refactor files > 300 lines |

---

## 10. Code Quality Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| TypeScript strict mode | Enabled | Enabled | PASS |
| ESLint errors | 0 | 0 | PASS |
| Files > 300 lines | 19 | 0 | FAIL |
| Empty catch blocks | 2 | 0 | FAIL |
| TODO comments | 4 | 0 | WARN |
| Deprecated APIs | 1 | 0 | WARN |
| Unhandled JSON.parse | 1 | 0 | FAIL |

---

## 11. Quick Fix Script

```bash
# Run these checks before each commit
cd /Users/hillmanchan/Desktop/client-website/Nutritrack

# TypeScript check
npx tsc --noEmit

# ESLint check
npx expo lint

# Find files over 300 lines
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20

# Find TODO comments
grep -r "TODO:" --include="*.ts" --include="*.tsx" .

# Find empty catch blocks
grep -r "catch.*{.*}" --include="*.ts" --include="*.tsx" .
```

---

## 12. Summary

**Overall Code Quality: B**

| Category | Grade | Notes |
|----------|-------|-------|
| Type Safety | A | Zero `any` types, strict mode |
| Linting | A | Zero ESLint errors |
| Error Handling | C | Empty catches, missing try-catch |
| File Organization | C | 19 files exceed limit |
| Technical Debt | B | 4 TODOs, 1 deprecated API |

**Next Steps:**
1. Fix the 4 immediate error handling issues
2. Split the 3 largest non-data files
3. Implement sync logic TODOs
4. Add Sentry for production error tracking
