/**
 * MealTypeSelector - Grid of meal type buttons
 *
 * Allows user to select which meal type (breakfast, lunch, dinner, snack)
 * the food image belongs to.
 */

import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../../components/ui';
import { MealType } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { MEAL_TYPES } from './types';

const { width } = Dimensions.get('window');

interface MealTypeSelectorProps {
  selectedMealType: MealType;
  onSelectMealType: (mealType: MealType) => void;
}

export function MealTypeSelector({
  selectedMealType,
  onSelectMealType,
}: MealTypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <Card style={styles.mealTypeCard}>
        <Text style={styles.sectionLabel}>{t('camera.mealType')}</Text>
        <View style={styles.mealTypeGrid}>
          {MEAL_TYPES.map((meal, index) => (
            <Animated.View
              key={meal.type}
              entering={SlideInRight.delay(index * 50)}
            >
              <TouchableOpacity
                style={[
                  styles.mealTypeButton,
                  selectedMealType === meal.type && styles.mealTypeButtonSelected,
                  selectedMealType === meal.type && { borderColor: meal.color },
                ]}
                onPress={() => onSelectMealType(meal.type)}
                activeOpacity={0.7}
                accessibilityLabel={t(meal.labelKey)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedMealType === meal.type }}
              >
                <View
                  style={[
                    styles.mealTypeIcon,
                    { backgroundColor: meal.color + '15' },
                    selectedMealType === meal.type && { backgroundColor: meal.color + '25' },
                  ]}
                >
                  <Ionicons
                    name={meal.icon}
                    size={18}
                    color={meal.color}
                  />
                </View>
                <Text
                  style={[
                    styles.mealTypeLabel,
                    selectedMealType === meal.type && { color: meal.color, fontWeight: '600' },
                  ]}
                >
                  {t(meal.labelKey)}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mealTypeCard: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  mealTypeButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: (width - SPACING.lg * 2 - SPACING.lg * 2 - SPACING.sm * 3) / 4,
  },
  mealTypeButtonSelected: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  mealTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  mealTypeLabel: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
});
