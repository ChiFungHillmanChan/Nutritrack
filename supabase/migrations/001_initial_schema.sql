-- Nutritrack Initial Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  height_cm REAL,
  weight_kg REAL,
  goal TEXT CHECK (goal IN ('lose_weight', 'gain_weight', 'maintain', 'build_muscle')),
  medical_conditions JSONB DEFAULT '[]'::jsonb,
  daily_targets JSONB,
  notification_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOOD LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  portion_size REAL NOT NULL,
  nutrition_data JSONB NOT NULL,
  image_url TEXT,
  ai_confidence REAL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient daily queries
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date 
  ON food_logs(user_id, logged_at);

-- ============================================
-- WEIGHT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg REAL NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for weight history queries
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date 
  ON weight_logs(user_id, logged_at);

-- ============================================
-- NUTRITION FACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS nutrition_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('vitamins', 'minerals', 'macros', 'weight_loss', 'muscle_building', 'general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT HISTORY TABLE (for AI conversations)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for chat history
CREATE INDEX IF NOT EXISTS idx_chat_history_user_date 
  ON chat_history(user_id, created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_facts ENABLE ROW LEVEL SECURITY;

-- Users: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Food Logs: Users can only access their own food logs
CREATE POLICY "Users can view own food_logs"
  ON food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food_logs"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food_logs"
  ON food_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food_logs"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Weight Logs: Users can only access their own weight logs
CREATE POLICY "Users can view own weight_logs"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight_logs"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight_logs"
  ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight_logs"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Chat History: Users can only access their own chat history
CREATE POLICY "Users can view own chat_history"
  ON chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat_history"
  ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Nutrition Facts: Everyone can read, only admins can write
CREATE POLICY "Anyone can view nutrition_facts"
  ON nutrition_facts FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKET FOR FOOD IMAGES
-- ============================================
-- Run this in the Supabase Dashboard > Storage
-- Create a new bucket named 'food-images' with:
-- - Public: false (private bucket)
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage policies (run in SQL editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', false);

-- CREATE POLICY "Users can upload own food images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'food-images' 
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can view own food images"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'food-images' 
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete own food images"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'food-images' 
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
