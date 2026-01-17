/**
 * Quick Actions Component
 * 
 * Row of quick action buttons for the profile page.
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
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
  const { t } = useTranslation();

  const actions: QuickAction[] = [
    {
      id: 'settings',
      icon: 'settings',
      labelKey: 'settings.quickActions.setting',
      color: COLORS.textSecondary,
      bgColor: COLORS.backgroundTertiary,
      onPress: () => router.push('/profile-edit' as never),
    },
    {
      id: 'notifications',
      icon: 'notifications',
      labelKey: 'settings.quickActions.notifications',
      color: COLORS.warning,
      bgColor: COLORS.warningLight,
      onPress: onNotificationsPress ?? (() => Alert.alert(t('settings.quickActions.notifications'), t('settings.quickActions.notificationsAlert'))),
    },
    {
      id: 'feedback',
      icon: 'thumbs-up',
      labelKey: 'settings.quickActions.feedback',
      color: COLORS.info,
      bgColor: COLORS.infoLight,
      onPress: onFeedbackPress ?? (() => Alert.alert(t('settings.quickActions.feedback'), t('settings.quickActions.feedbackAlert'))),
    },
    {
      id: 'theme',
      icon: 'shirt',
      labelKey: 'settings.quickActions.theme',
      color: COLORS.protein,
      bgColor: COLORS.proteinBg,
      onPress: onThemePress ?? (() => Alert.alert(t('settings.quickActions.theme'), t('settings.quickActions.themeAlert'))),
    },
    {
      id: 'export',
      icon: 'download',
      labelKey: 'settings.quickActions.export',
      color: COLORS.primary,
      bgColor: COLORS.primaryMuted,
      onPress: onExportPress ?? (() => Alert.alert(t('settings.quickActions.export'), t('settings.quickActions.exportAlert'))),
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
          <Text style={styles.label}>{t(action.labelKey)}</Text>
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
