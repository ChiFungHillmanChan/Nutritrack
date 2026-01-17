/**
 * Exercise Guide Screen
 * 
 * Light exercise and stretching guides.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';
import { EXERCISE_GUIDE_CATEGORIES, type Exercise, type ExerciseGuideCategory } from '../../constants/exercises';

export default function ExerciseGuideScreen() {
  const { t } = useTranslation();
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return COLORS.success;
      case 'medium':
        return COLORS.warning;
      case 'hard':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return t(`tools.exerciseGuide.difficulty.${difficulty}`);
  };

  const getCategoryName = (categoryId: string) => {
    return t(`tools.exerciseGuide.categories.${categoryId}.name`);
  };

  const getCategoryDescription = (categoryId: string) => {
    return t(`tools.exerciseGuide.categories.${categoryId}.description`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('tools.exerciseGuide.title'),
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>{t('tools.exerciseGuide.headerTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('tools.exerciseGuide.subtitle')}
          </Text>
        </Animated.View>

        {EXERCISE_GUIDE_CATEGORIES.map((category: ExerciseGuideCategory, catIndex: number) => (
          <Animated.View
            key={category.id}
            entering={FadeInDown.delay(200 + catIndex * 100)}
          >
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <View>
                <Text style={styles.categoryTitle}>{getCategoryName(category.id)}</Text>
                <Text style={styles.categoryDesc}>{getCategoryDescription(category.id)}</Text>
              </View>
            </View>

            {category.exercises.map((exercise: Exercise) => (
              <TouchableOpacity
                key={exercise.id}
                activeOpacity={0.8}
                onPress={() => setExpandedExercise(
                  expandedExercise === exercise.id ? null : exercise.id
                )}
              >
                <Card style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                      <Ionicons name={exercise.icon} size={24} color={category.color} />
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <View style={styles.exerciseMeta}>
                        <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }]}>
                          <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                            {getDifficultyLabel(exercise.difficulty)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons
                      name={expandedExercise === exercise.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={COLORS.textTertiary}
                    />
                  </View>

                  {expandedExercise === exercise.id && (
                    <View style={styles.expandedContent}>
                      <Text style={styles.exerciseDesc}>{exercise.description}</Text>
                      <Text style={styles.stepsTitle}>{t('tools.exerciseGuide.steps')}：</Text>
                      {exercise.steps.map((step: string, index: number) => (
                        <View key={index} style={styles.stepItem}>
                          <View style={[styles.stepNumber, { backgroundColor: category.color }]}>
                            <Text style={styles.stepNumberText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            ))}
          </Animated.View>
        ))}

        {/* Safety Note */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Card style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Ionicons name="warning" size={24} color={COLORS.warning} />
              <Text style={styles.safetyTitle}>{t('tools.exerciseGuide.safetyTitle')}</Text>
            </View>
            <Text style={styles.safetyText}>
              • {t('tools.exerciseGuide.safety1')}{'\n'}
              • {t('tools.exerciseGuide.safety2')}{'\n'}
              • {t('tools.exerciseGuide.safety3')}{'\n'}
              • {t('tools.exerciseGuide.safety4')}
            </Text>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  categoryDot: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  categoryTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  categoryDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  exerciseCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  exerciseName: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  exerciseDuration: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  difficultyText: {
    ...TYPOGRAPHY.captionSmall,
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  exerciseDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  stepsTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textInverse,
  },
  stepText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  safetyCard: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.warningLight,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  safetyTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
  },
  safetyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
