/**
 * NutritionBadge Component
 *
 * A beautiful badge component for displaying nutrition stats with icons and progress.
 */

import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { MiniCircularProgress } from './CircularProgress';
import { ProgressBar } from './ProgressBar';

type NutritionType = 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sodium';

interface NutritionBadgeProps {
  type: NutritionType;
  value: number;
  max: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  animated?: boolean;
  style?: ViewStyle;
}

const NUTRITION_CONFIG: Record<NutritionType, {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}> = {
  calories: {
    label: '卡路里',
    icon: 'flame',
    color: COLORS.calories,
    bgColor: COLORS.caloriesBg,
  },
  protein: {
    label: '蛋白質',
    icon: 'fish',
    color: COLORS.protein,
    bgColor: COLORS.proteinBg,
  },
  carbs: {
    label: '碳水',
    icon: 'nutrition',
    color: COLORS.carbs,
    bgColor: COLORS.carbsBg,
  },
  fat: {
    label: '脂肪',
    icon: 'water',
    color: COLORS.fat,
    bgColor: COLORS.fatBg,
  },
  fiber: {
    label: '纖維',
    icon: 'leaf',
    color: COLORS.fiber,
    bgColor: COLORS.fiberBg,
  },
  sodium: {
    label: '鈉',
    icon: 'cube',
    color: COLORS.sodium,
    bgColor: COLORS.sodiumBg,
  },
};

export function NutritionBadge({
  type,
  value,
  max,
  unit = 'g',
  size = 'md',
  variant = 'default',
  animated = true,
  style,
}: NutritionBadgeProps) {
  const config = NUTRITION_CONFIG[type];
  const percentage = Math.min((value / max) * 100, 100);

  const AnimatedContainer = animated ? Animated.View : View;
  const enterAnimation = animated ? FadeInDown.delay(100).springify() : undefined;

  if (variant === 'compact') {
    return (
      <AnimatedContainer
        entering={enterAnimation}
        style={[styles.compactBadge, { backgroundColor: config.bgColor }, style]}
      >
        <View style={[styles.compactIcon, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon} size={14} color={config.color} />
        </View>
        <Text style={[styles.compactValue, { color: config.color }]}>
          {Math.round(value)}{unit}
        </Text>
      </AnimatedContainer>
    );
  }

  if (variant === 'detailed') {
    return (
      <AnimatedContainer
        entering={enterAnimation}
        style={[styles.detailedBadge, { backgroundColor: config.bgColor }, style]}
      >
        <View style={styles.detailedHeader}>
          <View style={[styles.detailedIcon, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon} size={18} color={config.color} />
          </View>
          <View style={styles.detailedInfo}>
            <Text style={styles.detailedLabel}>{config.label}</Text>
            <Text style={[styles.detailedValue, { color: config.color }]}>
              {Math.round(value)}<Text style={styles.detailedUnit}>/{max}{unit}</Text>
            </Text>
          </View>
          <Text style={[styles.detailedPercentage, { color: config.color }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
        <ProgressBar
          value={value}
          max={max}
          height={6}
          color={config.color}
          backgroundColor={config.color + '30'}
          style={styles.detailedProgress}
        />
      </AnimatedContainer>
    );
  }

  // Default variant
  return (
    <AnimatedContainer
      entering={enterAnimation}
      style={[
        styles.defaultBadge,
        size === 'sm' && styles.defaultBadgeSm,
        size === 'lg' && styles.defaultBadgeLg,
        style,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Ionicons
          name={config.icon}
          size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
          color={config.color}
        />
      </View>
      <View style={styles.defaultContent}>
        <Text style={[styles.defaultLabel, size === 'sm' && styles.defaultLabelSm]}>
          {config.label}
        </Text>
        <Text style={[styles.defaultValue, { color: config.color }, size === 'sm' && styles.defaultValueSm]}>
          {Math.round(value)}<Text style={styles.defaultUnit}>/{max}{unit}</Text>
        </Text>
      </View>
      <MiniCircularProgress
        value={value}
        max={max}
        size={size === 'sm' ? 28 : size === 'lg' ? 40 : 32}
        color={config.color}
        backgroundColor={config.bgColor}
      />
    </AnimatedContainer>
  );
}

/**
 * NutritionGrid - Grid layout for multiple nutrition badges
 */
interface NutritionGridProps {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  targets: {
    calories: { max: number };
    protein: { max: number };
    carbs: { max: number };
    fat: { max: number };
    fiber?: { max: number };
  };
  variant?: 'default' | 'compact';
  style?: ViewStyle;
}

export function NutritionGrid({
  nutrition,
  targets,
  variant = 'default',
  style,
}: NutritionGridProps) {
  return (
    <View style={[styles.grid, style]}>
      <NutritionBadge
        type="protein"
        value={nutrition.protein}
        max={targets.protein.max}
        variant={variant}
        style={styles.gridItem}
      />
      <NutritionBadge
        type="carbs"
        value={nutrition.carbs}
        max={targets.carbs.max}
        variant={variant}
        style={styles.gridItem}
      />
      <NutritionBadge
        type="fat"
        value={nutrition.fat}
        max={targets.fat.max}
        variant={variant}
        style={styles.gridItem}
      />
      {nutrition.fiber !== undefined && targets.fiber && (
        <NutritionBadge
          type="fiber"
          value={nutrition.fiber}
          max={targets.fiber.max}
          variant={variant}
          style={styles.gridItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact variant
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  compactIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactValue: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Detailed variant
  detailedBadge: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailedIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  detailedLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  detailedValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailedUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  detailedPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailedProgress: {
    marginTop: SPACING.xs,
  },

  // Default variant
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  defaultBadgeSm: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  defaultBadgeLg: {
    padding: SPACING.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  defaultContent: {
    flex: 1,
  },
  defaultLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  defaultLabelSm: {
    fontSize: 10,
  },
  defaultValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  defaultValueSm: {
    fontSize: 14,
  },
  defaultUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
  },
});
