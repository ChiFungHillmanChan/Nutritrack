/**
 * MVP Typography Constants
 * 
 * Simple typography system for the MVP version.
 */

import { TextStyle } from 'react-native';
import { COLORS } from './colors';

export const TYPOGRAPHY: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 26,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    color: COLORS.text,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
    color: COLORS.text,
    lineHeight: 20,
  },
  
  // Caption / Helper text
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  
  // Labels
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  
  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
} as const;
