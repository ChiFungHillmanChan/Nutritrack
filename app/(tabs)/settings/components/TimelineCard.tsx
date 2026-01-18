/**
 * TimelineCard Component
 *
 * Displays a card that navigates to the timeline view.
 * Shows total records count and timeline entry information.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../../../constants/typography';
import { Card } from '../../../../components/ui';
import { useTranslation } from '../../../../hooks/useTranslation';

export interface TimelineCardProps {
  totalRecords: number;
  onPress: () => void;
}

export function TimelineCard({ totalRecords, onPress }: TimelineCardProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={t('settings.timeline.title')}
      accessibilityRole="button"
      accessibilityHint={t('accessibility.viewTimeline')}
    >
      <Card style={styles.timelineCard}>
        <View style={styles.timelineContent}>
          <View style={styles.timelineIcon}>
            <Ionicons name="document-text" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.timelineInfo}>
            <Text style={styles.timelineTitle}>{t('settings.timeline.title')}</Text>
            <Text style={styles.timelineSubtitle}>
              {t('settings.timeline.subtitle')}
            </Text>
            <Text style={styles.timelineCount}>
              {t('settings.timeline.totalRecords', { count: totalRecords })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  timelineCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primaryMuted,
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  timelineSubtitle: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  timelineCount: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
