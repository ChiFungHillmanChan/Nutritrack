/**
 * Wellness types for Nutritrack
 */

// ============================================
// WELLNESS TYPES
// ============================================

export type AmbientSoundType =
  | 'rain'
  | 'ocean'
  | 'forest'
  | 'white_noise'
  | 'pink_noise'
  | 'brown_noise'
  | 'fireplace'
  | 'wind'
  | 'birds'
  | 'thunder';

export type BreathingExerciseType =
  | 'box_breathing'
  | 'four_seven_eight'
  | 'deep_breathing'
  | 'alternate_nostril'
  | 'calming_breath';

export type MeditationType = 'breathing' | 'guided' | 'ambient' | 'body_scan' | 'custom';

export interface MeditationSession {
  id: string;
  user_id: string;
  type?: MeditationType;
  duration_minutes: number;
  sound_type?: AmbientSoundType;
  breathing_exercise?: BreathingExerciseType;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

export type AffirmationCategory =
  | 'health'
  | 'motivation'
  | 'gratitude'
  | 'self_love'
  | 'strength'
  | 'nutrition'
  | 'mindfulness';

export interface Affirmation {
  id: string;
  category: AffirmationCategory;
  text: string;
  text_zh?: string; // Chinese translation
  author?: string;
}
