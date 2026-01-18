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
  CHAT: { maxRequests: 30, windowMs: 60_000 }, // 30/min
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

  const resetInSeconds = Math.ceil(
    (entry.windowStart + config.windowMs - now) / 1000
  );

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
