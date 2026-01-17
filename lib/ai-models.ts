/**
 * AI Model Constants
 * 
 * All AI model identifiers are centralized here.
 * Never hardcode model strings in the codebase.
 * Always import from this file.
 */

export const AI_MODELS = {
  // Gemini Models (用於食物識別)
  GEMINI_2_5_FLASH: 'gemini-2.5-flash',           // 快速分析，性價比高
  GEMINI_2_5_PRO: 'gemini-2.5-pro',               // 更準確，成本較高
  GEMINI_3_PRO_PREVIEW: 'gemini-3-pro-preview',   // 最新版本
  GEMINI_2_5_FLASH_IMAGE: 'gemini-2.5-flash-image',
  GEMINI_3_PRO_IMAGE_PREVIEW: 'gemini-3-pro-image-preview',
} as const;

export type AIModelKey = keyof typeof AI_MODELS;
export type AIModelValue = (typeof AI_MODELS)[AIModelKey];

/**
 * Model configurations with metadata
 */
export const AI_MODEL_CONFIGS = {
  [AI_MODELS.GEMINI_2_5_FLASH]: {
    id: AI_MODELS.GEMINI_2_5_FLASH,
    provider: 'gemini',
    displayName: 'Gemini 2.5 Flash',
    description: 'Fast and cost-effective for food image analysis',
    capabilities: ['text', 'image'],
    rateLimitResetType: 'midnight_pt' as const,
  },
  [AI_MODELS.GEMINI_2_5_PRO]: {
    id: AI_MODELS.GEMINI_2_5_PRO,
    provider: 'gemini',
    displayName: 'Gemini 2.5 Pro',
    description: 'More accurate, suitable for complex conversations',
    capabilities: ['text', 'image'],
    rateLimitResetType: 'midnight_pt' as const,
  },
  [AI_MODELS.GEMINI_3_PRO_PREVIEW]: {
    id: AI_MODELS.GEMINI_3_PRO_PREVIEW,
    provider: 'gemini',
    displayName: 'Gemini 3 Pro Preview',
    description: 'Latest version for complex scenarios',
    capabilities: ['text', 'image'],
    rateLimitResetType: 'midnight_pt' as const,
  },
} as const;

/**
 * Get recommended model for specific use case
 */
export function getRecommendedModel(useCase: 'food_analysis' | 'chat' | 'complex'): AIModelValue {
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
