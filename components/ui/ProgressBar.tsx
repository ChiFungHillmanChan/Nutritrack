/**
 * ProgressBar Component
 *
 * A beautiful linear progress bar with animations and gradient support.
 */

import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/typography';

interface ProgressBarProps {
  value: number;
  max: number;
  height?: number;
  color?: string;
  gradientColors?: readonly [string, string, ...string[]];
  backgroundColor?: string;
  borderRadius?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  max,
  height = 8,
  color = COLORS.primary,
  gradientColors,
  backgroundColor = COLORS.backgroundTertiary,
  borderRadius = RADIUS.full,
  animated = true,
  style,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: animated
        ? withTiming(`${percentage}%`, {
            duration: 800,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          })
        : `${percentage}%`,
    };
  }, [percentage, animated]);

  const useGradient = gradientColors && gradientColors.length >= 2;

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    >
      {useGradient ? (
        <Animated.View style={[styles.fillContainer, animatedStyle]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientFill, { borderRadius }]}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              borderRadius,
            },
            animatedStyle,
          ]}
        />
      )}
    </View>
  );
}

/**
 * Segmented Progress Bar for multi-part progress
 */
interface SegmentedProgressBarProps {
  segments: Array<{
    value: number;
    color: string;
  }>;
  max: number;
  height?: number;
  backgroundColor?: string;
  gap?: number;
  style?: ViewStyle;
}

export function SegmentedProgressBar({
  segments,
  max,
  height = 8,
  backgroundColor = COLORS.backgroundTertiary,
  gap = 2,
  style,
}: SegmentedProgressBarProps) {
  const totalValue = segments.reduce((sum, seg) => sum + seg.value, 0);
  
  return (
    <View
      style={[
        styles.segmentedContainer,
        {
          height,
          backgroundColor,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <View style={styles.segmentsRow}>
        {segments.map((segment, index) => {
          const percentage = (segment.value / max) * 100;
          return (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  width: `${percentage}%`,
                  backgroundColor: segment.color,
                  marginLeft: index > 0 ? gap : 0,
                  borderRadius: height / 2,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  fillContainer: {
    height: '100%',
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
  },
  segmentedContainer: {
    overflow: 'hidden',
  },
  segmentsRow: {
    flexDirection: 'row',
    height: '100%',
  },
  segment: {
    height: '100%',
  },
});
