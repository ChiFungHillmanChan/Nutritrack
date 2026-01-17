/**
 * Supabase Edge Function: Analyze Food
 * 
 * Uses Google Gemini Vision API to analyze food images
 * and return nutrition information.
 * 
 * Following AI Model Usage Rule from .cursor/rules/01.ai-model-usage.mdc
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { verifyAuth, unauthorizedResponse } from '../_shared/auth.ts';

// AI Model Constants - following the rule of centralized model names
const AI_MODELS = {
  GEMINI_2_5_FLASH: 'gemini-2.5-flash',
} as const;

/**
 * CORS headers for Edge Function responses.
 *
 * Note: Mobile apps (React Native/Expo) don't enforce CORS like web browsers.
 * The wildcard origin is acceptable here because:
 * 1. JWT authentication is now enforced for all non-OPTIONS requests
 * 2. Mobile apps make requests directly without browser CORS restrictions
 * 3. The primary consumers are mobile apps, not web browsers
 *
 * If web clients are added in the future, consider restricting to specific domains.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoodAnalysisRequest {
  image_base64: string;
  meal_type?: string;
}

/**
 * Sanitize user input to prevent prompt injection attacks.
 * For meal_type, we only allow specific valid values.
 */
function sanitizeMealType(mealType?: string): string | undefined {
  if (!mealType) return undefined;
  
  // Only allow known meal types
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', '早餐', '午餐', '晚餐', '小食'];
  const normalized = mealType.toLowerCase().trim();
  
  if (validMealTypes.includes(normalized)) {
    return normalized;
  }
  
  // If not a valid meal type, sanitize it heavily
  const sanitized = mealType
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/\[INST\]/gi, '')
    .replace(/<<SYS>>/gi, '')
    .replace(/<\/s>/gi, '')
    .replace(/```/g, '')
    .replace(/[<>{}]/g, '')
    .trim()
    .slice(0, 50);
  
  return sanitized || undefined;
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

interface FoodAnalysisResponse {
  success: boolean;
  data?: {
    food_name: string;
    portion_size_grams: number;
    nutrition: NutritionData;
    confidence: number;
    clarification_needed?: {
      question: string;
      options: string[];
    };
  };
  error?: string;
}

/**
 * Check if error is a Gemini quota error
 */
function isGeminiQuotaError(error: Error): boolean {
  const quotaPatterns = ['quota', 'rate limit', 'too many requests', '429', 'resource exhausted'];
  const errorMessage = error.message.toLowerCase();
  return quotaPatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Analyze food image using Gemini Vision API
 */
async function analyzeWithGemini(imageBase64: string, mealContext?: string): Promise<FoodAnalysisResponse> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY not configured',
    };
  }

  const prompt = `你係一個專業嘅營養師助手。分析呢張食物相片，並提供以下資訊：

1. 食物名稱（用繁體中文）
2. 估計份量（克）
3. 營養資料：
   - 卡路里 (kcal)
   - 蛋白質 (g)
   - 碳水化合物 (g)
   - 脂肪 (g)
   - 纖維 (g)
   - 鈉 (mg)
4. 你對識別結果嘅信心度 (0-1)

${mealContext ? `用戶表示呢係${mealContext}。` : ''}

如果你唔確定食物種類，請提供一個澄清問題同選項。

用以下 JSON 格式回覆（唔好加任何其他文字）：
{
  "food_name": "食物名稱",
  "portion_size_grams": 數字,
  "nutrition": {
    "calories": 數字,
    "protein": 數字,
    "carbs": 數字,
    "fat": 數字,
    "fiber": 數字,
    "sodium": 數字
  },
  "confidence": 0到1之間嘅數字,
  "clarification_needed": null 或者 {
    "question": "問題",
    "options": ["選項1", "選項2", "選項3"]
  }
}`;

  try {
    // Using Google AI SDK format
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.GEMINI_2_5_FLASH}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Extract text content from response
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      return {
        success: false,
        error: 'No response from AI',
      };
    }

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: 'Invalid AI response format',
      };
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      data: {
        food_name: analysisData.food_name,
        portion_size_grams: analysisData.portion_size_grams,
        nutrition: analysisData.nutrition,
        confidence: analysisData.confidence,
        clarification_needed: analysisData.clarification_needed ?? undefined,
      },
    };
  } catch (error) {
    // Handle quota errors
    if (error instanceof Error && isGeminiQuotaError(error)) {
      return {
        success: false,
        error: 'AI 服務暫時繁忙，請稍後再試。',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verify JWT authentication
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return unauthorizedResponse(corsHeaders);
  }

  try {
    const { image_base64, meal_type }: FoodAnalysisRequest = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing image_base64' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate base64 length to prevent abuse (max ~10MB image)
    if (image_base64.length > 15_000_000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image too large' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Sanitize meal_type to prevent prompt injection
    const sanitizedMealType = sanitizeMealType(meal_type);

    const result = await analyzeWithGemini(image_base64, sanitizedMealType);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
