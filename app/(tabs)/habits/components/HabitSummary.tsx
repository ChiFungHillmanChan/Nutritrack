/**
 * HabitSummary Component
 *
 * Displays today's habit log summary with a list of recorded entries.
 */

import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../../../constants/typography';
import { Card } from '../../../../components/ui';
import { useTranslation } from '../../../../hooks/useTranslation';
import type { HabitLog } from '../../../../types';
import type { HabitConfig } from './HabitCard';

interface HabitSummaryProps {
  todayLogs: HabitLog[];
  habitConfigs: HabitConfig[];
}

export function HabitSummary({ todayLogs, habitConfigs }: HabitSummaryProps) {
  const { t } = useTranslation();

  return (
    <Card style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryTitleRow}>
          <View style={styles.summaryDot} />
          <Text style={styles.summaryTitle}>{t('habits.todayRecord')}</Text>
        </View>
        <Text style={styles.summaryCount}>{todayLogs.length} {t('common.items')}</Text>
      </View>

      {todayLogs.length > 0 ? (
        <View style={styles.logsList}>
          {todayLogs.map((log, index) => {
            const config = habitConfigs.find((habitConfig) => habitConfig.type === log.habit_type);
            const label = config ? t(config.labelKey) : log.habit_type;
            const unit = config?.unitKey ? t(config.unitKey) : '';
            return (
              <Animated.View
                key={log.id}
                entering={FadeInRight.delay(index * 50)}
                style={styles.logItem}
              >
                <View style={[styles.logIcon, { backgroundColor: (config?.color || COLORS.primary) + '15' }]}>
                  <Ionicons
                    name={config?.icon || 'checkmark'}
                    size={16}
                    color={config?.color || COLORS.primary}
                  />
                </View>
                <Text style={styles.logLabel}>{label}</Text>
                <Text style={[styles.logValue, { color: config?.color || COLORS.primary }]}>
                  {log.value} {unit}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('habits.noRecords')}</Text>
          <Text style={styles.emptySubtext}>{t('habits.tapToStart')}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    padding: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  summaryTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  summaryCount: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  logsList: {
    gap: SPACING.sm,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  logLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  logValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
