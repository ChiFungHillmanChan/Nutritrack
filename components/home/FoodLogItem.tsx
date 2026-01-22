/**
 * FoodLogItem Component
 *
 * Displays a single food log entry with edit and delete actions.
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import type { FoodLog } from '../../types';

interface FoodLogItemProps {
  log: FoodLog;
  onEdit?: (log: FoodLog) => void;
  onDelete?: (logId: string) => void;
}

export function FoodLogItem({ log, onEdit, onDelete }: FoodLogItemProps) {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  const getMealTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      breakfast: t('timeline.mealTypes.breakfast'),
      lunch: t('timeline.mealTypes.lunch'),
      dinner: t('timeline.mealTypes.dinner'),
      snack: t('timeline.mealTypes.snack'),
    };
    return labels[type] ?? type;
  };

  const getMealTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      breakfast: COLORS.calories,
      lunch: COLORS.carbs,
      dinner: COLORS.protein,
      snack: COLORS.fat,
    };
    return colors[type] ?? COLORS.primary;
  };

  const handleEdit = useCallback(() => {
    setShowActions(false);
    onEdit?.(log);
  }, [log, onEdit]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('common.delete'),
      t('common.confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setShowActions(false);
            onDelete?.(log.id);
          },
        },
      ]
    );
  }, [log.id, onDelete, t]);

  const toggleActions = useCallback(() => {
    setShowActions((prev) => !prev);
  }, []);

  const mealColor = getMealTypeColor(log.meal_type);
  const timestamp = new Date(log.logged_at);
  const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.mainContent}
        onPress={toggleActions}
        activeOpacity={0.8}
      >
        {/* Meal type indicator */}
        <View style={[styles.mealIndicator, { backgroundColor: mealColor + '20' }]}>
          <View style={[styles.mealDot, { backgroundColor: mealColor }]} />
        </View>

        {/* Food info */}
        <View style={styles.foodInfo}>
          <Text style={styles.foodName} numberOfLines={1}>
            {log.food_name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.mealType}>{getMealTypeLabel(log.meal_type)}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.time}>{timeStr}</Text>
          </View>
        </View>

        {/* Calories */}
        <View style={styles.caloriesContainer}>
          <Text style={styles.calories}>
            {Math.round(log.nutrition_data.calories)}
          </Text>
          <Text style={styles.caloriesUnit}>{t('units.kcal')}</Text>
        </View>
      </TouchableOpacity>

      {/* Action buttons - shown when expanded */}
      {showActions && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={styles.actionsRow}
        >
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Ionicons name="pencil" size={16} color={COLORS.primary} />
              <Text style={styles.actionText}>{t('common.edit')}</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={16} color={COLORS.error} />
              <Text style={[styles.actionText, styles.deleteText]}>{t('common.delete')}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  mealIndicator: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  mealDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  mealType: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
  },
  separator: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },
  time: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },
  caloriesContainer: {
    alignItems: 'flex-end',
  },
  calories: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.text,
  },
  caloriesUnit: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  actionText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.errorLight,
  },
  deleteText: {
    color: COLORS.error,
  },
});
