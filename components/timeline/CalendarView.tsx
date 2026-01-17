/**
 * Calendar View Component
 * 
 * Monthly calendar for timeline navigation.
 */

import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

const { width: screenWidth } = Dimensions.get('window');
const CELL_SIZE = (screenWidth - SPACING.lg * 2 - SPACING.xs * 6) / 7;

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  datesWithEntries?: Set<string>;
  style?: object;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

export function CalendarView({
  selectedDate,
  onDateSelect,
  datesWithEntries = new Set(),
  style,
}: CalendarViewProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Fill remaining cells to complete the grid
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return {
      year,
      month,
      days,
    };
  }, [viewDate]);

  const goToPreviousMonth = useCallback(() => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  }, [viewDate]);

  const goToNextMonth = useCallback(() => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  }, [viewDate]);

  const handleDatePress = useCallback(
    (day: number) => {
      const date = new Date(calendarData.year, calendarData.month, day);
      onDateSelect(date);
    },
    [calendarData.year, calendarData.month, onDateSelect]
  );

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      calendarData.month === today.getMonth() &&
      calendarData.year === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    return (
      day === selectedDate.getDate() &&
      calendarData.month === selectedDate.getMonth() &&
      calendarData.year === selectedDate.getFullYear()
    );
  };

  const hasEntries = (day: number): boolean => {
    const dateStr = `${calendarData.year}-${(calendarData.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return datesWithEntries.has(dateStr);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Month Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[calendarData.month]} {calendarData.year}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {calendarData.days.map((day, index) => (
          <View key={index} style={styles.cell}>
            {day !== null ? (
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  isToday(day) && styles.todayButton,
                  isSelected(day) && styles.selectedButton,
                ]}
                onPress={() => handleDatePress(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday(day) && styles.todayText,
                    isSelected(day) && styles.selectedText,
                  ]}
                >
                  {day}
                </Text>
                {hasEntries(day) && (
                  <View
                    style={[
                      styles.entryDot,
                      isSelected(day) && styles.entryDotSelected,
                    ]}
                  />
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyCell} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.xs,
  },
  monthTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  weekdayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  weekdayText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  dayButton: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    borderRadius: (CELL_SIZE - 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  todayText: {
    color: COLORS.primary,
  },
  selectedText: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  entryDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  entryDotSelected: {
    backgroundColor: COLORS.textInverse,
  },
});

export default CalendarView;
