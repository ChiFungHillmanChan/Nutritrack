/**
 * AI Model Status and Quota Error Handling
 * 
 * Handles quota errors for Gemini API calls.
 * Gemini daily limits reset at midnight Pacific Time.
 */

import { AIModelValue } from './ai-models';

export interface QuotaError {
  model: AIModelValue;
  provider: 'gemini' | 'openai';
  message: string;
  resetTime?: Date;
}

export interface QuotaErrorResponse {
  success: false;
  error: string;
  quotaExceeded: true;
  resetTime?: string;
}

/**
 * Check if an error is a Gemini quota error
 */
export function isGeminiQuotaError(error: Error): boolean {
  const quotaPatterns = [
    'quota',
    'rate limit',
    'too many requests',
    '429',
    'exceeded',
    'resource exhausted',
  ];
  
  const errorMessage = error.message.toLowerCase();
  return quotaPatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Calculate next reset time for Gemini (midnight Pacific Time)
 */
export function getGeminiResetTime(): Date {
  const now = new Date();
  
  // Convert to Pacific Time
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  
  // Set to next midnight
  const resetTime = new Date(pacificTime);
  resetTime.setDate(resetTime.getDate() + 1);
  resetTime.setHours(0, 0, 0, 0);
  
  return resetTime;
}

/**
 * Handle quota error and return structured response
 */
export function handleQuotaError(
  error: Error,
  model: AIModelValue,
  provider: 'gemini' | 'openai'
): QuotaError | null {
  if (!isGeminiQuotaError(error)) {
    return null;
  }

  const resetTime = provider === 'gemini' ? getGeminiResetTime() : undefined;

  return {
    model,
    provider,
    message: `${provider} API quota exceeded for ${model}. Please try again later.`,
    resetTime,
  };
}

/**
 * Create standardized quota error response
 */
export function createQuotaErrorResponse(quotaError: QuotaError): QuotaErrorResponse {
  return {
    success: false,
    error: quotaError.message,
    quotaExceeded: true,
    resetTime: quotaError.resetTime?.toISOString(),
  };
}
