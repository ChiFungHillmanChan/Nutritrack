/**
 * Entry Card Component
 * 
 * Displays a single timeline entry (food, exercise, or habit).
 */

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../ui';

export type EntryType = 'food' | 'exercise' | 'habit' | 'weight' | 'hydration' | 'mood';

export interface TimelineEntry {
  id: string;
  type: EntryType;
  title: string;
  subtitle?: string;
  value?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface EntryCardProps {
  entry: TimelineEntry;
  style?: object;
}

const ENTRY_CONFIG: Record<EntryType, {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  label: string;
}> = {
  food: {
    icon: 'restaurant',
    color: COLORS.calories,
    bgColor: COLORS.caloriesBg,
    label: '食物',
  },
  exercise: {
    icon: 'fitness',
    color: COLORS.protein,
    bgColor: COLORS.proteinBg,
    label: '運動',
  },
  habit: {
    icon: 'checkmark-circle',
    color: COLORS.primary,
    bgColor: COLORS.primaryMuted,
    label: '習慣',
  },
  weight: {
    icon: 'scale',
    color: COLORS.info,
    bgColor: COLORS.infoLight,
    label: '體重',
  },
  hydration: {
    icon: 'water',
    color: COLORS.sodium,
    bgColor: COLORS.sodiumBg,
    label: '飲水',
  },
  mood: {
    icon: 'happy',
    color: COLORS.warning,
    bgColor: COLORS.warningLight,
    label: '心情',
  },
};

export function EntryCard({ entry, style }: EntryCardProps) {
  const config = ENTRY_CONFIG[entry.type];
  const timeStr = formatTime(entry.timestamp);

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={[styles.typeLabel, { color: config.color }]}>
              {config.label}
            </Text>
            <Text style={styles.time}>{timeStr}</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {entry.title}
          </Text>
          {entry.subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {entry.subtitle}
            </Text>
          )}
        </View>

        {/* Value */}
        {entry.value && (
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: config.color }]}>
              {entry.value}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeLabel: {
    ...TYPOGRAPHY.captionMedium,
    textTransform: 'uppercase',
  },
  time: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },
  title: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  valueContainer: {
    marginLeft: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: RADIUS.sm,
  },
  value: {
    ...TYPOGRAPHY.labelMedium,
  },
});

export default EntryCard;
