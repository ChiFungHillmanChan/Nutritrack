/**
 * QuickActions Component
 *
 * Grid of 3 quick action cards: Chat (AI), Habits, and Meditation.
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../../../constants/typography';
import { useTranslation } from '../../../../hooks/useTranslation';

interface QuickActionItem {
  labelKey: string;
  subtitleKey: string;
  accessibilityHintKey: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackgroundColor: string;
  onPress: () => void;
}

export function QuickActions() {
  const { t } = useTranslation();

  const quickActionItems: QuickActionItem[] = [
    {
      labelKey: 'home.askAI',
      subtitleKey: 'home.nutritionAdvice',
      accessibilityHintKey: 'accessibility.navigateToChat',
      iconName: 'chatbubbles',
      iconColor: COLORS.protein,
      iconBackgroundColor: COLORS.proteinBg,
      onPress: () => router.push('/(tabs)/chat'),
    },
    {
      labelKey: 'home.habits',
      subtitleKey: 'home.trackRecord',
      accessibilityHintKey: 'accessibility.navigateToHabits',
      iconName: 'checkmark-circle',
      iconColor: COLORS.fiber,
      iconBackgroundColor: COLORS.fiberBg,
      onPress: () => router.push('/(tabs)/habits'),
    },
    {
      labelKey: 'home.meditation',
      subtitleKey: 'home.relaxMind',
      accessibilityHintKey: 'accessibility.navigateToMeditation',
      iconName: 'leaf',
      iconColor: COLORS.calories,
      iconBackgroundColor: COLORS.caloriesBg,
      onPress: () => router.push('/wellness/meditation' as never),
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.quickActions}>
      {quickActionItems.map((item) => (
        <TouchableOpacity
          key={item.labelKey}
          style={styles.quickActionCard}
          onPress={item.onPress}
          activeOpacity={0.8}
          accessibilityLabel={t(item.labelKey)}
          accessibilityRole="button"
          accessibilityHint={t(item.accessibilityHintKey)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: item.iconBackgroundColor }]}>
            <Ionicons name={item.iconName} size={24} color={item.iconColor} />
          </View>
          <Text style={styles.quickActionTitle}>{t(item.labelKey)}</Text>
          <Text style={styles.quickActionSubtitle}>{t(item.subtitleKey)}</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.text,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
  },
});
