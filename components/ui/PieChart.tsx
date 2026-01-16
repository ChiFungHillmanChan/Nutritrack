/**
 * PieChart Component
 * 
 * Animated pie chart for nutrition and energy visualization.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../constants/typography';

interface PieChartSegment {
  value: number;
  color: string;
  label: string;
}

interface PieChartProps {
  segments: PieChartSegment[];
  size?: number;
  strokeWidth?: number;
  innerRadius?: number;
  centerLabel?: string;
  centerValue?: string;
  centerSubtext?: string;
  animated?: boolean;
  showLabels?: boolean;
  style?: object;
}

/**
 * Calculate the arc path for a pie segment
 */
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Simple donut chart segment
 */
function DonutSegment({
  cx,
  cy,
  radius,
  strokeWidth,
  startAngle,
  endAngle,
  color,
  animated,
}: {
  cx: number;
  cy: number;
  radius: number;
  strokeWidth: number;
  startAngle: number;
  endAngle: number;
  color: string;
  animated: boolean;
}) {
  const animatedEndAngle = useSharedValue(animated ? startAngle : endAngle);

  useEffect(() => {
    if (animated) {
      animatedEndAngle.value = withTiming(endAngle, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [endAngle, animated, animatedEndAngle]);

  // For small angles, just render an arc
  if (endAngle - startAngle < 0.5) {
    return null;
  }

  const path = describeArc(cx, cy, radius, startAngle, endAngle);

  return (
    <Path
      d={path}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
  );
}

export function PieChart({
  segments,
  size = 160,
  strokeWidth = 24,
  innerRadius,
  centerLabel,
  centerValue,
  centerSubtext,
  animated = true,
  showLabels: _showLabels = false,
  style,
}: PieChartProps) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const effectiveInnerRadius = innerRadius ?? radius * 0.6;

  // Calculate total and normalize segments
  const total = segments.reduce((sum, seg) => sum + Math.max(0, seg.value), 0);
  
  // Build arc angles
  let currentAngle = 0;
  const arcs = segments.map((segment) => {
    const percentage = total > 0 ? segment.value / total : 0;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    return {
      ...segment,
      startAngle,
      endAngle,
      percentage,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={COLORS.backgroundTertiary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Segments */}
        <G>
          {arcs.map((arc, index) => (
            arc.percentage > 0 && (
              <DonutSegment
                key={index}
                cx={cx}
                cy={cy}
                radius={radius}
                strokeWidth={strokeWidth}
                startAngle={arc.startAngle}
                endAngle={arc.endAngle}
                color={arc.color}
                animated={animated}
              />
            )
          ))}
        </G>
      </Svg>

      {/* Center content */}
      <View style={[styles.centerContent, { width: effectiveInnerRadius * 1.8 }]}>
        {centerLabel && (
          <Text style={styles.centerLabel}>{centerLabel}</Text>
        )}
        {centerValue && (
          <Text style={styles.centerValue}>{centerValue}</Text>
        )}
        {centerSubtext && (
          <Text style={styles.centerSubtext}>{centerSubtext}</Text>
        )}
      </View>
    </View>
  );
}

/**
 * Energy Balance Three-Chart Component
 */
interface EnergyBalanceChartsProps {
  intake: number;
  burned: number;
  target: number;
  remaining: number;
  style?: object;
}

export function EnergyBalanceCharts({
  intake,
  burned,
  target,
  remaining,
  style,
}: EnergyBalanceChartsProps) {
  const intakePercentage = Math.min((intake / target) * 100, 100);
  const burnedPercentage = Math.min((burned / target) * 100, 100);
  const remainingPercentage = remaining > 0 ? Math.min((remaining / target) * 100, 100) : 0;

  return (
    <View style={[styles.energyContainer, style]}>
      {/* Intake Chart */}
      <View style={styles.energyChart}>
        <MiniDonutChart
          percentage={intakePercentage}
          color={COLORS.calories}
          size={70}
        />
        <Text style={styles.energyLabel}>攝取</Text>
        <Text style={styles.energyValue}>{intake}</Text>
        <Text style={styles.energyUnit}>kcal</Text>
      </View>

      {/* Burned Chart */}
      <View style={styles.energyChart}>
        <MiniDonutChart
          percentage={burnedPercentage}
          color={COLORS.carbs}
          size={70}
        />
        <Text style={styles.energyLabel}>消耗</Text>
        <Text style={styles.energyValue}>{burned}</Text>
        <Text style={styles.energyUnit}>kcal</Text>
      </View>

      {/* Remaining Chart */}
      <View style={styles.energyChart}>
        <MiniDonutChart
          percentage={remainingPercentage}
          color={remaining > 0 ? COLORS.fiber : COLORS.error}
          size={70}
        />
        <Text style={styles.energyLabel}>剩餘</Text>
        <Text style={[
          styles.energyValue,
          remaining < 0 && styles.negativeValue,
        ]}>
          {remaining}
        </Text>
        <Text style={styles.energyUnit}>kcal</Text>
      </View>
    </View>
  );
}

/**
 * Mini Donut Chart for compact displays
 */
function MiniDonutChart({
  percentage,
  color,
  size = 60,
}: {
  percentage: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = size * 0.15;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={COLORS.backgroundTertiary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      {/* Percentage in center */}
      <View style={[styles.miniCenter, { width: size, height: size }]}>
        <Text style={[styles.miniPercentage, { color }]}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
}

/**
 * Macro Distribution Pie Chart
 */
interface MacroChartProps {
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
  style?: object;
}

export function MacroDistributionChart({
  protein,
  carbs,
  fat,
  size = 120,
  style,
}: MacroChartProps) {
  const segments: PieChartSegment[] = [
    { value: protein, color: COLORS.protein, label: '蛋白質' },
    { value: carbs, color: COLORS.carbs, label: '碳水' },
    { value: fat, color: COLORS.fat, label: '脂肪' },
  ];

  const total = protein + carbs + fat;

  return (
    <View style={[styles.macroContainer, style]}>
      <PieChart
        segments={segments}
        size={size}
        strokeWidth={16}
      />
      <View style={styles.macroLegend}>
        {segments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <Text style={styles.legendLabel}>{segment.label}</Text>
            <Text style={[styles.legendValue, { color: segment.color }]}>
              {total > 0 ? Math.round((segment.value / total) * 100) : 0}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  centerValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -1,
  },
  centerSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Energy Balance Charts
  energyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  energyChart: {
    alignItems: 'center',
  },
  energyLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  energyValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  energyUnit: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },
  negativeValue: {
    color: COLORS.error,
  },

  // Mini Chart
  miniCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Macro Distribution
  macroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  macroLegend: {
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    width: 50,
  },
  legendValue: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: '600',
  },
});

export default PieChart;
