/**
 * AI Model Constants for Edge Functions
 *
 * Centralized AI model identifiers for Supabase Edge Functions.
 * Never hardcode model strings in Edge Functions.
 * Always import from this file.
 *
 * Note: This is a separate file from lib/ai-models.ts because:
 * 1. Edge Functions run in Deno, not Node.js
 * 2. They cannot import from the main app codebase
 * 3. Model constants should stay in sync with lib/ai-models.ts
 */

export const AI_MODELS = {
  // Gemini Models
  GEMINI_2_5_FLASH: 'gemini-2.5-flash', // Fast and cost-effective for food image analysis
  GEMINI_2_5_PRO: 'gemini-2.5-pro', // More accurate, suitable for complex conversations
  GEMINI_3_PRO_PREVIEW: 'gemini-3-pro-preview', // Latest version for complex scenarios
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

/**
 * Get recommended model for specific use case
 */
export function getRecommendedModel(
  useCase: 'food_analysis' | 'chat' | 'complex'
): AIModel {
  switch (useCase) {
    case 'food_analysis':
      return AI_MODELS.GEMINI_2_5_FLASH;
    case 'chat':
      return AI_MODELS.GEMINI_2_5_PRO;
    case 'complex':
      return AI_MODELS.GEMINI_3_PRO_PREVIEW;
    default:
      return AI_MODELS.GEMINI_2_5_FLASH;
  }
}
