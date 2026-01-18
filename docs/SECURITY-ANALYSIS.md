# Nutritrack Security Analysis

> Last Updated: 2026-01-18
> Analysis Type: Apple App Store Standards Compliance

## Executive Summary

Nutritrack has **functional security foundations** but requires hardening before production deployment. The application implements field-level encryption for sensitive health data, secure token storage, and server-side rate limiting. However, critical vulnerabilities exist in encryption implementation, OAuth token handling, and API key exposure.

**Overall Security Grade: C+ (Functional but Risky)**

---

## 1. Encryption Implementation

### Location: `lib/crypto.ts`

### Current Implementation

| Feature | Implementation | Status |
|---------|---------------|--------|
| Key Storage | `expo-secure-store` (iOS Keychain/Android Keystore) | GOOD |
| Key Size | 256-bit random | GOOD |
| Algorithm | Custom XOR stream cipher with SHA-256 | WEAK |
| Authentication | HMAC-SHA256 with constant-time comparison | GOOD |
| IV Handling | Random 96-bit IV per encryption | GOOD |
| Message Format | IV (12 bytes) + Ciphertext + HMAC (16 bytes) | GOOD |

### Vulnerabilities

| Issue | Severity | Details |
|-------|----------|---------|
| Non-standard cipher | MEDIUM | Custom XOR-based stream cipher instead of AES-256-GCM |
| No key derivation | MEDIUM | Raw 256-bit key used without PBKDF2/Argon2 |
| Truncated HMAC | LOW | 128 bits instead of full 256 bits |
| No forward secrecy | MEDIUM | Same key for all messages |
| Production warning | HIGH | Comments suggest AES-256-GCM but NOT implemented |

### Encrypted Fields (userRepository.ts)

| Field | Encrypted | Notes |
|-------|-----------|-------|
| medical_conditions | YES | Health data |
| medications | YES | Health data |
| supplements | YES | Health data |
| allergies | YES | Health data |
| email | NO | Should be encrypted |
| height_cm | NO | Should be encrypted |
| weight_kg | NO | Should be encrypted |
| date_of_birth | NO | Should be encrypted |
| daily_targets | NO | Contains health goals |

### Recommendation

Replace custom XOR cipher with `react-native-aes-crypto`:

```typescript
// Current (WEAK)
const encrypted = xorStreamCipher(data, key);

// Recommended (STRONG)
import { AES } from 'react-native-aes-crypto';
const encrypted = await AES.encrypt(data, key, iv, 'aes-256-gcm');
```

---

## 2. Authentication & Session Management

### Location: `services/auth.ts`, `services/social-auth.ts`

### Supported Methods

| Method | Implementation | Status |
|--------|---------------|--------|
| Email/Password | Supabase Auth | GOOD |
| Google OAuth | Native + Supabase | VULNERABLE |
| Apple Sign-In | Native + Supabase | VULNERABLE |

### Critical Vulnerabilities

#### JWT Manual Parsing (social-auth.ts:299-410)

**Severity: CRITICAL**

```typescript
// VULNERABLE CODE
const payloadBase64 = accessToken.split('.')[1];
const payloadBase64Standard = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
const payloadJson = atob(payloadBase64Standard);
const payload = JSON.parse(payloadJson);
```

**Issues:**
- Extracts JWT from URL hash instead of using Supabase SDK
- No signature verification
- Payload decoded with `atob()` - vulnerable to crafted tokens
- No `exp` claim validation

**Fix:**
```typescript
// Use Supabase SDK instead
const { data, error } = await supabase.auth.setSession({
  access_token: accessToken,
  refresh_token: refreshToken,
});
```

#### Predictable Storage Key (social-auth.ts:346)

**Severity: HIGH**

```typescript
// VULNERABLE
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase/)?.[1] ?? 'unknown';
const storageKey = `sb-${projectRef}-auth-token`; // Predictable!
```

**Impact:** Attacker knowing project name can target this specific key.

### Token Storage

| Platform | Storage | Encryption | Status |
|----------|---------|-----------|--------|
| iOS | SecureStore (Keychain) | Hardware-backed | GOOD |
| Android | SecureStore (Keystore) | Hardware-backed | GOOD |
| Web | sessionStorage | None (cleartext) | WEAK |

---

## 3. API Key Security

### Location: `services/ai.ts`

### Critical Issue: Client-Side API Key Exposure

**Severity: CRITICAL**

```typescript
// Line 17 - VULNERABLE
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
// ^ PUBLIC prefix = compiled into app bundle = extractable!
```

**Impact:**
- API key can be extracted from compiled APK/IPA
- Attackers can steal quota
- No way to rotate key without app update

### Current Mitigation (Partial)

```typescript
// services/ai.ts - Production check exists
function hasDirectGeminiAccess(): boolean {
  if (isProduction) return false;  // Forces Edge Function in production
  return !!GEMINI_API_KEY;
}
```

### Recommendation

1. Remove `EXPO_PUBLIC_GEMINI_API_KEY` entirely
2. Route ALL AI requests through Supabase Edge Functions
3. Use Supabase-managed secrets only

---

## 4. Rate Limiting

### Location: `supabase/functions/_shared/rate-limiter.ts`

### Implementation

| Endpoint | Limit | Window | Status |
|----------|-------|--------|--------|
| `/chat` | 30 requests | 1 minute | GOOD |
| `/analyze-food` | 20 requests | 1 minute | GOOD |

### Features

- Per-user rate limiting (not global)
- In-memory store (resets on cold start)
- Returns `Retry-After` header
- Rate limit headers in responses

### Limitation

In-memory store is acceptable for Edge Functions but should use Redis/Upstash for production scale.

---

## 5. Input Validation & Sanitization

### Location: `services/ai.ts`, `supabase/functions/`

### Prompt Injection Defenses

**Client-Side (services/ai.ts:83-137):**

| Pattern Blocked | Example |
|-----------------|---------|
| System markers | `[SYSTEM]`, `[INST]`, `[/INST]` |
| LLM tags | `<<SYS>>`, `</s>` |
| Role overrides | `system:`, `assistant:`, `model:` |
| Jailbreak phrases | "ignore previous instructions", "pretend you are" |
| Length limit | 2000 characters max |

**Server-Side (Edge Functions):**

| Validation | Implementation |
|------------|---------------|
| Meal type whitelist | breakfast, lunch, dinner, snack (EN + Chinese) |
| Base64 image size | Max 15MB |
| JWT authentication | Required for all endpoints |

### Remaining Vulnerabilities

| Issue | Severity | Details |
|-------|----------|---------|
| Context injection | MEDIUM | User goals embedded directly in prompt without sanitization |
| History injection | LOW | Previous AI responses could contain injected patterns |
| Incomplete whitelist | LOW | Meal types only cover EN + Chinese |

---

## 6. Data Persistence Security

### SQLite Security

| Aspect | Status | Risk |
|--------|--------|------|
| File encryption | NOT IMPLEMENTED | HIGH |
| Cascade delete | Implemented | LOW |
| Foreign keys | Enabled | LOW |
| Transaction wrapping | NOT IMPLEMENTED | MEDIUM |

### Risk: Unencrypted SQLite

The SQLite database file is stored in plain text on the device filesystem. Physical device theft or backup extraction exposes all user data.

**Fix:** Use `expo-sqlite/next` with encryption or `react-native-sql-cipher`.

---

## 7. Secure Storage Implementation

### Location: `services/secure-storage.ts`

### Token Storage Keys

```typescript
const STORAGE_KEYS = {
  AUTH_TOKEN: 'nutritrack_auth_token',
  REFRESH_TOKEN: 'nutritrack_refresh_token',
  USER_ID: 'nutritrack_user_id',
};
```

### Platform Behavior

| Platform | Storage | Security |
|----------|---------|----------|
| iOS | SecureStore -> Keychain | Hardware-backed encryption |
| Android | SecureStore -> Keystore | Hardware-backed encryption |
| Web | sessionStorage | NO encryption (cleartext) |

### Chunking for Large Values

SecureStore has 2048 byte limit per item. Large tokens are chunked:

```typescript
// Chunking implementation
for (let i = 0; i < chunks.length; i++) {
  await SecureStore.setItemAsync(`${key}_${i}`, chunks[i], options);
}
```

---

## 8. Logging Security

### Current State

| Aspect | Status |
|--------|--------|
| Logger utility | Implemented (`lib/logger.ts`) |
| Prefix identification | GOOD |
| Debug output | Should be disabled in production |
| Sensitive data logging | Some instances found |

### Issues Found

```typescript
// social-auth.ts:149, 169 - Should not log user presence
logger.debug('Native result:', {
  success: result.success,
  hasError: !!result.error,
  hasUser: !!result.user  // Don't log this in production
});
```

---

## 9. Security Checklist

### Critical (Fix Immediately)

- [ ] Encrypt SQLite database
- [ ] Remove `EXPO_PUBLIC_GEMINI_API_KEY` from client
- [ ] Replace custom crypto with AES-256-GCM
- [ ] Fix OAuth token handling (remove JWT parsing)

### High (Fix Before Production)

- [ ] Add request signing/HMAC verification
- [ ] Encrypt web platform storage
- [ ] Remove sensitive debug logs
- [ ] Implement transaction wrapping for multi-step ops

### Medium (Next Release)

- [ ] Implement data sync status tracking
- [ ] Add key rotation strategy
- [ ] Conduct penetration testing on OAuth flow
- [ ] Expand field encryption to all health data

---

## 10. Compliance Summary

| Standard | Status | Notes |
|----------|--------|-------|
| OWASP Mobile Top 10 | PARTIAL | M1 (Storage), M5 (Crypto) need work |
| Apple App Store Security | PARTIAL | Token storage good, SQLite encryption missing |
| HIPAA | NOT COMPLIANT | Encryption incomplete for PHI |
| GDPR | PARTIAL | Delete cascade exists, export missing |

---

## 11. Remediation Priority

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | SQLite encryption | Medium | High |
| 2 | Remove client API key | Low | Critical |
| 3 | Replace custom crypto | Medium | High |
| 4 | Fix OAuth JWT parsing | Medium | Critical |
| 5 | Web storage encryption | Medium | Medium |
| 6 | Expand field encryption | Low | Medium |
| 7 | Remove debug logging | Low | Low |
