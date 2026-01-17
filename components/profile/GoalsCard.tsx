/**
 * Goals Card Component
 * 
 * Displays user's health goals with checkboxes.
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../ui';
import type { HealthGoal } from '../../types';

// Goal labels mapping
const GOAL_LABELS: Record<HealthGoal, string> = {
  healthy_balanced_eating: '均衡飲食',
  weight_loss: '減重',
  weight_gain: '增重',
  healthy_bowels: '腸道健康',
  muscle_gain: '增肌',
  improve_hydration: '增加飲水',
  blood_sugar_control: '控制血糖',
  fix_micros: '改善微量營養素',
  improve_sleep: '改善睡眠',
  improve_breathing: '改善呼吸',
  reduce_alcohol: '減少飲酒',
  reduce_smoking: '減少吸煙',
  achieve_10k_steps: '每日萬步',
  improve_mental_health: '改善心理健康',
};

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
      Alert.alert('編輯目標', '此功能即將推出');
    }
  }, [onEditPress]);

  // Show max 3 goals
  const displayGoals = goals.slice(0, 3);

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>MY GOALS</Text>
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
                {GOAL_LABELS[goal] || goal}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={32} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>未設定任何目標</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleEdit}>
              <Text style={styles.addButtonText}>新增目標</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {goals.length > 3 && (
        <TouchableOpacity style={styles.viewAll} onPress={handleEdit}>
          <Text style={styles.viewAllText}>查看全部 {goals.length} 個目標</Text>
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
