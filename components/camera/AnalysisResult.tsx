/**
 * AnalysisResult - Food analysis result display
 *
 * Shows the analyzed food name, portion size, calories,
 * nutrition breakdown, confidence score, and allows adding extra ingredients.
 */

import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card, Button, NutritionBadge } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';
import { AnalysisResultData, ExtraIngredient } from './types';
import { ExtraIngredientForm } from './ExtraIngredientForm';

interface AnalysisResultProps {
  result: AnalysisResultData;
  extraIngredients: ExtraIngredient[];
  onAddIngredient: (ingredient: ExtraIngredient) => void;
  onRemoveIngredient: (id: string) => void;
  onSave: () => void;
}

export function AnalysisResult({
  result,
  extraIngredients,
  onAddIngredient,
  onRemoveIngredient,
  onSave,
}: AnalysisResultProps) {
  const { t } = useTranslation();

  // Get confidence label based on score
  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return { label: t('camera.confidenceHigh'), color: COLORS.success };
    if (confidence >= 0.5) return { label: t('camera.confidenceMedium'), color: COLORS.warning };
    return { label: t('camera.confidenceLow'), color: COLORS.error };
  };

  const confidenceInfo = getConfidenceLabel(result.confidence);

  return (
    <Animated.View entering={FadeInUp.delay(100).springify()}>
      <Card style={styles.resultCard} variant="elevated">
        {/* Food Name Header */}
        <View style={styles.resultHeader}>
          <View style={styles.resultTitleRow}>
            <View style={styles.resultIconContainer}>
              <Ionicons name="restaurant" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.resultTitleContent}>
              <Text style={styles.resultTitle}>{result.food_name}</Text>
              <Text style={styles.resultPortion}>
                {t('camera.estimatedPortion')}: {result.portion_size_grams}g
              </Text>
            </View>
          </View>
          {/* Confidence Badge */}
          <View style={[styles.confidenceBadge, { backgroundColor: confidenceInfo.color + '20' }]}>
            <Ionicons name="analytics" size={14} color={confidenceInfo.color} />
            <Text style={[styles.confidenceText, { color: confidenceInfo.color }]}>
              {confidenceInfo.label} ({Math.round(result.confidence * 100)}%)
            </Text>
          </View>
        </View>

        {/* Detected Ingredients (if available) */}
        {result.ingredients && result.ingredients.length > 0 && (
          <View style={styles.ingredientsSection}>
            <Text style={styles.ingredientsLabel}>{t('camera.detectedIngredients')}</Text>
            <View style={styles.ingredientTags}>
              {result.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientTag}>
                  <Text style={styles.ingredientTagText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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

        {/* Extra Ingredients Form */}
        <ExtraIngredientForm
          ingredients={extraIngredients}
          onAddIngredient={onAddIngredient}
          onRemoveIngredient={onRemoveIngredient}
        />

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
  resultTitleContent: {
    flex: 1,
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
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    gap: SPACING.xs,
  },
  confidenceText: {
    ...TYPOGRAPHY.captionSmall,
    fontWeight: '600',
  },
  ingredientsSection: {
    marginBottom: SPACING.md,
  },
  ingredientsLabel: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  ingredientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  ingredientTag: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  ingredientTagText: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.primary,
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
