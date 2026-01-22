/**
 * MealsSummary Component
 *
 * Displays today's meals with nutrition summary and individual food entries.
 * Supports edit and delete actions for each entry.
 */

import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import { FoodLogItem } from './FoodLogItem';
import type { FoodLog, NutritionData } from '../../types';

interface MealsSummaryProps {
  todayLogs: FoodLog[];
  todayNutrition: NutritionData;
  onEditLog?: (log: FoodLog) => void;
  onDeleteLog?: (logId: string) => void;
}

export function MealsSummary({
  todayLogs,
  todayNutrition,
  onEditLog,
  onDeleteLog,
}: MealsSummaryProps) {
  const { t } = useTranslation();

  if (todayLogs.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.delay(600).springify()}>
      <Card style={styles.mealsCard}>
        <View style={styles.mealsHeader}>
          <View style={styles.mealsTitleRow}>
            <View style={styles.mealsTitleDot} />
            <Text style={styles.mealsTitle}>{t('home.todayRecord')}</Text>
          </View>
          <Text style={styles.mealsCount}>{todayLogs.length} {t('common.items')}</Text>
        </View>

        {/* Nutrition Summary */}
        <View style={styles.mealsSummary}>
          <View style={styles.mealSummaryItem}>
            <Text style={styles.mealSummaryValue}>
              {Math.round(todayNutrition.calories)}
            </Text>
            <Text style={styles.mealSummaryLabel}>{t('units.kcal')}</Text>
          </View>
          <View style={styles.mealSummaryDivider} />
          <View style={styles.mealSummaryItem}>
            <Text style={styles.mealSummaryValue}>
              {Math.round(todayNutrition.protein)}{t('units.g')}
            </Text>
            <Text style={styles.mealSummaryLabel}>{t('onboarding.nutrients.protein')}</Text>
          </View>
          <View style={styles.mealSummaryDivider} />
          <View style={styles.mealSummaryItem}>
            <Text style={styles.mealSummaryValue}>
              {Math.round(todayNutrition.carbs)}{t('units.g')}
            </Text>
            <Text style={styles.mealSummaryLabel}>{t('onboarding.nutrients.carbs')}</Text>
          </View>
        </View>

        {/* Individual Food Entries */}
        <View style={styles.foodLogsList}>
          {todayLogs.map((log) => (
            <FoodLogItem
              key={log.id}
              log={log}
              onEdit={onEditLog}
              onDelete={onDeleteLog}
            />
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mealsCard: {
    padding: SPACING.lg,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealsTitleDot: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  mealsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  mealsCount: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  mealsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  mealSummaryItem: {
    alignItems: 'center',
  },
  mealSummaryValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  mealSummaryLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
  },
  mealSummaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  foodLogsList: {
    marginTop: SPACING.md,
  },
});
