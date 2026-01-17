-- Nutritrack Enhanced Profile Schema Migration
-- Adds support for expanded user profiles, exercise tracking, habit logging, and wellness features

-- ============================================
-- USERS TABLE ENHANCEMENTS
-- ============================================

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS health_goals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS medications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS supplements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS allergies JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dietary_preferences JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- EXERCISE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN (
    'walking', 'running', 'cycling', 'swimming', 'strength_training',
    'yoga', 'hiit', 'pilates', 'dancing', 'hiking', 'team_sports',
    'martial_arts', 'climbing', 'rowing', 'elliptical', 'stair_climbing',
    'stretching', 'other'
  )),
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER,
  distance_km REAL,
  steps INTEGER,
  avg_heart_rate INTEGER,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'apple_health', 'google_fit')),
  metadata JSONB DEFAULT '{}'::jsonb,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient daily queries
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date 
  ON exercise_logs(user_id, logged_at);

-- ============================================
-- HABIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_type TEXT NOT NULL CHECK (habit_type IN (
    'weight', 'hydration', 'sleep_duration', 'sleep_quality', 'mood',
    'bowels', 'period_cycle', 'five_a_day', 'steps', 'medication_taken',
    'supplement_taken', 'alcohol', 'smoking', 'custom'
  )),
  value TEXT NOT NULL,
  unit TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date 
  ON habit_logs(user_id, logged_at);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_type 
  ON habit_logs(user_id, habit_type, logged_at);

-- ============================================
-- MEDITATION SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  sound_type TEXT CHECK (sound_type IN (
    'rain', 'ocean', 'forest', 'white_noise', 'pink_noise',
    'brown_noise', 'fireplace', 'wind', 'birds', 'thunder'
  )),
  breathing_exercise TEXT CHECK (breathing_exercise IN (
    'box_breathing', 'four_seven_eight', 'deep_breathing',
    'alternate_nostril', 'calming_breath'
  )),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for meditation history
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_date 
  ON meditation_sessions(user_id, completed_at);

-- ============================================
-- AFFIRMATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN (
    'health', 'motivation', 'gratitude', 'self_love', 'strength'
  )),
  text TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's saved affirmations
CREATE TABLE IF NOT EXISTS user_saved_affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affirmation_id UUID NOT NULL REFERENCES affirmations(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, affirmation_id)
);

-- ============================================
-- PORTION GUIDES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS portion_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  serving_size_grams INTEGER NOT NULL,
  visual_reference TEXT NOT NULL,
  image_url TEXT,
  nutrition_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY STEPS CACHE (for quick dashboard loading)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_activity_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  distance_km REAL DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date 
  ON daily_activity_cache(user_id, date);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portion_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_cache ENABLE ROW LEVEL SECURITY;

-- Exercise Logs: Users can only access their own
CREATE POLICY "Users can view own exercise_logs"
  ON exercise_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise_logs"
  ON exercise_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise_logs"
  ON exercise_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise_logs"
  ON exercise_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Habit Logs: Users can only access their own
CREATE POLICY "Users can view own habit_logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit_logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit_logs"
  ON habit_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit_logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Meditation Sessions: Users can only access their own
CREATE POLICY "Users can view own meditation_sessions"
  ON meditation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meditation_sessions"
  ON meditation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Affirmations: Everyone can read
CREATE POLICY "Anyone can view affirmations"
  ON affirmations FOR SELECT
  TO authenticated
  USING (true);

-- User Saved Affirmations: Users can only access their own
CREATE POLICY "Users can view own saved_affirmations"
  ON user_saved_affirmations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved_affirmations"
  ON user_saved_affirmations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved_affirmations"
  ON user_saved_affirmations FOR DELETE
  USING (auth.uid() = user_id);

-- Portion Guides: Everyone can read
CREATE POLICY "Anyone can view portion_guides"
  ON portion_guides FOR SELECT
  TO authenticated
  USING (true);

-- Daily Activity Cache: Users can only access their own
CREATE POLICY "Users can view own daily_activity_cache"
  ON daily_activity_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own daily_activity_cache"
  ON daily_activity_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_activity_cache"
  ON daily_activity_cache FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SEED DATA: AFFIRMATIONS
-- ============================================
INSERT INTO affirmations (category, text, author) VALUES
-- Health
('health', '我的身體每天都在變得更強壯、更健康。', NULL),
('health', '我選擇滋養身體的食物，我的身體感謝我。', NULL),
('health', '我值得擁有充滿活力和健康的生活。', NULL),
('health', '每一口健康的食物都是對自己的愛。', NULL),
('health', '我的身體是我的朋友，我會好好照顧它。', NULL),

-- Motivation
('motivation', '今天我選擇進步，而不是完美。', NULL),
('motivation', '小小的改變帶來大大的結果。', NULL),
('motivation', '我有能力實現我的健康目標。', NULL),
('motivation', '每一天都是新的開始，新的機會。', NULL),
('motivation', '我為自己的每一個進步感到驕傲。', NULL),

-- Gratitude
('gratitude', '我感謝我的身體為我所做的一切。', NULL),
('gratitude', '今天我感恩能夠選擇健康的生活方式。', NULL),
('gratitude', '我感謝每一餐營養的食物。', NULL),
('gratitude', '我的身體是一份禮物，我心存感激。', NULL),

-- Self Love
('self_love', '我愛並接受現在的自己。', NULL),
('self_love', '我值得被善待，包括被自己善待。', NULL),
('self_love', '照顧自己不是自私，而是必要的。', NULL),
('self_love', '我對自己有耐心，改變需要時間。', NULL),

-- Strength
('strength', '我比我想像的更堅強。', NULL),
('strength', '挑戰讓我變得更強大。', NULL),
('strength', '我有力量克服任何障礙。', NULL),
('strength', '今天的努力是明天的力量。', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: PORTION GUIDES
-- ============================================
INSERT INTO portion_guides (food_name, category, serving_size_grams, visual_reference, nutrition_data) VALUES
('白飯', '澱粉類', 150, '一個拳頭大小', '{"calories": 195, "protein": 4, "carbs": 43, "fat": 0, "fiber": 0, "sodium": 0}'),
('雞胸肉', '蛋白質', 100, '一個手掌大小（不含手指）', '{"calories": 165, "protein": 31, "carbs": 0, "fat": 4, "fiber": 0, "sodium": 74}'),
('三文魚', '蛋白質', 100, '一個手掌大小', '{"calories": 208, "protein": 20, "carbs": 0, "fat": 13, "fiber": 0, "sodium": 59}'),
('蔬菜（葉菜類）', '蔬菜', 100, '兩個拳頭大小', '{"calories": 25, "protein": 2, "carbs": 4, "fat": 0, "fiber": 2, "sodium": 50}'),
('蘋果', '水果', 150, '一個網球大小', '{"calories": 78, "protein": 0, "carbs": 21, "fat": 0, "fiber": 4, "sodium": 0}'),
('香蕉', '水果', 120, '一隻中型香蕉', '{"calories": 105, "protein": 1, "carbs": 27, "fat": 0, "fiber": 3, "sodium": 1}'),
('花生醬', '油脂', 32, '一個拇指大小（2湯匙）', '{"calories": 188, "protein": 8, "carbs": 6, "fat": 16, "fiber": 2, "sodium": 147}'),
('芝士', '奶製品', 30, '兩隻手指大小', '{"calories": 113, "protein": 7, "carbs": 0, "fat": 9, "fiber": 0, "sodium": 174}'),
('雞蛋', '蛋白質', 50, '一隻中型雞蛋', '{"calories": 72, "protein": 6, "carbs": 0, "fat": 5, "fiber": 0, "sodium": 71}'),
('牛奶', '奶製品', 240, '一杯（240毫升）', '{"calories": 149, "protein": 8, "carbs": 12, "fat": 8, "fiber": 0, "sodium": 105}'),
('意粉（煮熟）', '澱粉類', 150, '一個拳頭大小', '{"calories": 220, "protein": 8, "carbs": 43, "fat": 1, "fiber": 3, "sodium": 1}'),
('牛油果', '油脂', 50, '四分一個牛油果', '{"calories": 80, "protein": 1, "carbs": 4, "fat": 7, "fiber": 3, "sodium": 4}')
ON CONFLICT DO NOTHING;
