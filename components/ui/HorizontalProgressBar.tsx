/**
 * Horizontal Progress Bar Component
 * 
 * Displays nutrition progress as horizontal bars with labels.
 */

import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';


interface NutrientData {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface HorizontalProgressBarProps {
  data: NutrientData[];
  showPercentage?: boolean;
  showValue?: boolean;
  barHeight?: number;
  animated?: boolean;
  style?: object;
}

export function HorizontalProgressBar({
  data,
  showPercentage = true,
  showValue = false,
  barHeight = 16,
  animated = true,
  style,
}: HorizontalProgressBarProps) {
  return (
    <View style={[styles.container, style]}>
      {data.map((item, index) => (
        <NutrientBar
          key={item.label}
          item={item}
          showPercentage={showPercentage}
          showValue={showValue}
          barHeight={barHeight}
          animated={animated}
          delay={index * 100}
        />
      ))}
    </View>
  );
}

interface NutrientBarProps {
  item: NutrientData;
  showPercentage: boolean;
  showValue: boolean;
  barHeight: number;
  animated: boolean;
  delay: number;
}

function NutrientBar({
  item,
  showPercentage,
  showValue,
  barHeight,
  animated,
  delay: _delay,
}: NutrientBarProps) {
  const percentage = Math.min((item.value / item.max) * 100, 100);

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) {
      return { width: `${percentage}%` };
    }
    return {
      width: withTiming(`${percentage}%`, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    };
  }, [percentage, animated]);

  return (
    <View style={styles.barContainer}>
      <View style={styles.labelRow}>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        <Text style={styles.label}>{item.label}</Text>
        <View style={styles.valueContainer}>
          {showValue && (
            <Text style={[styles.value, { color: item.color }]}>
              {Math.round(item.value)}
            </Text>
          )}
          {showPercentage && (
            <Text style={[styles.percentage, { color: item.color }]}>
              {Math.round(percentage)}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.track, { height: barHeight }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: item.color, height: barHeight },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

/**
 * Preset nutrient bar configurations
 */
interface NutrientProgressBarsProps {
  carbs: number;
  carbsMax: number;
  protein: number;
  proteinMax: number;
  fiber: number;
  fiberMax: number;
  fat: number;
  fatMax: number;
  sugar?: number;
  sugarMax?: number;
  fluids?: number;
  fluidsMax?: number;
  style?: object;
  labels?: {
    carbs: string;
    protein: string;
    fiber: string;
    fat: string;
    sugar: string;
    fluids: string;
  };
}

export function NutrientProgressBars({
  carbs,
  carbsMax,
  protein,
  proteinMax,
  fiber,
  fiberMax,
  fat,
  fatMax,
  sugar,
  sugarMax,
  fluids,
  fluidsMax,
  style,
  labels,
}: NutrientProgressBarsProps) {
  // Default labels (fallback to English)
  const defaultLabels = {
    carbs: 'Carbs',
    protein: 'Protein',
    fiber: 'Fibre',
    fat: 'Fats',
    sugar: 'Sugar',
    fluids: 'Fluids',
  };
  
  const l = labels ?? defaultLabels;
  
  const data: NutrientData[] = [
    { label: l.carbs, value: carbs, max: carbsMax, color: COLORS.carbs },
    { label: l.protein, value: protein, max: proteinMax, color: COLORS.protein },
    { label: l.fiber, value: fiber, max: fiberMax, color: COLORS.fiber },
    { label: l.fat, value: fat, max: fatMax, color: COLORS.fat },
  ];

  if (sugar !== undefined && sugarMax !== undefined) {
    data.push({ label: l.sugar, value: sugar, max: sugarMax, color: '#A855F7' });
  }

  if (fluids !== undefined && fluidsMax !== undefined) {
    data.push({ label: l.fluids, value: fluids, max: fluidsMax, color: COLORS.info });
  }

  return <HorizontalProgressBar data={data} style={style} />;
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  barContainer: {
    marginBottom: SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    ...TYPOGRAPHY.captionMedium,
    marginRight: SPACING.xs,
  },
  percentage: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'right',
  },
  track: {
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
});

export default HorizontalProgressBar;
