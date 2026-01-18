/**
 * StatItem Component
 *
 * Displays a single statistic with count and label.
 * Used in the data management section to show record counts.
 */

import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';

export interface StatItemProps {
  label: string;
  count: number;
}

export function StatItem({ label, count }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statItem: {
    alignItems: 'center',
  },
  statCount: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
