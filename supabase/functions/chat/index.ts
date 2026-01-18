/**
 * Supabase Edge Function: AI Chat
 * 
 * Uses Google Gemini Pro API for nutrition-related conversations.
 * 
 * Following AI Model Usage Rule from .cursor/rules/01.ai-model-usage.mdc
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { verifyAuth, unauthorizedResponse } from '../_shared/auth.ts';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '../_shared/rate-limiter.ts';

// AI Model Constants - use GEMINI_2_5_PRO for chat (better conversation ability)
const AI_MODELS = {
  GEMINI_2_5_PRO: 'gemini-2.5-pro',
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Sanitize user input to prevent prompt injection attacks.
 * Removes common injection patterns and limits input length.
 */
function sanitizeUserInput(input: string, maxLength = 2000): string {
  // Remove potential injection patterns
  const sanitized = input
    // Remove system/instruction markers
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/\[INST\]/gi, '')
    .replace(/\[\/INST\]/gi, '')
    .replace(/<<SYS>>/gi, '')
    .replace(/<\/s>/gi, '')
    .replace(/```system/gi, '')
    // Remove role override attempts
    .replace(/^(system|assistant|model):/gim, '')
    .replace(/\n(system|assistant|model):/gi, '\n')
    // Remove markdown code block escapes that might contain instructions
    .replace(/```[\s\S]*?```/g, (match) => {
      // Keep code blocks but remove if they look like instructions
      if (match.toLowerCase().includes('ignore') || 
          match.toLowerCase().includes('system') ||
          match.toLowerCase().includes('instruction')) {
        return '[code removed]';
      }
      return match;
    })
    // Trim and limit length
    .trim()
    .slice(0, maxLength);
  
  return sanitized;
}

/**
 * Sanitize chat history messages
 */
function sanitizeChatHistory(history?: ChatMessage[]): ChatMessage[] | undefined {
  if (!history) return undefined;
  
  return history.map(msg => ({
    ...msg,
    content: sanitizeUserInput(msg.content, 1500),
  }));
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  context?: {
    daily_nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    daily_targets?: {
      calories: { min: number; max: number };
      protein: { min: number; max: number };
      carbs: { min: number; max: number };
      fat: { min: number; max: number };
    };
    user_goal?: string;
  };
}

interface ChatResponse {
  success: boolean;
  message?: string;
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
 * Format user context for the AI
 */
function formatContext(context?: ChatRequest['context']): string {
  if (!context) return '';

  const parts: string[] = [];

  if (context.daily_nutrition && context.daily_targets) {
    const n = context.daily_nutrition;
    const t = context.daily_targets;
    
    parts.push(`用戶今日營養攝取情況：
- 卡路里: ${n.calories}/${t.calories.max} kcal
- 蛋白質: ${n.protein}/${t.protein.max} g
- 碳水化合物: ${n.carbs}/${t.carbs.max} g
- 脂肪: ${n.fat}/${t.fat.max} g`);
  }

  if (context.user_goal) {
    const goalLabels: Record<string, string> = {
      lose_weight: '減重',
      gain_weight: '增重',
      maintain: '維持體重',
      build_muscle: '增肌',
    };
    parts.push(`用戶目標: ${goalLabels[context.user_goal] ?? context.user_goal}`);
  }

  return parts.join('\n\n');
}

/**
 * Chat with Gemini Pro
 */
async function chatWithGemini(
  message: string,
  history?: ChatMessage[],
  context?: ChatRequest['context']
): Promise<ChatResponse> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY not configured',
    };
  }

  const systemPrompt = `你係 Nutritrack 嘅 AI 營養師助手，專門幫助用戶管理營養同飲食。

你嘅角色：
- 提供營養相關嘅建議同知識
- 根據用戶嘅攝取情況推薦食物
- 回答關於飲食、營養素、健康嘅問題
- 用繁體中文（廣東話口語風格）回答

注意事項：
- 如果用戶問醫療相關問題，建議佢哋諮詢醫生
- 提供實用、具體嘅建議
- 保持友善同鼓勵性嘅語氣

${context ? formatContext(context) : ''}`;

  // Build conversation history
  const contents = [];
  
  // Add system context as first user message (Gemini doesn't have system role)
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: '明白！我係你嘅 AI 營養師，有咩可以幫到你？' }],
  });

  // Add conversation history
  if (history) {
    for (const msg of history) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }
  }

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.GEMINI_2_5_PRO}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.8,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_ONLY_HIGH',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_ONLY_HIGH',
            },
          ],
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

    return {
      success: true,
      message: textContent,
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

  // Check rate limit
  const rateLimit = checkRateLimit(authResult.userId, 'chat', RATE_LIMITS.CHAT);
  if (!rateLimit.allowed) {
    return rateLimitResponse(corsHeaders, rateLimit.resetInSeconds);
  }

  try {
    const { message, history, context }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing message' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Sanitize user inputs to prevent prompt injection
    const sanitizedMessage = sanitizeUserInput(message);
    const sanitizedHistory = sanitizeChatHistory(history);

    const result = await chatWithGemini(sanitizedMessage, sanitizedHistory, context);

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
