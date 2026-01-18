/**
 * DataManagementSection Component
 *
 * Displays data statistics and clear data functionality.
 * Shows counts for food logs, chat logs, and habit logs.
 */

import { View, Text, Alert, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';
import { SettingRow } from './SettingRow';
import { StatItem } from './StatItem';

export interface DataStats {
  foodLogsCount: number;
  chatMessagesCount: number;
  habitLogsCount: number;
  exerciseLogsCount: number;
}

export interface DataManagementSectionProps {
  dataStats: DataStats;
  onClearData: () => void;
}

export function DataManagementSection({
  dataStats,
  onClearData,
}: DataManagementSectionProps) {
  const { t } = useTranslation();

  const totalRecords =
    dataStats.foodLogsCount +
    dataStats.chatMessagesCount +
    dataStats.habitLogsCount +
    dataStats.exerciseLogsCount;

  const handleClearData = () => {
    Alert.alert(
      t('settings.clearConfirm.title'),
      t('settings.clearConfirm.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.clearConfirm.clear'),
          style: 'destructive',
          onPress: onClearData,
        },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.groupTitle}>{t('settings.dataManagement')}</Text>

      <View style={styles.statsRow}>
        <StatItem label={t('settings.foodLogs')} count={dataStats.foodLogsCount} />
        <StatItem label={t('settings.chatLogs')} count={dataStats.chatMessagesCount} />
        <StatItem label={t('settings.habitLogs')} count={dataStats.habitLogsCount} />
      </View>

      <SettingRow
        icon="trash"
        iconBackgroundColor={COLORS.errorLight}
        iconColor={COLORS.error}
        label={t('settings.clearAllData')}
        value={`${totalRecords} ${t('common.items')}`}
        onPress={handleClearData}
        isDanger
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  groupTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
  },
});
