/**
 * Goals Card Component
 * 
 * Displays user's health goals with checkboxes.
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../ui';
import { useTranslation } from '../../hooks/useTranslation';
import type { HealthGoal } from '../../types';

interface GoalsCardProps {
  goals: HealthGoal[];
  completedGoals?: string[];
  onToggleGoal?: (goalId: string) => void;
  onEditPress?: () => void;
  style?: object;
}

export function GoalsCard({
  goals,
  completedGoals = [],
  onToggleGoal,
  onEditPress,
  style,
}: GoalsCardProps) {
  const { t } = useTranslation();
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(
    new Set(completedGoals)
  );

  const handleToggle = useCallback((goal: HealthGoal) => {
    setLocalCompleted((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(goal)) {
        newSet.delete(goal);
      } else {
        newSet.add(goal);
      }
      return newSet;
    });
    onToggleGoal?.(goal);
  }, [onToggleGoal]);

  const handleEdit = useCallback(() => {
    if (onEditPress) {
      onEditPress();
    } else {
      Alert.alert(t('settings.goals.editTitle'), t('settings.goals.editComingSoon'));
    }
  }, [onEditPress, t]);

  // Get translated goal label
  const getGoalLabel = (goal: HealthGoal): string => {
    return t(`goalLabels.${goal}`) ?? goal;
  };

  // Show max 3 goals
  const displayGoals = goals.slice(0, 3);

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.goals.title').toUpperCase()}</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.goalsList}>
        {displayGoals.length > 0 ? (
          displayGoals.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={styles.goalItem}
              onPress={() => handleToggle(goal)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  localCompleted.has(goal) && styles.checkboxChecked,
                ]}
              >
                {localCompleted.has(goal) && (
                  <Ionicons name="checkmark" size={16} color={COLORS.textInverse} />
                )}
              </View>
              <Text
                style={[
                  styles.goalText,
                  localCompleted.has(goal) && styles.goalTextCompleted,
                ]}
              >
                {getGoalLabel(goal)}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={32} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>{t('settings.goals.noGoals')}</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleEdit}>
              <Text style={styles.addButtonText}>{t('settings.goals.addGoal')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {goals.length > 3 && (
        <TouchableOpacity style={styles.viewAll} onPress={handleEdit}>
          <Text style={styles.viewAllText}>{t('settings.goals.viewAll', { count: goals.length })}</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  editButton: {
    padding: SPACING.xs,
  },
  goalsList: {
    gap: SPACING.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  goalTextCompleted: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  addButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.full,
  },
  addButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.primary,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewAllText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
});

export default GoalsCard;
