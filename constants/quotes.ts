/**
 * Daily Quotes and Health Tips
 * 
 * Motivational quotes and health tips that rotate daily.
 */

export interface Quote {
  id: string;
  text: string;
  textEn?: string;
  author?: string;
  category: 'motivation' | 'health' | 'nutrition' | 'mindfulness';
}

export const DAILY_QUOTES: Quote[] = [
  // Motivation
  {
    id: 'q1',
    text: '千里之行，始於足下。',
    textEn: 'A journey of a thousand miles begins with a single step.',
    author: '老子',
    category: 'motivation',
  },
  {
    id: 'q2',
    text: '今天的努力，是明天的成功。',
    textEn: "Today's effort is tomorrow's success.",
    category: 'motivation',
  },
  {
    id: 'q3',
    text: '健康是最大的財富。',
    textEn: 'Health is the greatest wealth.',
    category: 'motivation',
  },
  {
    id: 'q4',
    text: '每一次選擇，都是成為更好自己的機會。',
    textEn: 'Every choice is an opportunity to become a better version of yourself.',
    category: 'motivation',
  },
  {
    id: 'q5',
    text: '堅持不懈，金石可鏤。',
    textEn: 'With perseverance, even the hardest stone can be carved.',
    category: 'motivation',
  },

  // Health Tips
  {
    id: 'h1',
    text: '每日八杯水，身體更健康。',
    textEn: 'Drink 8 glasses of water daily for better health.',
    category: 'health',
  },
  {
    id: 'h2',
    text: '適量運動，心情愉快。',
    textEn: 'Regular exercise improves mood.',
    category: 'health',
  },
  {
    id: 'h3',
    text: '充足睡眠是最好的補品。',
    textEn: 'Adequate sleep is the best supplement.',
    category: 'health',
  },
  {
    id: 'h4',
    text: '深呼吸，放鬆心情。',
    textEn: 'Take deep breaths to relax your mind.',
    category: 'health',
  },
  {
    id: 'h5',
    text: '預防勝於治療。',
    textEn: 'Prevention is better than cure.',
    category: 'health',
  },

  // Nutrition
  {
    id: 'n1',
    text: '彩虹飲食，營養均衡。',
    textEn: 'Eat the rainbow for balanced nutrition.',
    category: 'nutrition',
  },
  {
    id: 'n2',
    text: '細嚼慢咽，有助消化。',
    textEn: 'Chew slowly for better digestion.',
    category: 'nutrition',
  },
  {
    id: 'n3',
    text: '早餐要吃好，午餐要吃飽，晚餐要吃少。',
    textEn: 'Eat well at breakfast, full at lunch, light at dinner.',
    category: 'nutrition',
  },
  {
    id: 'n4',
    text: '食物是最好的藥物。',
    textEn: 'Let food be thy medicine.',
    author: '希波克拉底',
    category: 'nutrition',
  },
  {
    id: 'n5',
    text: '多吃蔬果，少油少鹽。',
    textEn: 'More fruits and vegetables, less oil and salt.',
    category: 'nutrition',
  },

  // Mindfulness
  {
    id: 'm1',
    text: '活在當下，珍惜此刻。',
    textEn: 'Live in the present, cherish the moment.',
    category: 'mindfulness',
  },
  {
    id: 'm2',
    text: '感恩每一天的開始。',
    textEn: 'Be grateful for every new day.',
    category: 'mindfulness',
  },
  {
    id: 'm3',
    text: '放慢腳步，享受生活。',
    textEn: 'Slow down and enjoy life.',
    category: 'mindfulness',
  },
  {
    id: 'm4',
    text: '微笑是最好的開始。',
    textEn: 'A smile is the best way to start.',
    category: 'mindfulness',
  },
  {
    id: 'm5',
    text: '今天也要好好照顧自己。',
    textEn: 'Take care of yourself today too.',
    category: 'mindfulness',
  },
];

/**
 * Get a quote for today based on the date
 * Returns the same quote for the entire day
 */
export function getTodayQuote(): Quote {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % DAILY_QUOTES.length;
  return DAILY_QUOTES[index];
}

/**
 * Get a random quote
 */
export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * DAILY_QUOTES.length);
  return DAILY_QUOTES[index];
}

/**
 * Get quotes by category
 */
export function getQuotesByCategory(category: Quote['category']): Quote[] {
  return DAILY_QUOTES.filter((q) => q.category === category);
}

/**
 * Get localized quote text based on language
 */
export function getLocalizedQuoteText(quote: Quote, language: 'en' | 'zh-TW'): string {
  if (language === 'en' && quote.textEn) {
    return quote.textEn;
  }
  return quote.text;
}

/**
 * Get today's quote with localized text
 */
export function getTodayLocalizedQuote(language: 'en' | 'zh-TW'): { text: string; author?: string } {
  const quote = getTodayQuote();
  return {
    text: getLocalizedQuoteText(quote, language),
    author: quote.author,
  };
}
