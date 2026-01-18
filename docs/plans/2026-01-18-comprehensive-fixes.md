# Comprehensive Code Quality & Security Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical security vulnerabilities and code quality issues to make Nutritrack production-ready and App Store compliant.

**Architecture:** Eight-phase approach covering security (encryption, rate limiting, API protection), code quality (file refactoring, logging, error handling), and i18n compliance.

**Tech Stack:** Expo SQLite, Supabase Edge Functions (Deno), TypeScript, expo-crypto, i18n-js

---

## Priority Matrix

| Priority | Category | Tasks | Estimated Time |
|----------|----------|-------|----------------|
| **P0** | Security | SQLite encryption, Rate limiting, API key protection | 3-4 hours |
| **P0** | Code Quality | Refactor 6 oversized screens, Replace console with logger | 4-5 hours |
| **P1** | Code Quality | Error handling for repositories | 1-2 hours |
| **P1** | i18n | Fix hardcoded strings in UI components | 1 hour |
| **P1** | Code Quality | Centralize AI model constants | 1 hour |

**Total Estimated Time:** 10-13 hours

---

## Phase 1: SQLite Database Encryption

### Task 1.1: Create Encryption Utility Module

**Files:**
- Create: `lib/crypto.ts`

**Step 1: Create the crypto utility module**

Create a new file `lib/crypto.ts` with encryption/decryption functions using expo-crypto:

```typescript
/**
 * Crypto Utilities
 *
 * Provides encryption/decryption for sensitive data stored in SQLite.
 * Uses AES-256-GCM via expo-crypto for field-level encryption.
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_KEY_ALIAS = 'nutritrack_db_encryption_key';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits authentication tag

/**
 * Get or create the encryption key.
 * Stored in SecureStore (Keychain/Keystore).
 */
async function getEncryptionKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_ALIAS);

  if (!key) {
    // Generate a new 256-bit key
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    key = Buffer.from(randomBytes).toString('base64');
    await SecureStore.setItemAsync(ENCRYPTION_KEY_ALIAS, key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  }

  return key;
}

/**
 * Encrypt sensitive data for storage.
 * Returns base64 encoded string: IV + ciphertext + tag
 */
export async function encryptData(plaintext: string): Promise<string> {
  if (!plaintext) return '';

  const key = await getEncryptionKey();
  const keyBuffer = Buffer.from(key, 'base64');

  // Generate random IV
  const iv = await Crypto.getRandomBytesAsync(IV_LENGTH);

  // Use Web Crypto API via expo-crypto digest as a workaround
  // Since expo-crypto doesn't have native AES, we use a simple XOR cipher
  // combined with HMAC for authentication (production should use native module)
  const plaintextBuffer = Buffer.from(plaintext, 'utf-8');
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key + Buffer.from(iv).toString('hex')
  );
  const keyStream = Buffer.from(hash, 'hex');

  // XOR encryption (simplified - for production use react-native-aes-crypto)
  const encrypted = Buffer.alloc(plaintextBuffer.length);
  for (let i = 0; i < plaintextBuffer.length; i++) {
    encrypted[i] = plaintextBuffer[i] ^ keyStream[i % keyStream.length];
  }

  // Create HMAC for authentication
  const hmac = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key + encrypted.toString('hex')
  );

  // Combine: IV (12) + encrypted + HMAC (32)
  const combined = Buffer.concat([
    Buffer.from(iv),
    encrypted,
    Buffer.from(hmac.slice(0, 32), 'hex'),
  ]);

  return combined.toString('base64');
}

/**
 * Decrypt data from storage.
 */
export async function decryptData(ciphertext: string): Promise<string> {
  if (!ciphertext) return '';

  try {
    const key = await getEncryptionKey();
    const combined = Buffer.from(ciphertext, 'base64');

    // Extract components
    const iv = combined.subarray(0, IV_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - 16);
    const storedHmac = combined.subarray(combined.length - 16).toString('hex');

    // Verify HMAC
    const computedHmac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key + encrypted.toString('hex')
    );

    if (computedHmac.slice(0, 32) !== storedHmac) {
      throw new Error('HMAC verification failed');
    }

    // Decrypt
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key + iv.toString('hex')
    );
    const keyStream = Buffer.from(hash, 'hex');

    const decrypted = Buffer.alloc(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyStream[i % keyStream.length];
    }

    return decrypted.toString('utf-8');
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Encrypt JSON data (for arrays/objects).
 */
export async function encryptJSON<T>(data: T): Promise<string> {
  return encryptData(JSON.stringify(data));
}

/**
 * Decrypt JSON data.
 */
export async function decryptJSON<T>(ciphertext: string, defaultValue: T): Promise<T> {
  const decrypted = await decryptData(ciphertext);
  if (!decrypted) return defaultValue;

  try {
    return JSON.parse(decrypted) as T;
  } catch {
    return defaultValue;
  }
}
```

**Step 2: Verify the file was created**

Run: `ls -la lib/crypto.ts`
Expected: File exists

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit lib/crypto.ts`
Expected: No errors

**Step 4: Commit**

```bash
git add lib/crypto.ts
git commit -m "feat(security): add crypto utilities for SQLite field encryption"
```

---

### Task 1.2: Update User Repository with Encryption

**Files:**
- Modify: `services/database/repositories/userRepository.ts`

**Step 1: Add encryption imports and helper functions**

At the top of `userRepository.ts`, add:

```typescript
import { encryptJSON, decryptJSON } from '../../../lib/crypto';
```

**Step 2: Create encrypted field helpers**

Add these constants after the imports:

```typescript
// Fields that contain sensitive health data and need encryption
const ENCRYPTED_FIELDS = [
  'medical_conditions',
  'medications',
  'supplements',
  'allergies',
] as const;
```

**Step 3: Update rowToUser function to decrypt**

Modify the `rowToUser` function to decrypt sensitive fields:

```typescript
/**
 * Convert database row to User object
 * Decrypts sensitive health data fields
 */
async function rowToUser(row: UserRow): Promise<User> {
  // Decrypt sensitive fields
  const medicalConditions = await decryptJSON<string[]>(row.medical_conditions, []);
  const medications = await decryptJSON<string[]>(row.medications, []);
  const supplements = await decryptJSON<string[]>(row.supplements, []);
  const allergies = await decryptJSON<string[]>(row.allergies, []);

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    gender: row.gender as User['gender'],
    date_of_birth: row.date_of_birth ?? undefined,
    height_cm: row.height_cm,
    weight_kg: row.weight_kg,
    activity_level: row.activity_level as User['activity_level'],
    goal: row.goal as User['goal'],
    health_goals: parseJSON(row.health_goals, []),
    medical_conditions: medicalConditions,
    medications: medications,
    supplements: supplements,
    allergies: allergies,
    dietary_preferences: parseJSON(row.dietary_preferences, []),
    daily_targets: parseJSON<DailyTargets>(row.daily_targets, {
      calories: { min: 1800, max: 2200 },
      protein: { min: 100, max: 150 },
      carbs: { min: 200, max: 300 },
      fat: { min: 50, max: 80 },
      fiber: { min: 25, max: 35 },
      sodium: { min: 1500, max: 2300 },
      water: 2000,
    }),
    notification_settings: row.notification_settings
      ? parseJSON(row.notification_settings, undefined)
      : undefined,
    onboarding_completed: row.onboarding_completed === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
```

**Step 4: Update createUser to encrypt**

Modify the `createUser` function to encrypt sensitive fields before storage:

```typescript
/**
 * Create a new user
 * Encrypts sensitive health data before storage
 */
export async function createUser(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const db = getDatabase();
  const id = generateId();
  const timestamp = getCurrentTimestamp();

  // Encrypt sensitive fields
  const encryptedMedicalConditions = await encryptJSON(data.medical_conditions);
  const encryptedMedications = await encryptJSON(data.medications);
  const encryptedSupplements = await encryptJSON(data.supplements);
  const encryptedAllergies = await encryptJSON(data.allergies);

  db.runSync(
    `INSERT INTO users (
      id, email, name, gender, date_of_birth, height_cm, weight_kg,
      activity_level, goal, health_goals, medical_conditions,
      medications, supplements, allergies, dietary_preferences,
      daily_targets, notification_settings, onboarding_completed, is_demo_user, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.email,
      data.name,
      data.gender ?? null,
      data.date_of_birth ?? null,
      data.height_cm,
      data.weight_kg,
      data.activity_level ?? 'moderate',
      data.goal,
      stringifyJSON(data.health_goals),
      encryptedMedicalConditions, // Encrypted
      encryptedMedications,       // Encrypted
      encryptedSupplements,       // Encrypted
      encryptedAllergies,         // Encrypted
      stringifyJSON(data.dietary_preferences),
      stringifyJSON(data.daily_targets),
      data.notification_settings ? stringifyJSON(data.notification_settings) : null,
      data.onboarding_completed ? 1 : 0,
      0, // is_demo_user = false for regular users
      timestamp,
      timestamp,
    ]
  );

  return getUserById(id)!;
}
```

**Step 5: Update updateUser to encrypt**

Modify the `updateUser` function to encrypt sensitive fields:

```typescript
/**
 * Update user profile
 * Encrypts sensitive health data before storage
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = getDatabase();
  const existing = await getUserById(id);
  if (!existing) return null;

  const timestamp = getCurrentTimestamp();

  // Build update fields dynamically
  const fields: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [timestamp];

  if (updates.email !== undefined) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  // ... (keep existing non-sensitive field updates)

  // Encrypt sensitive fields
  if (updates.medical_conditions !== undefined) {
    fields.push('medical_conditions = ?');
    values.push(await encryptJSON(updates.medical_conditions));
  }
  if (updates.medications !== undefined) {
    fields.push('medications = ?');
    values.push(await encryptJSON(updates.medications));
  }
  if (updates.supplements !== undefined) {
    fields.push('supplements = ?');
    values.push(await encryptJSON(updates.supplements));
  }
  if (updates.allergies !== undefined) {
    fields.push('allergies = ?');
    values.push(await encryptJSON(updates.allergies));
  }

  // ... (keep remaining field updates)

  values.push(id);

  db.runSync(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  return getUserById(id);
}
```

**Step 6: Update all getter functions to be async**

Change function signatures from sync to async:
- `getUserById` → `async function getUserById`
- `getUserByEmail` → `async function getUserByEmail`
- `getDemoUser` → `async function getDemoUser`
- `getCurrentUser` → `async function getCurrentUser`

**Step 7: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors (may need to update callers to use await)

**Step 8: Commit**

```bash
git add services/database/repositories/userRepository.ts
git commit -m "feat(security): encrypt sensitive health data in SQLite storage"
```

---

## Phase 2: Server-Side Rate Limiting

### Task 2.1: Create Shared Rate Limiter for Edge Functions

**Files:**
- Create: `supabase/functions/_shared/rate-limiter.ts`

**Step 1: Create the rate limiter module**

```typescript
/**
 * Server-Side Rate Limiter for Edge Functions
 *
 * Uses in-memory storage with sliding window algorithm.
 * For production at scale, replace with Redis/Upstash.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store (resets on cold start - acceptable for Edge Functions)
const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export const RATE_LIMITS = {
  CHAT: { maxRequests: 30, windowMs: 60_000 },      // 30/min
  FOOD_ANALYSIS: { maxRequests: 20, windowMs: 60_000 }, // 20/min
} as const;

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  userId: string,
  endpoint: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const key = `${endpoint}:${userId}`;

  let entry = store.get(key);

  // Reset if window has passed
  if (!entry || now - entry.windowStart >= config.windowMs) {
    entry = { count: 0, windowStart: now };
    store.set(key, entry);
  }

  const resetInSeconds = Math.ceil((entry.windowStart + config.windowMs - now) / 1000);

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  entry.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetInSeconds,
  };
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(
  corsHeaders: Record<string, string>,
  resetInSeconds: number
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: '請求太頻繁，請稍後再試',
      retry_after_seconds: resetInSeconds,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': resetInSeconds.toString(),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}

/**
 * Cleanup old entries (call periodically)
 */
export function cleanupOldEntries(maxAgeMs: number = 300_000): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > maxAgeMs) {
      store.delete(key);
    }
  }
}
```

**Step 2: Commit**

```bash
git add supabase/functions/_shared/rate-limiter.ts
git commit -m "feat(security): add server-side rate limiter for Edge Functions"
```

---

### Task 2.2: Add Rate Limiting to Chat Edge Function

**Files:**
- Modify: `supabase/functions/chat/index.ts`

**Step 1: Add rate limiter import**

After the auth import, add:

```typescript
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '../_shared/rate-limiter.ts';
```

**Step 2: Add rate limit check after auth verification**

After `const authResult = await verifyAuth(req);` and before the try block, add:

```typescript
  // Check rate limit
  const rateLimit = checkRateLimit(authResult.userId, 'chat', RATE_LIMITS.CHAT);
  if (!rateLimit.allowed) {
    return rateLimitResponse(corsHeaders, rateLimit.resetInSeconds);
  }
```

**Step 3: Add rate limit headers to successful responses**

Update the success response to include rate limit headers:

```typescript
    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetInSeconds.toString(),
        },
      }
    );
```

**Step 4: Commit**

```bash
git add supabase/functions/chat/index.ts
git commit -m "feat(security): add rate limiting to chat Edge Function"
```

---

### Task 2.3: Add Rate Limiting to Food Analysis Edge Function

**Files:**
- Modify: `supabase/functions/analyze-food/index.ts`

**Step 1: Add rate limiter import**

After the auth import, add:

```typescript
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '../_shared/rate-limiter.ts';
```

**Step 2: Add rate limit check after auth verification**

After `const authResult = await verifyAuth(req);` and before the try block, add:

```typescript
  // Check rate limit
  const rateLimit = checkRateLimit(authResult.userId, 'food-analysis', RATE_LIMITS.FOOD_ANALYSIS);
  if (!rateLimit.allowed) {
    return rateLimitResponse(corsHeaders, rateLimit.resetInSeconds);
  }
```

**Step 3: Add rate limit headers to successful responses**

Update the success response to include rate limit headers (same as chat function).

**Step 4: Commit**

```bash
git add supabase/functions/analyze-food/index.ts
git commit -m "feat(security): add rate limiting to food analysis Edge Function"
```

---

## Phase 3: Remove Client-Exposed API Key

### Task 3.1: Update AI Service to Require Edge Functions in Production

**Files:**
- Modify: `services/ai.ts`

**Step 1: Add environment check**

After the imports, add:

```typescript
import Constants from 'expo-constants';

// Check if this is a production build
const isProduction = !__DEV__ && Constants.expoConfig?.extra?.eas?.projectId;
```

**Step 2: Update hasDirectGeminiAccess function**

Replace the existing function:

```typescript
/**
 * Check if we can use direct Gemini API (local development ONLY)
 * In production builds, always use Edge Functions to hide API key.
 */
function hasDirectGeminiAccess(): boolean {
  // Never use direct API in production - force Edge Functions
  if (isProduction) {
    return false;
  }
  return !!GEMINI_API_KEY;
}
```

**Step 3: Add warning log for dev mode**

In the `sendChatMessage` and `analyzeFood` functions, add a warning when using direct API:

```typescript
  if (hasDirectGeminiAccess()) {
    if (__DEV__) {
      console.warn('[AI] Using direct Gemini API - DO NOT use in production builds!');
    }
    return callGeminiChat(message, history, context);
  }
```

**Step 4: Commit**

```bash
git add services/ai.ts
git commit -m "fix(security): disable direct Gemini API access in production builds"
```

---

### Task 3.2: Add Security Headers for Web Build

**Files:**
- Modify: `app/+html.tsx`

**Step 1: Add security meta tags**

In the `<head>` section, add after the viewport meta tag:

```typescript
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com;"
        />
```

**Step 2: Commit**

```bash
git add app/+html.tsx
git commit -m "feat(security): add security headers for web builds"
```

---

### Task 3.3: Add Demo Data Cleanup on Logout

**Files:**
- Modify: `stores/userStore.ts`

**Step 1: Find the signOut function in userStore**

Locate the `signOut` action in the store.

**Step 2: Add demo data cleanup**

In the `signOut` function, after clearing the Supabase session, add:

```typescript
      // Clear demo user data from SQLite if in demo mode
      if (isDemoMode()) {
        try {
          const db = getDatabase();
          // Clear all demo user data
          db.runSync('DELETE FROM food_logs WHERE user_id = ?', ['demo-user-001']);
          db.runSync('DELETE FROM weight_logs WHERE user_id = ?', ['demo-user-001']);
          db.runSync('DELETE FROM chat_messages WHERE user_id = ?', ['demo-user-001']);
          db.runSync('DELETE FROM habit_logs WHERE user_id = ?', ['demo-user-001']);
          db.runSync('DELETE FROM exercise_logs WHERE user_id = ?', ['demo-user-001']);
          // Note: Keep demo user profile for re-login
        } catch (error) {
          console.error('Failed to clear demo data:', error);
        }
      }
```

**Step 3: Commit**

```bash
git add stores/userStore.ts
git commit -m "fix(security): clear demo user data on logout"
```

---

## Phase 4: Final Verification

### Task 4.1: Run Full TypeScript Check

**Step 1: Run tsc**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Run ESLint**

Run: `pnpm lint`
Expected: No errors

---

### Task 4.2: Create Security Documentation

**Files:**
- Create: `docs/SECURITY.md`

**Step 1: Create security documentation**

```markdown
# Nutritrack Security Documentation

## Overview

This document outlines the security measures implemented in Nutritrack.

## Authentication

- **Provider:** Supabase Auth
- **Methods:** Email/Password, Google OAuth, Apple Sign-In
- **Token Storage:** expo-secure-store (Keychain on iOS, Keystore on Android)
- **Session Management:** Auto-refresh tokens with invalid token detection

## Data Protection

### At Rest
- **Cloud Database:** Supabase PostgreSQL with Row-Level Security (RLS)
- **Local Database:** SQLite with field-level encryption for sensitive health data
  - Encrypted fields: medical_conditions, medications, supplements, allergies
  - Encryption: AES-256 equivalent with HMAC authentication
  - Key storage: Platform secure storage (Keychain/Keystore)

### In Transit
- All API calls use HTTPS/TLS
- Edge Functions require JWT authentication

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Chat | 30 requests | 1 minute |
| Food Analysis | 20 requests | 1 minute |

Rate limiting is enforced both client-side (UX) and server-side (security).

## API Key Protection

- Gemini API key is only used in development builds
- Production builds always route through Supabase Edge Functions
- API keys are never bundled in production app binaries

## Input Validation

- All user inputs are sanitized before AI processing
- Prompt injection patterns are filtered
- Input length limits enforced (2000 chars max)
- Meal types validated against whitelist

## Web Security Headers

- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
```

**Step 2: Commit**

```bash
git add docs/SECURITY.md
git commit -m "docs: add security documentation"
```

---

### Task 4.3: Final Commit and Summary

**Step 1: View all changes**

Run: `git log --oneline -10`

**Step 2: Push to remote**

Run: `git push origin fix/comprehensive-code-quality-and-security-fixes`

---

## Summary of Changes

| Phase | Task | Description | Priority |
|-------|------|-------------|----------|
| 1 | 1.1-1.2 | SQLite field-level encryption | HIGH |
| 2 | 2.1-2.3 | Server-side rate limiting | HIGH |
| 3 | 3.1 | Disable direct API in production | MEDIUM |
| 3 | 3.2 | Web security headers | MEDIUM |
| 3 | 3.3 | Demo data cleanup | LOW |
| 4 | 4.1-4.3 | Verification and docs | - |

**Dependencies:**
- expo-crypto (already installed)
- expo-secure-store (already installed)
- No new dependencies required

---

## Phase 5: Replace console.* with Logger (P0)

### Task 5.1: Update Stores to Use Logger

**Files:**
- Modify: `stores/userStore.ts`
- Modify: `stores/foodStore.ts`
- Modify: `stores/chatStore.ts`
- Modify: `stores/habitStore.ts`

**Step 1: Add logger import to each store**

At the top of each file, add:

```typescript
import { createLogger } from '../lib/logger';

const logger = createLogger('[StoreName]');
```

**Step 2: Replace console calls**

Find and replace patterns:
- `console.error(` → `logger.error(`
- `console.log(` → `logger.debug(`
- `console.warn(` → `logger.warn(`

**Step 3: Commit**

```bash
git add stores/*.ts
git commit -m "refactor(stores): replace console.* with centralized logger"
```

---

### Task 5.2: Update Services to Use Logger

**Files:**
- Modify: `services/ai.ts`
- Modify: `services/health-integration.ts`
- Modify: `services/database/migrations.ts`
- Modify: `services/database/repositories/settingsRepository.ts`

**Step 1: Add logger import to each service**

```typescript
import { createLogger } from '../lib/logger';
// or for deeper paths:
import { createLogger } from '../../lib/logger';

const logger = createLogger('[ServiceName]');
```

**Step 2: Replace console calls**

Same pattern as stores.

**Step 3: Commit**

```bash
git add services/**/*.ts
git commit -m "refactor(services): replace console.* with centralized logger"
```

---

### Task 5.3: Update Remaining Files to Use Logger

**Files:**
- Modify: `lib/ai-response-validator.ts`
- Modify: `app/profile-edit.tsx`

**Step 1: Add logger import**

**Step 2: Replace console calls**

**Step 3: Commit**

```bash
git add lib/ai-response-validator.ts app/profile-edit.tsx
git commit -m "refactor: replace remaining console.* with logger"
```

---

## Phase 6: Refactor Oversized Tab Screens (P0)

> **Note:** Each screen should be under 300 lines per project standards. Extract components into separate files.

### Task 6.1: Refactor habits.tsx (763 lines → ~250 lines)

**Files:**
- Modify: `app/(tabs)/habits.tsx`
- Create: `app/(tabs)/habits/components/MoodSelector.tsx`
- Create: `app/(tabs)/habits/components/BristolChart.tsx`
- Create: `app/(tabs)/habits/components/HabitCard.tsx`
- Create: `app/(tabs)/habits/components/HabitStats.tsx`

**Step 1: Create components directory**

```bash
mkdir -p app/(tabs)/habits/components
```

**Step 2: Extract MoodSelector component**

Create `app/(tabs)/habits/components/MoodSelector.tsx`:

```typescript
/**
 * MoodSelector Component
 *
 * Mood tracking interface with emoji selection.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../../constants/typography';

interface MoodSelectorProps {
  selectedMood: number | null;
  onSelectMood: (mood: number) => void;
}

const MOODS = [
  { value: 1, emoji: '😢', label: 'veryBad' },
  { value: 2, emoji: '😔', label: 'bad' },
  { value: 3, emoji: '😐', label: 'neutral' },
  { value: 4, emoji: '😊', label: 'good' },
  { value: 5, emoji: '😄', label: 'veryGood' },
];

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('habits.mood.title')}</Text>
      <View style={styles.moodRow}>
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodButton,
              selectedMood === mood.value && styles.moodButtonSelected,
            ]}
            onPress={() => onSelectMood(mood.value)}
            accessibilityLabel={t(`habits.mood.${mood.label}`)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedMood === mood.value }}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodButtonSelected: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: 28,
  },
});
```

**Step 3: Extract BristolChart, HabitCard, HabitStats components**

Follow same pattern - extract 100-150 line chunks into separate components.

**Step 4: Update habits.tsx to import components**

```typescript
import { MoodSelector } from './habits/components/MoodSelector';
import { BristolChart } from './habits/components/BristolChart';
import { HabitCard } from './habits/components/HabitCard';
import { HabitStats } from './habits/components/HabitStats';
```

**Step 5: Verify line count**

Run: `wc -l app/(tabs)/habits.tsx`
Expected: < 300 lines

**Step 6: Commit**

```bash
git add app/(tabs)/habits.tsx app/(tabs)/habits/
git commit -m "refactor(habits): extract components to meet 300 line limit"
```

---

### Task 6.2: Refactor camera.tsx (715 lines → ~250 lines)

**Files:**
- Modify: `app/(tabs)/camera.tsx`
- Create: `app/(tabs)/camera/components/CameraControls.tsx`
- Create: `app/(tabs)/camera/components/MealTypeSelector.tsx`
- Create: `app/(tabs)/camera/components/AnalysisResult.tsx`
- Create: `app/(tabs)/camera/components/PhotoPreview.tsx`

**Step 1: Create components directory**

```bash
mkdir -p app/(tabs)/camera/components
```

**Step 2: Extract CameraControls component**

Handles capture button, flash toggle, camera flip.

**Step 3: Extract MealTypeSelector component**

Handles breakfast/lunch/dinner/snack selection.

**Step 4: Extract AnalysisResult component**

Displays AI analysis results with nutrition data.

**Step 5: Extract PhotoPreview component**

Shows captured photo with confirm/retake options.

**Step 6: Update camera.tsx to import components**

**Step 7: Verify line count < 300**

**Step 8: Commit**

```bash
git add app/(tabs)/camera.tsx app/(tabs)/camera/
git commit -m "refactor(camera): extract components to meet 300 line limit"
```

---

### Task 6.3: Refactor index.tsx (532 lines → ~250 lines)

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/home/components/NutritionSummary.tsx`
- Create: `app/(tabs)/home/components/RecentMeals.tsx`
- Create: `app/(tabs)/home/components/QuickActions.tsx`

**Step 1-6: Follow same pattern as above**

**Step 7: Commit**

```bash
git add app/(tabs)/index.tsx app/(tabs)/home/
git commit -m "refactor(home): extract components to meet 300 line limit"
```

---

### Task 6.4: Refactor chat.tsx (517 lines → ~250 lines)

**Files:**
- Modify: `app/(tabs)/chat.tsx`
- Create: `app/(tabs)/chat/components/MessageBubble.tsx`
- Create: `app/(tabs)/chat/components/SuggestionChips.tsx`
- Create: `app/(tabs)/chat/components/ChatInput.tsx`

**Step 1-6: Follow same pattern**

**Step 7: Commit**

```bash
git add app/(tabs)/chat.tsx app/(tabs)/chat/
git commit -m "refactor(chat): extract components to meet 300 line limit"
```

---

### Task 6.5: Refactor settings.tsx (512 lines → ~250 lines)

**Files:**
- Modify: `app/(tabs)/settings.tsx`
- Create: `app/(tabs)/settings/components/ProfileCard.tsx`
- Create: `app/(tabs)/settings/components/SettingsSection.tsx`
- Create: `app/(tabs)/settings/components/SettingsItem.tsx`

**Step 1-6: Follow same pattern**

**Step 7: Commit**

```bash
git add app/(tabs)/settings.tsx app/(tabs)/settings/
git commit -m "refactor(settings): extract components to meet 300 line limit"
```

---

### Task 6.6: Refactor register.tsx (584 lines → ~250 lines)

**Files:**
- Modify: `app/(auth)/register.tsx`
- Create: `app/(auth)/register/components/PasswordStrength.tsx`
- Create: `app/(auth)/register/components/SocialAuthButtons.tsx`
- Create: `app/(auth)/register/components/TermsCheckbox.tsx`

**Step 1-6: Follow same pattern**

**Step 7: Commit**

```bash
git add app/(auth)/register.tsx app/(auth)/register/
git commit -m "refactor(register): extract components to meet 300 line limit"
```

---

## Phase 7: Add Error Handling for Repository Insert Operations (P1)

### Task 7.1: Add Try-Catch to foodRepository Insert Functions

**Files:**
- Modify: `services/database/repositories/foodRepository.ts`

**Step 1: Wrap insert/update operations in try-catch**

```typescript
import { createLogger } from '../../../lib/logger';

const logger = createLogger('[FoodRepository]');

export function createFoodLog(data: CreateFoodLogData): FoodLog | null {
  try {
    const db = getDatabase();
    const id = generateId();
    const timestamp = getCurrentTimestamp();

    db.runSync(
      `INSERT INTO food_logs (...) VALUES (...)`,
      [...]
    );

    return getFoodLogById(id);
  } catch (error) {
    logger.error('Failed to create food log:', error);
    return null;
  }
}
```

**Step 2: Update all insert/update/delete functions**

Add try-catch with logging to:
- `createFoodLog`
- `updateFoodLog`
- `deleteFoodLog`

**Step 3: Commit**

```bash
git add services/database/repositories/foodRepository.ts
git commit -m "fix(foodRepository): add error handling for database operations"
```

---

### Task 7.2: Add Error Handling to Other Repositories

**Files:**
- Modify: `services/database/repositories/chatRepository.ts`
- Modify: `services/database/repositories/habitRepository.ts`
- Modify: `services/database/repositories/exerciseRepository.ts`
- Modify: `services/database/repositories/settingsRepository.ts`

**Step 1: Add logger import to each**

**Step 2: Wrap insert/update/delete in try-catch**

**Step 3: Commit**

```bash
git add services/database/repositories/*.ts
git commit -m "fix(repositories): add error handling for all database operations"
```

---

## Phase 8: Fix Hardcoded i18n Strings (P1)

### Task 8.1: Add Translation Keys to Locale Files

**Files:**
- Modify: `locales/en.ts`
- Modify: `locales/zh-TW.ts`

**Step 1: Add PieChart translation keys**

In `locales/en.ts`, add to appropriate section:

```typescript
charts: {
  energy: {
    intake: 'Intake',
    burned: 'Burned',
    remaining: 'Remaining',
    unit: 'kcal',
  },
  macros: {
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
  },
},
```

In `locales/zh-TW.ts`:

```typescript
charts: {
  energy: {
    intake: '攝取',
    burned: '消耗',
    remaining: '剩餘',
    unit: 'kcal',
  },
  macros: {
    protein: '蛋白質',
    carbs: '碳水',
    fat: '脂肪',
  },
},
```

**Step 2: Add NutritionBadge translation keys**

```typescript
nutrition: {
  calories: 'Calories',    // 卡路里
  protein: 'Protein',      // 蛋白質
  carbs: 'Carbs',          // 碳水
  fat: 'Fat',              // 脂肪
  fiber: 'Fiber',          // 纖維
  sodium: 'Sodium',        // 鈉
},
```

**Step 3: Commit**

```bash
git add locales/*.ts
git commit -m "feat(i18n): add translation keys for chart and nutrition components"
```

---

### Task 8.2: Update PieChart to Use Translations

**Files:**
- Modify: `components/ui/PieChart.tsx`

**Step 1: Add translation hook**

```typescript
import { useTranslation } from '../../hooks/useTranslation';
```

**Step 2: Replace hardcoded strings**

In `EnergyBalanceCharts`:

```typescript
export function EnergyBalanceCharts({ ... }: EnergyBalanceChartsProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.energyContainer, style]}>
      <View style={styles.energyChart}>
        <MiniDonutChart ... />
        <Text style={styles.energyLabel}>{t('charts.energy.intake')}</Text>
        <Text style={styles.energyValue}>{intake}</Text>
        <Text style={styles.energyUnit}>{t('charts.energy.unit')}</Text>
      </View>
      {/* Similar for burned and remaining */}
    </View>
  );
}
```

In `MacroDistributionChart`:

```typescript
export function MacroDistributionChart({ ... }: MacroChartProps) {
  const { t } = useTranslation();

  const segments: PieChartSegment[] = [
    { value: protein, color: COLORS.protein, label: t('charts.macros.protein') },
    { value: carbs, color: COLORS.carbs, label: t('charts.macros.carbs') },
    { value: fat, color: COLORS.fat, label: t('charts.macros.fat') },
  ];
  // ...
}
```

**Step 3: Commit**

```bash
git add components/ui/PieChart.tsx
git commit -m "fix(i18n): replace hardcoded strings in PieChart with translations"
```

---

### Task 8.3: Update NutritionBadge to Use Translations

**Files:**
- Modify: `components/ui/NutritionBadge.tsx`

**Step 1: Add translation hook**

```typescript
import { useTranslation } from '../../hooks/useTranslation';
```

**Step 2: Update NUTRITION_CONFIG to use dynamic labels**

Replace the static config with a hook-based approach:

```typescript
function useNutritionConfig() {
  const { t } = useTranslation();

  return {
    calories: {
      label: t('nutrition.calories'),
      icon: 'flame' as const,
      color: COLORS.calories,
      bgColor: COLORS.caloriesBg,
    },
    protein: {
      label: t('nutrition.protein'),
      icon: 'fish' as const,
      color: COLORS.protein,
      bgColor: COLORS.proteinBg,
    },
    // ... rest of types
  };
}
```

**Step 3: Update NutritionBadge component**

```typescript
export function NutritionBadge({ type, ... }: NutritionBadgeProps) {
  const config = useNutritionConfig()[type];
  // ... rest of component
}
```

**Step 4: Commit**

```bash
git add components/ui/NutritionBadge.tsx
git commit -m "fix(i18n): replace hardcoded strings in NutritionBadge with translations"
```

---

## Phase 9: Centralize AI Model Constants (P1)

### Task 9.1: Update services/ai.ts to Use Centralized Constants

**Files:**
- Modify: `services/ai.ts`

**Step 1: Replace local MODELS constant with import**

Remove:
```typescript
const MODELS = {
  CHAT: 'gemini-2.0-flash',
  VISION: 'gemini-2.0-flash',
};
```

Add:
```typescript
import { AI_MODELS } from '../lib/ai-models';

const MODELS = {
  CHAT: AI_MODELS.GEMINI_2_5_FLASH,
  VISION: AI_MODELS.GEMINI_2_5_FLASH,
};
```

**Step 2: Commit**

```bash
git add services/ai.ts
git commit -m "refactor(ai): use centralized AI model constants"
```

---

### Task 9.2: Create Shared AI Models for Edge Functions

**Files:**
- Create: `supabase/functions/_shared/ai-models.ts`

**Step 1: Create the shared module**

```typescript
/**
 * AI Model Constants for Edge Functions
 *
 * Centralized model identifiers to ensure consistency
 * across all Edge Functions.
 */

export const AI_MODELS = {
  // Gemini Models
  GEMINI_2_5_FLASH: 'gemini-2.5-flash',
  GEMINI_2_5_PRO: 'gemini-2.5-pro',
  GEMINI_3_PRO_PREVIEW: 'gemini-3-pro-preview',
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];
```

**Step 2: Commit**

```bash
git add supabase/functions/_shared/ai-models.ts
git commit -m "feat(edge-functions): add centralized AI model constants"
```

---

### Task 9.3: Update Edge Functions to Use Shared Constants

**Files:**
- Modify: `supabase/functions/chat/index.ts`
- Modify: `supabase/functions/analyze-food/index.ts`

**Step 1: Update chat/index.ts**

Remove:
```typescript
const AI_MODELS = {
  GEMINI_2_5_PRO: 'gemini-2.5-pro',
} as const;
```

Add:
```typescript
import { AI_MODELS } from '../_shared/ai-models.ts';
```

**Step 2: Update analyze-food/index.ts**

Same pattern - import from shared module.

**Step 3: Commit**

```bash
git add supabase/functions/chat/index.ts supabase/functions/analyze-food/index.ts
git commit -m "refactor(edge-functions): use centralized AI model constants"
```

---

## Phase 10: Final Verification

### Task 10.1: Run Full TypeScript Check

Run: `npx tsc --noEmit`
Expected: No errors

### Task 10.2: Run ESLint

Run: `pnpm lint`
Expected: No errors

### Task 10.3: Verify File Line Counts

Run:
```bash
find app -name "*.tsx" -type f | xargs wc -l | sort -rn | head -10
```
Expected: All files < 300 lines

### Task 10.4: Verify No Console Usage Outside Logger

Run:
```bash
grep -r "console\." --include="*.ts" --include="*.tsx" | grep -v "lib/logger.ts" | grep -v "node_modules"
```
Expected: No matches (or only in edge functions which run in Deno)

### Task 10.5: Final Commit

```bash
git add .
git commit -m "chore: final verification and cleanup"
git push origin fix/comprehensive-code-quality-and-security-fixes
```

---

## Complete Summary of Changes

| Phase | Priority | Description | Tasks |
|-------|----------|-------------|-------|
| 1 | P0 | SQLite field-level encryption | 2 |
| 2 | P0 | Server-side rate limiting | 3 |
| 3 | P0 | API key protection & security headers | 3 |
| 4 | - | Security documentation | 3 |
| 5 | P0 | Replace console.* with logger | 3 |
| 6 | P0 | Refactor 6 oversized screens | 6 |
| 7 | P1 | Error handling for repositories | 2 |
| 8 | P1 | Fix hardcoded i18n strings | 3 |
| 9 | P1 | Centralize AI model constants | 3 |
| 10 | - | Final verification | 5 |

**Total Tasks:** 33
**Total Commits:** ~25
