/**
 * HabitCard Component
 *
 * Displays a single habit card with progress indicator and quick-add buttons.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card, CircularProgress } from '../../components/ui';
import type { HabitType } from '../../types';

/** Configuration for a habit card display */
export interface HabitConfig {
  type: HabitType;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  unitKey?: string;
  quickAdd?: number[];
  maxValue?: number;
}

interface HabitCardProps {
  habit: HabitConfig;
  label: string;
  unit?: string;
  value: number | string;
  progress: number;
  onPress: () => void;
  onQuickAdd?: (value: number) => void;
}

export function HabitCard({
  habit,
  label,
  unit,
  value,
  progress: _progress,
  onPress,
  onQuickAdd,
}: HabitCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityLabel={`${label}: ${value} ${unit ?? ''}`}
      accessibilityRole="button"
      accessibilityHint={`Tap to log ${label}`}
    >
      <Card style={styles.habitCard}>
        <View style={styles.habitCardContent}>
          <View style={styles.habitCardHeader}>
            <View style={[styles.habitIcon, { backgroundColor: habit.color + '15' }]}>
              <Ionicons name={habit.icon} size={20} color={habit.color} />
            </View>
            {habit.maxValue && (
              <CircularProgress
                value={Number(value) || 0}
                max={habit.maxValue}
                size={36}
                strokeWidth={3}
                color={habit.color}
                showValue={false}
              />
            )}
          </View>

          <Text style={styles.habitLabel}>{label}</Text>
          <View style={styles.habitValueRow}>
            <Text style={[styles.habitValue, { color: habit.color }]}>
              {value || 0}
            </Text>
            {unit && (
              <Text style={styles.habitUnit}>{unit}</Text>
            )}
          </View>
        </View>

        <View style={styles.quickAddContainer}>
          {onQuickAdd && habit.quickAdd ? (
            <View style={styles.quickAddRow}>
              {habit.quickAdd.map((quickAddValue) => (
                <TouchableOpacity
                  key={quickAddValue}
                  style={[styles.quickAddButton, { borderColor: habit.color }]}
                  onPress={() => onQuickAdd(quickAddValue)}
                  accessibilityLabel={`Add ${quickAddValue} ${unit ?? ''}`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.quickAddText, { color: habit.color }]}>
                    +{quickAddValue}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  habitCard: {
    padding: SPACING.md,
    height: 150,
  },
  habitCardContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  habitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  habitIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  habitValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  habitValue: {
    ...TYPOGRAPHY.h3,
  },
  habitUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  quickAddContainer: {
    height: 28,
    justifyContent: 'flex-end',
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  quickAddButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  quickAddText: {
    ...TYPOGRAPHY.captionMedium,
  },
});
