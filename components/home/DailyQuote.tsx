/**
 * Daily Quote Component
 * 
 * Displays the daily motivational quote or health tip.
 * Supports multiple languages based on user preference.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { getTodayLocalizedQuote } from '../../constants/quotes';
import { Card } from '../ui';
import { useTranslation } from '../../hooks/useTranslation';

interface DailyQuoteProps {
  style?: object;
}

export function DailyQuote({ style }: DailyQuoteProps) {
  const { language } = useTranslation();
  const quote = getTodayLocalizedQuote(language as 'en' | 'zh-TW');

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.quoteContainer}>
        {/* Opening quote mark */}
        <View style={styles.quoteMarkContainer}>
          <Ionicons name="chatbox" size={32} color={COLORS.primaryMuted} />
        </View>

        {/* Quote text */}
        <Text style={styles.quoteText}>{quote.text}</Text>

        {/* Author (if any) */}
        {quote.author && (
          <Text style={styles.author}>— {quote.author}</Text>
        )}
      </View>

      {/* Decorative elements */}
      <View style={styles.decorativeBar} />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primaryMuted,
    overflow: 'hidden',
  },
  quoteContainer: {
    paddingHorizontal: SPACING.sm,
  },
  quoteMarkContainer: {
    marginBottom: SPACING.sm,
  },
  quoteText: {
    ...TYPOGRAPHY.body,
    fontSize: 18,
    fontStyle: 'italic',
    color: COLORS.primaryDark,
    lineHeight: 28,
    marginBottom: SPACING.sm,
  },
  author: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    textAlign: 'right',
  },
  decorativeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
});

export default DailyQuote;
