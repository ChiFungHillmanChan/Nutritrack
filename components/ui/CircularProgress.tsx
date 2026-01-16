/**
 * CircularProgress Component
 *
 * A beautiful circular progress indicator for nutrition tracking.
 * Supports customizable size, colors, and animated progress.
 */

import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientColors?: [string, string];
  backgroundColor?: string;
  showValue?: boolean;
  showPercentage?: boolean;
  label?: string;
  unit?: string;
  animated?: boolean;
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  color = COLORS.primary,
  gradientColors,
  backgroundColor = COLORS.backgroundTertiary,
  showValue = true,
  showPercentage = false,
  label,
  unit,
  animated = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: animated
        ? withTiming(strokeDashoffset, {
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          })
        : strokeDashoffset,
    };
  }, [strokeDashoffset, animated]);

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  const useGradient = gradientColors && gradientColors.length === 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {useGradient && (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
        )}

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={useGradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        {showValue && (
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color }]} numberOfLines={1}>
              {Math.round(value)}
            </Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </View>
        )}
        {showPercentage && !showValue && (
          <Text style={[styles.percentage, { color }]}>
            {Math.round(percentage)}%
          </Text>
        )}
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </View>
  );
}

/**
 * Mini circular progress for compact displays
 */
interface MiniCircularProgressProps {
  value: number;
  max: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export function MiniCircularProgress({
  value,
  max,
  size = 40,
  color = COLORS.primary,
  backgroundColor = COLORS.backgroundTertiary,
}: MiniCircularProgressProps) {
  const strokeWidth = size * 0.15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  unit: {
    ...TYPOGRAPHY.caption,
    marginLeft: 2,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  label: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
