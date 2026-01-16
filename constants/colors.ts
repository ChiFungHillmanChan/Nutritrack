/**
 * Nutritrack Design System - Colors
 *
 * A refined, modern color palette with gradients and semantic colors
 * for a beautiful nutrition tracking experience.
 */

export const COLORS = {
  // Primary Brand Colors - Fresh, healthy greens
  primary: '#10B981', // Emerald green
  primaryLight: '#34D399',
  primaryDark: '#059669',
  primaryMuted: '#D1FAE5',

  // Secondary accent - Warm coral for energy/calories
  accent: '#F97316', // Warm orange
  accentLight: '#FDBA74',
  accentDark: '#EA580C',
  accentMuted: '#FED7AA',

  // Background colors - Clean, subtle depth
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  backgroundTertiary: '#F1F5F9',
  backgroundElevated: '#FFFFFF',

  // Surface colors for cards
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceTertiary: '#F1F5F9',

  // Text colors - High contrast, readable
  text: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textTertiary: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',
  textMuted: '#CBD5E1', // Slate 300

  // Semantic colors with light variants for backgrounds
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorMuted: '#FECACA',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningMuted: '#FDE68A',
  success: '#10B981',
  successLight: '#D1FAE5',
  successMuted: '#A7F3D0',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoMuted: '#BFDBFE',

  // Border colors
  border: '#E2E8F0', // Slate 200
  borderLight: '#F1F5F9', // Slate 100
  borderFocus: '#10B981',

  // Nutrition colors - Vibrant, distinct
  calories: '#F97316', // Orange - Energy
  caloriesLight: '#FED7AA',
  caloriesBg: '#FFF7ED',
  
  protein: '#8B5CF6', // Purple - Strength
  proteinLight: '#DDD6FE',
  proteinBg: '#F5F3FF',
  
  carbs: '#F59E0B', // Amber - Energy source
  carbsLight: '#FDE68A',
  carbsBg: '#FFFBEB',
  
  fat: '#EC4899', // Pink - Essential fats
  fatLight: '#FBCFE8',
  fatBg: '#FDF2F8',
  
  fiber: '#10B981', // Green - Healthy
  fiberLight: '#A7F3D0',
  fiberBg: '#ECFDF5',
  
  sodium: '#06B6D4', // Cyan - Minerals
  sodiumLight: '#A5F3FC',
  sodiumBg: '#ECFEFF',

  // Overlay colors
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',
  overlayDark: 'rgba(15, 23, 42, 0.8)',

  // Shadow colors
  shadowLight: 'rgba(15, 23, 42, 0.04)',
  shadowMedium: 'rgba(15, 23, 42, 0.08)',
  shadowDark: 'rgba(15, 23, 42, 0.12)',
} as const;

// Gradient definitions for LinearGradient components
export const GRADIENTS = {
  primary: ['#10B981', '#059669'],
  primarySoft: ['#D1FAE5', '#A7F3D0'],
  accent: ['#F97316', '#EA580C'],
  accentSoft: ['#FED7AA', '#FDBA74'],
  calories: ['#F97316', '#EA580C'],
  protein: ['#8B5CF6', '#7C3AED'],
  carbs: ['#F59E0B', '#D97706'],
  fat: ['#EC4899', '#DB2777'],
  fiber: ['#10B981', '#059669'],
  card: ['#FFFFFF', '#F8FAFC'],
  dark: ['#1E293B', '#0F172A'],
  glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
} as const;

// Shadow presets for consistent elevation
export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  }),
} as const;

export type ColorKey = keyof typeof COLORS;

/**
 * Theme-based colors for Expo template compatibility
 */
const Colors = {
  light: {
    text: COLORS.text,
    background: COLORS.background,
    tint: COLORS.primary,
    tabIconDefault: COLORS.textTertiary,
    tabIconSelected: COLORS.primary,
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: COLORS.primaryLight,
    tabIconDefault: '#64748B',
    tabIconSelected: COLORS.primaryLight,
  },
};

export default Colors;
