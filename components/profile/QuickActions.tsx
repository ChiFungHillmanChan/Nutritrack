/**
 * Quick Actions Component
 * 
 * Row of quick action buttons for the profile page.
 */

import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

interface QuickActionsProps {
  onThemePress?: () => void;
  onExportPress?: () => void;
  onFeedbackPress?: () => void;
  onNotificationsPress?: () => void;
  style?: object;
}

export function QuickActions({
  onThemePress,
  onExportPress,
  onFeedbackPress,
  onNotificationsPress,
  style,
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'settings',
      icon: 'settings',
      label: 'Setting',
      color: COLORS.textSecondary,
      bgColor: COLORS.backgroundTertiary,
      onPress: () => router.push('/profile-edit' as never),
    },
    {
      id: 'notifications',
      icon: 'notifications',
      label: 'Notifications',
      color: COLORS.warning,
      bgColor: COLORS.warningLight,
      onPress: onNotificationsPress || (() => Alert.alert('通知設定', '此功能即將推出')),
    },
    {
      id: 'feedback',
      icon: 'thumbs-up',
      label: 'Feedback',
      color: COLORS.info,
      bgColor: COLORS.infoLight,
      onPress: onFeedbackPress || (() => Alert.alert('回饋', '感謝你的意見！此功能即將推出')),
    },
    {
      id: 'theme',
      icon: 'shirt',
      label: 'Theme',
      color: COLORS.protein,
      bgColor: COLORS.proteinBg,
      onPress: onThemePress || (() => Alert.alert('主題', '深色模式即將推出')),
    },
    {
      id: 'export',
      icon: 'download',
      label: 'Export',
      color: COLORS.primary,
      bgColor: COLORS.primaryMuted,
      onPress: onExportPress || (() => Alert.alert('匯出報告', '此功能即將推出')),
    },
  ];

  return (
    <View style={[styles.container, style]}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionButton}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
            <Ionicons name={action.icon} size={22} color={action.color} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  label: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default QuickActions;
