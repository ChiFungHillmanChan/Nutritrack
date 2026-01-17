/**
 * Rate Limiter Service
 * 
 * Provides client-side rate limiting to prevent API abuse.
 * Uses a simple sliding window algorithm with in-memory storage.
 * 
 * Note: This is client-side rate limiting for UX purposes.
 * Server-side rate limiting should be implemented in Supabase Edge Functions
 * for actual abuse prevention.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limit data
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Identifier for this rate limit (e.g., 'chat', 'food-analysis') */
  key: string;
}

/**
 * Default rate limits for different API endpoints
 */
export const RATE_LIMITS = {
  CHAT: {
    maxRequests: 30,
    windowMs: 60_000, // 30 requests per minute
    key: 'chat',
  },
  FOOD_ANALYSIS: {
    maxRequests: 20,
    windowMs: 60_000, // 20 requests per minute
    key: 'food-analysis',
  },
  AUTH: {
    maxRequests: 5,
    windowMs: 60_000, // 5 auth attempts per minute
    key: 'auth',
  },
} as const;

/**
 * Check if a request should be rate limited
 * 
 * @param config - Rate limit configuration
 * @param userId - Optional user identifier for per-user limiting
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  config: RateLimitConfig,
  userId?: string
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const storeKey = userId ? `${config.key}:${userId}` : config.key;
  
  // Get or create entry
  let entry = rateLimitStore.get(storeKey);
  
  // If no entry or window has passed, create new entry
  if (!entry || now >= entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(storeKey, entry);
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: entry.resetTime - now,
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetInMs: entry.resetTime - now,
  };
}

/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(config: RateLimitConfig, userId?: string): void {
  const storeKey = userId ? `${config.key}:${userId}` : config.key;
  rateLimitStore.delete(storeKey);
}

/**
 * Clear all rate limit entries (useful for logout)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get human-readable wait time
 */
export function getWaitTimeMessage(resetInMs: number): string {
  const seconds = Math.ceil(resetInMs / 1000);
  
  if (seconds < 60) {
    return `${seconds} 秒`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} 分鐘`;
}

/**
 * Rate-limited wrapper for async functions
 * 
 * @param fn - Async function to wrap
 * @param config - Rate limit configuration
 * @param userId - Optional user identifier
 * @returns Wrapped function that respects rate limits
 */
export function withRateLimit<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  config: RateLimitConfig,
  userId?: string
): (...args: Args) => Promise<{ success: true; data: T } | { success: false; error: string; retryAfterMs: number }> {
  return async (...args: Args) => {
    const { allowed, resetInMs } = checkRateLimit(config, userId);
    
    if (!allowed) {
      const waitTime = getWaitTimeMessage(resetInMs);
      return {
        success: false,
        error: `請求太頻繁，請等待 ${waitTime} 後再試`,
        retryAfterMs: resetInMs,
      };
    }
    
    const data = await fn(...args);
    return { success: true, data };
  };
}

/**
 * Hook-friendly rate limit check
 * Returns a function that checks and updates the rate limit
 */
export function createRateLimiter(config: RateLimitConfig, userId?: string) {
  return {
    check: () => checkRateLimit(config, userId),
    reset: () => resetRateLimit(config, userId),
    getWaitMessage: (ms: number) => getWaitTimeMessage(ms),
  };
}
