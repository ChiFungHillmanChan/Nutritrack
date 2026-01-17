/**
 * List View Component
 * 
 * Chronological list of timeline entries.
 */

import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { EntryCard, TimelineEntry } from './EntryCard';

interface GroupedEntries {
  date: string;
  dateLabel: string;
  entries: TimelineEntry[];
}

interface ListViewProps {
  entries: TimelineEntry[];
  style?: object;
}

export function ListView({ entries, style }: ListViewProps) {
  // Group entries by date
  const groupedEntries = groupEntriesByDate(entries);

  if (entries.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <View style={styles.emptyIcon}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.textTertiary} />
        </View>
        <Text style={styles.emptyTitle}>未有記錄</Text>
        <Text style={styles.emptySubtitle}>
          你的所有記錄會在這裡顯示
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {groupedEntries.map((group, groupIndex) => (
        <View key={group.date} style={styles.dateGroup}>
          {/* Date Header */}
          <View style={styles.dateHeader}>
            <View style={styles.dateLine} />
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{group.dateLabel}</Text>
            </View>
            <View style={styles.dateLine} />
          </View>

          {/* Entries */}
          {group.entries.map((entry, index) => (
            <Animated.View
              key={entry.id}
              entering={FadeInRight.delay((groupIndex * 3 + index) * 50).springify()}
            >
              <EntryCard entry={entry} />
            </Animated.View>
          ))}
        </View>
      ))}
    </View>
  );
}

function groupEntriesByDate(entries: TimelineEntry[]): GroupedEntries[] {
  const grouped: Map<string, TimelineEntry[]> = new Map();

  // Sort entries by timestamp (newest first)
  const sorted = [...entries].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Group by date
  sorted.forEach((entry) => {
    const dateKey = formatDateKey(entry.timestamp);
    const existing = grouped.get(dateKey) || [];
    existing.push(entry);
    grouped.set(dateKey, existing);
  });

  // Convert to array
  return Array.from(grouped.entries()).map(([date, entries]) => ({
    date,
    dateLabel: formatDateLabel(new Date(date)),
    entries,
  }));
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return '今日';
  }
  if (isSameDay(date, yesterday)) {
    return '昨日';
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

  return `${month}月${day}日 (星期${weekday})`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: SPACING.lg,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dateBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: RADIUS.full,
    marginHorizontal: SPACING.sm,
  },
  dateText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default ListView;
