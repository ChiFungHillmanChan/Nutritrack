/**
 * AI Response Validator
 * 
 * Provides Zod schemas for validating AI responses from Gemini API.
 * Ensures type safety and data integrity when parsing AI-generated content.
 */

import { z } from 'zod';
import { createLogger } from './logger';

const logger = createLogger('[AIResponseValidator]');

/**
 * Schema for chat response messages
 */
export const ChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

/**
 * Schema for nutrition data
 */
export const NutritionDataSchema = z.object({
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(1000),
  fat: z.number().min(0).max(500),
  fiber: z.number().min(0).max(100),
  sodium: z.number().min(0).max(10000),
});

export type NutritionData = z.infer<typeof NutritionDataSchema>;

/**
 * Schema for clarification questions from AI
 */
export const ClarificationSchema = z.object({
  question: z.string().max(500),
  options: z.array(z.string().max(100)).min(2).max(5),
});

export type Clarification = z.infer<typeof ClarificationSchema>;

/**
 * Schema for food analysis response
 */
export const FoodAnalysisDataSchema = z.object({
  food_name: z.string().min(1).max(200),
  portion_size_grams: z.number().min(1).max(5000),
  nutrition: NutritionDataSchema,
  confidence: z.number().min(0).max(1),
  clarification_needed: ClarificationSchema.optional().nullable(),
});

export type FoodAnalysisData = z.infer<typeof FoodAnalysisDataSchema>;

/**
 * Schema for full food analysis response
 */
export const FoodAnalysisResponseSchema = z.object({
  success: z.boolean(),
  data: FoodAnalysisDataSchema.optional(),
  error: z.string().optional(),
});

export type FoodAnalysisResponse = z.infer<typeof FoodAnalysisResponseSchema>;

/**
 * Validate chat response from AI
 */
export function validateChatResponse(data: unknown): ChatResponse | null {
  const result = ChatResponseSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  logger.error('Invalid chat response:', result.error.issues);
  return null;
}

/**
 * Validate food analysis response from AI
 */
export function validateFoodAnalysisResponse(data: unknown): FoodAnalysisResponse | null {
  const result = FoodAnalysisResponseSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  logger.error('Invalid food analysis response:', result.error.issues);
  return null;
}

/**
 * Validate and sanitize nutrition data from AI
 * Applies reasonable bounds to prevent obviously wrong values
 */
export function validateNutritionData(data: unknown): NutritionData | null {
  const result = NutritionDataSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  logger.error('Invalid nutrition data:', result.error.issues);
  return null;
}

/**
 * Check if AI response indicates a quota/rate limit error
 */
export function isQuotaError(response: ChatResponse | FoodAnalysisResponse): boolean {
  if (!response.error) return false;
  
  const quotaPatterns = [
    'quota',
    'rate limit',
    '429',
    'too many requests',
    'resource exhausted',
    '繁忙',
  ];
  
  const errorLower = response.error.toLowerCase();
  return quotaPatterns.some(pattern => errorLower.includes(pattern));
}

/**
 * Get a user-friendly error message from AI response
 */
export function getUserFriendlyError(response: ChatResponse | FoodAnalysisResponse): string {
  if (!response.error) return '發生未知錯誤，請稍後再試';
  
  if (isQuotaError(response)) {
    return 'AI 服務暫時繁忙，請稍後再試';
  }
  
  // Don't expose internal error details to users
  if (response.error.includes('API') || response.error.includes('error')) {
    return '服務暫時無法使用，請稍後再試';
  }
  
  return response.error;
}
