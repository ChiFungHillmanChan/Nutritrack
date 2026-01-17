/**
 * Timeline Screen
 * 
 * View all entries in calendar or list format.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { useUserStore } from '../stores/userStore';
import { useFoodStore } from '../stores/foodStore';
import { useHabitStore } from '../stores/habitStore';
import { useTranslation } from '../hooks/useTranslation';
import { CalendarView, ListView, TimelineEntry } from '../components/timeline';

type ViewMode = 'calendar' | 'list';

export default function TimelineScreen() {
  const { user } = useUserStore();
  const { allLogs, fetchAllLogs, isLoading: foodLoading } = useFoodStore();
  const { allHabits, fetchAllHabits, isLoading: habitLoading } = useHabitStore();
  const { t } = useTranslation();
  
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch all data on mount
  useEffect(() => {
    if (user?.id) {
      fetchAllLogs(user.id);
      fetchAllHabits(user.id);
    }
  }, [user?.id, fetchAllLogs, fetchAllHabits]);

  const handleRefresh = useCallback(() => {
    if (user?.id) {
      fetchAllLogs(user.id);
      fetchAllHabits(user.id);
    }
  }, [user?.id, fetchAllLogs, fetchAllHabits]);

  // Helper to get meal type label
  const getMealTypeLabel = useCallback((type: string): string => {
    const labels: Record<string, string> = {
      breakfast: t('timeline.mealTypes.breakfast'),
      lunch: t('timeline.mealTypes.lunch'),
      dinner: t('timeline.mealTypes.dinner'),
      snack: t('timeline.mealTypes.snack'),
    };
    return labels[type] ?? type;
  }, [t]);

  // Helper to get habit config
  const getHabitConfig = useCallback((type: string): {
    label: string;
    entryType: TimelineEntry['type'];
    showValue: boolean;
  } => {
    const configs: Record<string, { label: string; entryType: TimelineEntry['type']; showValue: boolean }> = {
      weight: { label: t('habits.types.weight'), entryType: 'weight', showValue: true },
      hydration: { label: t('habits.types.hydration'), entryType: 'hydration', showValue: true },
      mood: { label: t('habits.types.mood'), entryType: 'mood', showValue: false },
      sleep_duration: { label: t('habits.types.sleep'), entryType: 'habit', showValue: true },
      bowels: { label: t('habits.types.bowels'), entryType: 'habit', showValue: false },
      five_a_day: { label: t('habits.types.fiveADay'), entryType: 'habit', showValue: true },
      period_cycle: { label: t('habits.types.periodCycle'), entryType: 'habit', showValue: false },
    };
    return configs[type] ?? { label: t('habits.habitRecord'), entryType: 'habit', showValue: false };
  }, [t]);

  // Helper to format habit value
  const formatHabitValue = useCallback((type: string, value: number | string): string => {
    switch (type) {
      case 'weight':
        return `${value} ${t('units.kg')}`;
      case 'hydration':
        return `${value} ${t('units.ml')}`;
      case 'sleep_duration':
        return `${value} ${t('units.hours')}`;
      case 'five_a_day':
        return `${value} ${t('units.servings')}`;
      case 'mood': {
        const moods = ['', t('habits.mood.veryBad'), t('habits.mood.bad'), t('habits.mood.okay'), t('habits.mood.good'), t('habits.mood.veryGood')];
        return moods[Number(value)] || '';
      }
      case 'bowels':
        return `Bristol ${value}`;
      default:
        return String(value);
    }
  }, [t]);

  // Helper to format date display
  const formatDateDisplay = useCallback((date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
      return t('common.today');
    }
    if (isSameDay(date, yesterday)) {
      return t('common.yesterday');
    }

    return `${date.getMonth() + 1}/${date.getDate()}`;
  }, [t]);

  // Convert food logs to timeline entries
  const foodEntries: TimelineEntry[] = useMemo(() => {
    return (allLogs || []).map((log) => ({
      id: `food-${log.id}`,
      type: 'food' as const,
      title: log.food_name,
      subtitle: getMealTypeLabel(log.meal_type),
      value: `${Math.round(log.nutrition_data.calories)} ${t('units.kcal')}`,
      timestamp: new Date(log.logged_at),
    }));
  }, [allLogs, getMealTypeLabel, t]);

  // Convert habit logs to timeline entries
  const habitEntries: TimelineEntry[] = useMemo(() => {
    return (allHabits || []).map((log) => {
      const config = getHabitConfig(log.habit_type);
      return {
        id: `habit-${log.id}`,
        type: config.entryType,
        title: config.label,
        subtitle: formatHabitValue(log.habit_type, log.value),
        value: config.showValue ? String(log.value) : undefined,
        timestamp: new Date(log.logged_at),
      };
    });
  }, [allHabits, getHabitConfig, formatHabitValue]);

  // Combine all entries
  const allEntries: TimelineEntry[] = useMemo(() => {
    return [...foodEntries, ...habitEntries].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [foodEntries, habitEntries]);

  // Filter entries for selected date (calendar view)
  const selectedDateEntries: TimelineEntry[] = useMemo(() => {
    return allEntries.filter((entry) => isSameDay(entry.timestamp, selectedDate));
  }, [allEntries, selectedDate]);

  // Get dates with entries for calendar dots
  const datesWithEntries: Set<string> = useMemo(() => {
    const dates = new Set<string>();
    allEntries.forEach((entry) => {
      const dateStr = formatDateKey(entry.timestamp);
      dates.add(dateStr);
    });
    return dates;
  }, [allEntries]);

  const isLoading = foodLoading || habitLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('timeline.title'),
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* View Mode Toggle */}
        <Animated.View entering={FadeIn.delay(100)}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'calendar' && styles.toggleButtonActive,
              ]}
              onPress={() => setViewMode('calendar')}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === 'calendar' && styles.toggleTextActive,
                ]}
              >
                {t('timeline.calendar')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'list' && styles.toggleButtonActive,
              ]}
              onPress={() => setViewMode('list')}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === 'list' && styles.toggleTextActive,
                ]}
              >
                {t('timeline.list')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {viewMode === 'calendar' ? (
          <>
            {/* Calendar */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <CalendarView
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                datesWithEntries={datesWithEntries}
                style={styles.calendar}
              />
            </Animated.View>

            {/* Selected Date Entries */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text style={styles.sectionTitle}>
                {formatDateDisplay(selectedDate)}
              </Text>
              <ListView entries={selectedDateEntries} />
            </Animated.View>
          </>
        ) : (
          /* List View */
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={styles.sectionTitle}>{t('timeline.list')}</Text>
            <Text style={styles.totalCount}>
              {allEntries.length} {t('common.items')}
            </Text>
            <ListView entries={allEntries} />
          </Animated.View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: RADIUS.full,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  toggleText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  calendar: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  totalCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
