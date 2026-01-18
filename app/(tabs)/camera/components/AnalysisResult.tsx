/**
 * AnalysisResult - Food analysis result display
 *
 * Shows the analyzed food name, portion size, calories,
 * and nutrition breakdown with a save button.
 */

import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../../../constants/typography';
import { Card, Button, NutritionBadge } from '../../../../components/ui';
import { useTranslation } from '../../../../hooks/useTranslation';
import { AnalysisResultData } from '../types';

interface AnalysisResultProps {
  result: AnalysisResultData;
  onSave: () => void;
}

export function AnalysisResult({ result, onSave }: AnalysisResultProps) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInUp.delay(100).springify()}>
      <Card style={styles.resultCard} variant="elevated">
        {/* Food Name Header */}
        <View style={styles.resultHeader}>
          <View style={styles.resultTitleRow}>
            <View style={styles.resultIconContainer}>
              <Ionicons name="restaurant" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.resultTitle}>{result.food_name}</Text>
              <Text style={styles.resultPortion}>
                {t('camera.estimatedPortion')}: {result.portion_size_grams}g
              </Text>
            </View>
          </View>
        </View>

        {/* Calories Highlight */}
        <View style={styles.caloriesHighlight}>
          <View style={styles.caloriesLeft}>
            <Text style={styles.caloriesLabel}>{t('camera.totalCalories')}</Text>
            <View style={styles.caloriesValueRow}>
              <Text style={styles.caloriesValue}>
                {Math.round(result.nutrition.calories)}
              </Text>
              <Text style={styles.caloriesUnit}>{t('units.kcal')}</Text>
            </View>
          </View>
          <View style={styles.caloriesIcon}>
            <Ionicons name="flame" size={28} color={COLORS.calories} />
          </View>
        </View>

        {/* Nutrition Grid */}
        <View style={styles.nutritionGrid}>
          <NutritionBadge
            type="protein"
            value={result.nutrition.protein}
            max={100}
            variant="compact"
            style={styles.nutritionCompact}
          />
          <NutritionBadge
            type="carbs"
            value={result.nutrition.carbs}
            max={100}
            variant="compact"
            style={styles.nutritionCompact}
          />
          <NutritionBadge
            type="fat"
            value={result.nutrition.fat}
            max={100}
            variant="compact"
            style={styles.nutritionCompact}
          />
          <NutritionBadge
            type="fiber"
            value={result.nutrition.fiber}
            max={30}
            variant="compact"
            style={styles.nutritionCompact}
          />
        </View>

        {/* Save Button */}
        <Button
          title={t('camera.recordMeal')}
          icon="checkmark-circle"
          onPress={onSave}
          gradient
          fullWidth
          size="lg"
          style={styles.saveButton}
        />
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    padding: SPACING.lg,
  },
  resultHeader: {
    marginBottom: SPACING.lg,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  resultTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  resultPortion: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  caloriesHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.caloriesBg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  caloriesLeft: {
    flex: 1,
  },
  caloriesLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  caloriesValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.calories,
    letterSpacing: -1,
  },
  caloriesUnit: {
    ...TYPOGRAPHY.body,
    color: COLORS.calories,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  caloriesIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.calories + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  nutritionCompact: {
    flex: 1,
  },
  saveButton: {
    marginTop: SPACING.sm,
  },
});
