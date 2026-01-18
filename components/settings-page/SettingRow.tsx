/**
 * SettingRow Component
 *
 * Reusable row component for settings screens.
 * Displays an icon, label, optional value, and chevron indicator.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

export interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBackgroundColor: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isDanger?: boolean;
}

export function SettingRow({
  icon,
  iconBackgroundColor,
  iconColor,
  label,
  value,
  onPress,
  showChevron = true,
  isDanger = false,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={value ? `${label}: ${value}` : label}
      accessibilityRole="button"
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBackgroundColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.settingLabel, isDanger && styles.settingLabelDanger]}>
        {label}
      </Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  settingLabelDanger: {
    color: COLORS.error,
  },
  settingValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
});
