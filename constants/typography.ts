/**
 * Nutritrack Design System - Typography
 *
 * A refined typography system with better visual hierarchy
 * and improved readability across all screen sizes.
 */

import { TextStyle, Platform } from 'react-native';
import { COLORS } from './colors';

// Base font family - uses system fonts for best rendering
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const TYPOGRAPHY: Record<string, TextStyle> = {
  // Display - Large hero text
  display: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 48,
    letterSpacing: -1,
    fontFamily,
  },

  // Headings with refined spacing
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 40,
    letterSpacing: -0.5,
    fontFamily,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 34,
    letterSpacing: -0.3,
    fontFamily,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 30,
    letterSpacing: -0.2,
    fontFamily,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 26,
    fontFamily,
  },
  h5: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 24,
    fontFamily,
  },

  // Body text - Optimized for readability
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 24,
    fontFamily,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 24,
    fontFamily,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 20,
    fontFamily,
  },
  bodySmallMedium: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 20,
    fontFamily,
  },

  // Caption / Helper text
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 16,
    fontFamily,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 16,
    fontFamily,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textTertiary,
    lineHeight: 14,
    letterSpacing: 0.3,
    fontFamily,
  },

  // Labels - For form elements and tags
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
    fontFamily,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 16,
    letterSpacing: 0.2,
    fontFamily,
  },
  labelLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 22,
    fontFamily,
  },

  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.2,
    fontFamily,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.2,
    fontFamily,
  },
  buttonLarge: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0.2,
    fontFamily,
  },

  // Numbers - For stats and metrics
  number: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 56,
    letterSpacing: -1,
    fontFamily,
  },
  numberMedium: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 40,
    letterSpacing: -0.5,
    fontFamily,
  },
  numberSmall: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 32,
    letterSpacing: -0.3,
    fontFamily,
  },

  // Overline - Small uppercase labels
  overline: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily,
  },

  // Link text
  link: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    lineHeight: 24,
    fontFamily,
  },
} as const;

// Spacing constants for consistent layout
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Border radius constants
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;
