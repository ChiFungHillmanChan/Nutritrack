/**
 * AI Service
 *
 * Handles communication with Gemini AI.
 * - In local development: Calls Gemini API directly using EXPO_PUBLIC_GEMINI_API_KEY
 * - In production: Uses Supabase Edge Functions
 * - Demo mode: Returns mock responses when no API key is configured
 */

import { getSupabaseClient, isDemoMode } from './supabase';
import { NutritionData } from '../types';

// API Configuration
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Models
const MODELS = {
  CHAT: 'gemini-2.0-flash', // Fast model for chat
  VISION: 'gemini-2.0-flash', // Vision-capable model for food analysis
};

// Types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
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
}

interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface FoodAnalysisResponse {
  success: boolean;
  data?: {
    food_name: string;
    portion_size_grams: number;
    nutrition: NutritionData;
    confidence: number;
  };
  error?: string;
}

// Demo mode mock responses
const DEMO_CHAT_RESPONSES: Record<string, string> = {
  default:
    '多謝你嘅問題！我係你嘅 AI 營養師，可以幫你解答關於營養、飲食同健康嘅問題。\n\n你可以問我：\n• 今日應該食咩？\n• 點樣健康減重？\n• 邊啲食物高蛋白？\n• 我嘅飲食有咩可以改善？',
  food: '根據你今日嘅攝取情況，我建議你可以考慮以下選擇：\n\n1. 雞胸肉沙律 - 高蛋白低脂\n2. 三文魚配糙米 - 優質蛋白同複合碳水\n3. 希臘乳酪配水果 - 補充蛋白質同纖維\n\n你今日蛋白質攝取偏低，建議揀高蛋白嘅食物！',
  weight:
    '減重嘅關鍵係保持適度嘅熱量赤字，同時確保營養均衡。以下係一啲建議：\n\n1. 每餐都要有蛋白質，幫助維持飽足感\n2. 多食蔬菜增加纖維攝取\n3. 減少加工食品同糖分\n4. 保持足夠水分攝取\n\n記住，持續嘅習慣改變比短期節食更有效！',
  protein:
    '蛋白質對身體好重要！以下係一啲優質蛋白質來源：\n\n動物性：雞胸肉、魚、蛋、瘦牛肉、乳製品\n植物性：豆腐、豆類、藜麥、堅果\n\n一般建議每公斤體重攝取 1.6-2.2g 蛋白質，如果你有運動習慣可以攝取較多。',
};

const DEMO_FOOD_ANALYSIS = {
  food_name: '白飯',
  portion_size_grams: 200,
  nutrition: {
    calories: 260,
    protein: 5,
    carbs: 56,
    fat: 0.5,
    fiber: 0.6,
    sodium: 2,
  },
  confidence: 0.85,
};

/**
 * Check if we can use direct Gemini API (local development)
 */
function hasDirectGeminiAccess(): boolean {
  return !!GEMINI_API_KEY;
}

/**
 * Get demo chat response based on message content
 */
function getDemoChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('食咩') || lowerMessage.includes('建議')) {
    return DEMO_CHAT_RESPONSES.food;
  }

  if (lowerMessage.includes('減肥') || lowerMessage.includes('瘦')) {
    return DEMO_CHAT_RESPONSES.weight;
  }

  if (lowerMessage.includes('蛋白質') || lowerMessage.includes('protein')) {
    return DEMO_CHAT_RESPONSES.protein;
  }

  return DEMO_CHAT_RESPONSES.default;
}

/**
 * Format context for the AI system prompt
 */
function formatContext(context?: ChatContext): string {
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
 * Call Gemini API directly (for local development)
 */
async function callGeminiChat(
  message: string,
  history?: ChatMessage[],
  context?: ChatContext
): Promise<ChatResponse> {
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

  // Build conversation for Gemini
  const contents = [];

  // System context as first exchange
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: '明白！我係你嘅 AI 營養師，有咩可以幫到你？' }],
  });

  // Add history
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
      `${GEMINI_API_URL}/${MODELS.CHAT}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return {
        success: false,
        error: `API 錯誤: ${response.status}`,
      };
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return {
        success: false,
        error: 'AI 冇回應',
      };
    }

    return {
      success: true,
      message: textContent,
    };
  } catch (error) {
    console.error('Gemini chat error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Call Gemini Vision API directly for food analysis
 */
async function callGeminiVision(
  imageBase64: string,
  mealContext?: string
): Promise<FoodAnalysisResponse> {
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
  "confidence": 0到1之間嘅數字
}`;

  try {
    const response = await fetch(
      `${GEMINI_API_URL}/${MODELS.VISION}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
                { text: prompt },
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
      console.error('Gemini Vision API error:', errorText);
      return {
        success: false,
        error: `API 錯誤: ${response.status}`,
      };
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return {
        success: false,
        error: 'AI 冇回應',
      };
    }

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Invalid JSON response:', textContent);
      return {
        success: false,
        error: '無法解析 AI 回應',
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
      },
    };
  } catch (error) {
    console.error('Gemini vision error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a message to the AI chat
 */
export async function sendChatMessage(
  message: string,
  history?: ChatMessage[],
  context?: ChatContext
): Promise<ChatResponse> {
  // Option 1: Direct Gemini API (local development with API key)
  if (hasDirectGeminiAccess()) {
    return callGeminiChat(message, history, context);
  }

  // Option 2: Supabase Edge Function (production)
  if (!isDemoMode()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { message, history, context },
        });

        if (error) {
          console.error('Chat function error:', error);
          return {
            success: false,
            error: error.message ?? 'Failed to get AI response',
          };
        }

        return data as ChatResponse;
      } catch (error) {
        console.error('Chat service error:', error);
      }
    }
  }

  // Option 3: Demo mode (no API key, no Supabase)
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    success: true,
    message: getDemoChatResponse(message),
  };
}

/**
 * Analyze food from an image
 */
export async function analyzeFood(
  imageBase64: string,
  mealType?: string
): Promise<FoodAnalysisResponse> {
  // Option 1: Direct Gemini API (local development with API key)
  if (hasDirectGeminiAccess()) {
    return callGeminiVision(imageBase64, mealType);
  }

  // Option 2: Supabase Edge Function (production)
  if (!isDemoMode()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-food', {
          body: { image_base64: imageBase64, meal_type: mealType },
        });

        if (error) {
          console.error('Analyze food function error:', error);
          return {
            success: false,
            error: error.message ?? 'Failed to analyze food',
          };
        }

        return data as FoodAnalysisResponse;
      } catch (error) {
        console.error('Analyze food service error:', error);
      }
    }
  }

  // Option 3: Demo mode (no API key, no Supabase)
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    success: true,
    data: DEMO_FOOD_ANALYSIS,
  };
}
