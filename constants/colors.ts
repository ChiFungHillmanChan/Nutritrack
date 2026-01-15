/**
 * MVP Color Constants
 *
 * Simple, clean color palette for the MVP version.
 * Can be expanded later for theming support.
 */

export const COLORS = {
  // Primary colors
  primary: '#22C55E', // Healthy green - main accent color
  primaryLight: '#4ADE80', // Lighter green for hover states
  primaryDark: '#16A34A', // Darker green for pressed states

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',

  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Semantic colors
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#22C55E',
  successLight: '#DCFCE7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Nutrition colors (for progress indicators)
  calories: '#EF4444', // Red
  protein: '#3B82F6', // Blue
  carbs: '#F59E0B', // Amber
  fat: '#8B5CF6', // Purple
  fiber: '#22C55E', // Green
  sodium: '#EC4899', // Pink
} as const;

export type ColorKey = keyof typeof COLORS;

/**
 * Theme-based colors for Expo template compatibility
 * Used by components like Themed.tsx and EditScreenInfo.tsx
 */
const Colors = {
  light: {
    text: '#1F2937',
    background: '#FFFFFF',
    tint: '#22C55E',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#22C55E',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1F2937',
    tint: '#4ADE80',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#4ADE80',
  },
};

export default Colors;
