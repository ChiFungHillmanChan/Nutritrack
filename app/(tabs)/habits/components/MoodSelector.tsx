/**
 * MoodSelector Component
 *
 * A grid of mood emojis for selecting current mood level.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../../../constants/typography';
import { useTranslation } from '../../../../hooks/useTranslation';
import type { MoodLevel } from '../../../../types';

interface MoodOption {
  emoji: string;
  label: string;
}

interface MoodSelectorProps {
  onSelect: (mood: MoodLevel) => void;
}

export function MoodSelector({ onSelect }: MoodSelectorProps) {
  const { t } = useTranslation();

  const moodEmojis: Record<MoodLevel, MoodOption> = {
    1: { emoji: '😢', label: t('habits.mood.veryBad') },
    2: { emoji: '😔', label: t('habits.mood.bad') },
    3: { emoji: '😐', label: t('habits.mood.okay') },
    4: { emoji: '😊', label: t('habits.mood.good') },
    5: { emoji: '😄', label: t('habits.mood.veryGood') },
  };

  const moodLevels: MoodLevel[] = [1, 2, 3, 4, 5];

  return (
    <View style={styles.moodGrid}>
      {moodLevels.map((mood) => (
        <TouchableOpacity
          key={mood}
          style={styles.moodButton}
          onPress={() => onSelect(mood)}
          accessibilityLabel={moodEmojis[mood].label}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.selectMoodLevel')}
        >
          <Text style={styles.moodEmoji}>{moodEmojis[mood].emoji}</Text>
          <Text style={styles.moodLabel}>{moodEmojis[mood].label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
  },
  moodButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  moodLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
