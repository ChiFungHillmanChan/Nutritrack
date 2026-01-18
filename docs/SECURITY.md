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
  - Encryption: SHA-256 based stream cipher with HMAC authentication
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

When running as a web app, the following security headers are enforced:

- **Content-Security-Policy**: Restricts resource loading sources
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY (prevents clickjacking)
- **Referrer-Policy**: strict-origin-when-cross-origin

## Security Best Practices

### For Developers
1. Never commit credentials to source control
2. Use environment variables for all secrets
3. Always use parameterized queries (Prisma/SQLite)
4. Validate all user inputs at API boundaries
5. Use the centralized logger instead of console.*

### For Users
1. Use strong, unique passwords
2. Enable biometric authentication when available
3. Keep the app updated to receive security patches

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly by contacting the development team directly rather than creating a public issue.
