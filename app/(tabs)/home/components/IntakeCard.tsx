/**
 * IntakeCard Component
 *
 * Displays today's intake with circular progress for remaining quota
 * and horizontal nutrient progress bars.
 */

import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Card,
  CircularProgress,
  NutrientProgressBars,
} from '../../../../components/ui';
import { COLORS } from '../../../../constants/colors';
import { SPACING, TYPOGRAPHY } from '../../../../constants/typography';
import { useTranslation } from '../../../../hooks/useTranslation';
import type { DailyTargets, NutritionData } from '../../../../types';

interface IntakeCardProps {
  todayNutrition: NutritionData;
  targets: DailyTargets | undefined;
  remainingPercentage: number;
  todayHydration: number;
}

export function IntakeCard({
  todayNutrition,
  targets,
  remainingPercentage,
  todayHydration,
}: IntakeCardProps) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <Card style={styles.intakeCard}>
        <Text style={styles.intakeTitle}>{t('home.todayIntake')}</Text>

        <View style={styles.intakeContent}>
          {/* Left: Circular Progress */}
          <View style={styles.progressContainer}>
            <CircularProgress
              value={todayNutrition.calories}
              max={targets?.calories.max ?? 2000}
              size={140}
              strokeWidth={14}
              color={COLORS.primary}
              backgroundColor={COLORS.backgroundTertiary}
              showValue={false}
              animated
            />
            <View style={styles.progressOverlay}>
              <Text style={styles.progressPercentage}>{remainingPercentage}%</Text>
              <Text style={styles.progressLabel}>{t('common.left')}</Text>
            </View>
          </View>

          {/* Right: Nutrient Bars */}
          <View style={styles.nutrientBarsContainer}>
            <NutrientProgressBars
              carbs={todayNutrition.carbs}
              carbsMax={targets?.carbs.max ?? 250}
              protein={todayNutrition.protein}
              proteinMax={targets?.protein.max ?? 100}
              fiber={todayNutrition.fiber}
              fiberMax={targets?.fiber.max ?? 30}
              fat={todayNutrition.fat}
              fatMax={targets?.fat.max ?? 65}
              sugar={todayNutrition.sugar ?? 0}
              sugarMax={50}
              fluids={todayHydration}
              fluidsMax={targets?.water ?? 2000}
              labels={{
                carbs: t('nutrients.carbs'),
                protein: t('nutrients.protein'),
                fiber: t('nutrients.fiber'),
                fat: t('nutrients.fat'),
                sugar: t('nutrients.sugar'),
                fluids: t('nutrients.fluids'),
              }}
            />
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  intakeCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  intakeTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  intakeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  nutrientBarsContainer: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
});
