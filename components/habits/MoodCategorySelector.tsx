/**
 * MoodCategorySelector - Two-step mood selection
 *
 * Step 1: Select mood category (emoji)
 * Step 2: Select specific mood from that category
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

export interface MoodSelection {
  category: string;
  mood: string;
}

interface MoodCategorySelectorProps {
  onSelect: (selection: MoodSelection) => void;
}

interface MoodCategory {
  id: string;
  emoji: string;
  labelKey: string;
  moods: string[];
}

const MOOD_CATEGORIES: MoodCategory[] = [
  {
    id: 'positive',
    emoji: '😊',
    labelKey: 'habits.moodCategories.positive',
    moods: ['Happy', 'Content', 'Calm', 'Peaceful', 'Relaxed', 'Excited', 'Motivated', 'Inspired', 'Hopeful', 'Confident', 'Playful', 'Proud', 'Grateful', 'Loving', 'Optimistic'],
  },
  {
    id: 'neutral',
    emoji: '😐',
    labelKey: 'habits.moodCategories.neutral',
    moods: ['Neutral', 'Meh', 'Okay', 'Indifferent', 'Steady', 'Blank', 'Unbothered', 'Detached', 'Routine'],
  },
  {
    id: 'low',
    emoji: '😔',
    labelKey: 'habits.moodCategories.low',
    moods: ['Sad', 'Down', 'Lonely', 'Empty', 'Disappointed', 'Hopeless', 'Gloomy', 'Tearful', 'Vulnerable', 'Grieving'],
  },
  {
    id: 'stressed',
    emoji: '😣',
    labelKey: 'habits.moodCategories.stressed',
    moods: ['Stressed', 'Overwhelmed', 'Anxious', 'Nervous', 'Worried', 'Tense', 'Burned out', 'Pressured', 'Restless'],
  },
  {
    id: 'angry',
    emoji: '😠',
    labelKey: 'habits.moodCategories.angry',
    moods: ['Angry', 'Frustrated', 'Irritated', 'Annoyed', 'Resentful', 'Bitter', 'Impatient', 'Enraged'],
  },
  {
    id: 'tired',
    emoji: '😴',
    labelKey: 'habits.moodCategories.tired',
    moods: ['Tired', 'Exhausted', 'Sleepy', 'Fatigued', 'Drained', 'Sluggish', 'Unmotivated'],
  },
  {
    id: 'reflective',
    emoji: '🤔',
    labelKey: 'habits.moodCategories.reflective',
    moods: ['Thoughtful', 'Confused', 'Curious', 'Focused', 'Scattered', 'Doubtful', 'Self-critical', 'Mindful'],
  },
  {
    id: 'mixed',
    emoji: '🌧️',
    labelKey: 'habits.moodCategories.mixed',
    moods: ['Numb', 'Moody', 'Bittersweet', 'Sensitive', 'Unsettled', 'Emotionally full', 'Emotionally drained'],
  },
];

export function MoodCategorySelector({ onSelect }: MoodCategorySelectorProps) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<MoodCategory | null>(null);

  const handleCategorySelect = useCallback((category: MoodCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleMoodSelect = useCallback((mood: string) => {
    if (!selectedCategory) return;
    onSelect({
      category: selectedCategory.id,
      mood,
    });
  }, [selectedCategory, onSelect]);

  const handleBack = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  // Step 1: Category Selection
  if (!selectedCategory) {
    return (
      <Animated.View entering={FadeIn} style={styles.container}>
        <Text style={styles.title}>{t('habits.moodCategories.selectCategory')}</Text>
        <View style={styles.categoryGrid}>
          {MOOD_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryButton}
              onPress={() => handleCategorySelect(category)}
              accessibilityLabel={t(category.labelKey)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryLabel}>{t(category.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  }

  // Step 2: Mood Selection within Category
  return (
    <Animated.View
      entering={SlideInRight.springify()}
      exiting={SlideOutLeft}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.categoryEmoji}>{selectedCategory.emoji}</Text>
        <Text style={styles.headerTitle}>{t(selectedCategory.labelKey)}</Text>
      </View>

      <ScrollView
        style={styles.moodScrollView}
        contentContainerStyle={styles.moodList}
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory.moods.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={styles.moodButton}
            onPress={() => handleMoodSelect(mood)}
            accessibilityLabel={mood}
          >
            <Text style={styles.moodText}>{mood}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  categoryButton: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  categoryLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  moodScrollView: {
    maxHeight: 300,
  },
  moodList: {
    gap: SPACING.xs,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  moodText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
});
