/**
 * GoalsEditScreen - Edit user health goals
 *
 * Features:
 * - 15 goal options organized in categories
 * - Multiple selection support
 * - Custom notes notepad
 */

import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, GRADIENTS, SHADOWS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { useTranslation } from '../hooks/useTranslation';
import { useUserStore } from '../stores/userStore';
import { Card } from '../components/ui';
import type { HealthGoal } from '../types';

interface GoalOption {
  id: HealthGoal;
  labelKey: string;
  category: 'weight' | 'other';
}

// 15 goal options organized by category
const GOAL_OPTIONS: GoalOption[] = [
  // Weight Goals
  { id: 'healthy_balanced_eating', labelKey: 'goalLabels.healthy_balanced_eating', category: 'weight' },
  { id: 'weight_loss', labelKey: 'goalLabels.weight_loss', category: 'weight' },
  { id: 'weight_gain', labelKey: 'goalLabels.weight_gain', category: 'weight' },
  { id: 'muscle_gain', labelKey: 'goalLabels.muscle_gain', category: 'weight' },
  { id: 'body_aesthetics', labelKey: 'goalLabels.body_aesthetics', category: 'weight' },
  // Other Goals
  { id: 'healthy_bowels', labelKey: 'goalLabels.healthy_bowels', category: 'other' },
  { id: 'improve_hydration', labelKey: 'goalLabels.improve_hydration', category: 'other' },
  { id: 'blood_sugar_control', labelKey: 'goalLabels.blood_sugar_control', category: 'other' },
  { id: 'fix_micros', labelKey: 'goalLabels.fix_micros', category: 'other' },
  { id: 'improve_sleep', labelKey: 'goalLabels.improve_sleep', category: 'other' },
  { id: 'improve_breathing', labelKey: 'goalLabels.improve_breathing', category: 'other' },
  { id: 'reduce_alcohol', labelKey: 'goalLabels.reduce_alcohol', category: 'other' },
  { id: 'reduce_smoking', labelKey: 'goalLabels.reduce_smoking', category: 'other' },
  { id: 'achieve_10k_steps', labelKey: 'goalLabels.achieve_10k_steps', category: 'other' },
  { id: 'improve_mental_health', labelKey: 'goalLabels.improve_mental_health', category: 'other' },
  { id: 'symptoms_improvement', labelKey: 'goalLabels.symptoms_improvement', category: 'other' },
];

export default function GoalsEditScreen() {
  const { t } = useTranslation();
  const { user, updateProfile } = useUserStore();

  const [selectedGoals, setSelectedGoals] = useState<HealthGoal[]>([]);
  const [goalNotes, setGoalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load current goals
  useEffect(() => {
    if (user) {
      setSelectedGoals(user.health_goals || []);
      setGoalNotes(user.goal_notes || '');
    }
  }, [user]);

  const weightGoals = GOAL_OPTIONS.filter((g) => g.category === 'weight');
  const otherGoals = GOAL_OPTIONS.filter((g) => g.category === 'other');

  const toggleGoal = useCallback((goalId: HealthGoal) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((g) => g !== goalId);
      }
      return [...prev, goalId];
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile({
        health_goals: selectedGoals,
        goal_notes: goalNotes.trim() || undefined,
      });
      Alert.alert(t('common.success'), '', [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setIsSaving(false);
    }
  }, [user, selectedGoals, goalNotes, updateProfile, t]);

  const renderGoalItem = (goal: GoalOption, index: number) => {
    const isSelected = selectedGoals.includes(goal.id);
    return (
      <Animated.View
        key={goal.id}
        entering={FadeInDown.delay(index * 30).springify()}
      >
        <TouchableOpacity
          style={[styles.goalItem, isSelected && styles.goalItemSelected]}
          onPress={() => toggleGoal(goal.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
            )}
          </View>
          <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
            {t(goal.labelKey)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('goalsEdit.title'),
          headerBackTitle: t('common.back'),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Weight Goals Section */}
          <Animated.View entering={FadeInDown.springify()}>
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="scale" size={20} color={COLORS.calories} />
                <Text style={styles.sectionTitle}>{t('goalsEdit.weightGoals')}</Text>
              </View>
              <Text style={styles.sectionHint}>{t('goalsEdit.selectMultiple')}</Text>
              <View style={styles.goalsGrid}>
                {weightGoals.map((goal, index) => renderGoalItem(goal, index))}
              </View>
            </Card>
          </Animated.View>

          {/* Other Goals Section */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>{t('goalsEdit.otherGoals')}</Text>
              </View>
              <Text style={styles.sectionHint}>{t('goalsEdit.selectMultiple')}</Text>
              <View style={styles.goalsGrid}>
                {otherGoals.map((goal, index) => renderGoalItem(goal, index + weightGoals.length))}
              </View>
            </Card>
          </Animated.View>

          {/* Notes Section */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={20} color={COLORS.carbs} />
                <Text style={styles.sectionTitle}>{t('goalsEdit.notesTitle')}</Text>
              </View>
              <TextInput
                style={styles.notesInput}
                value={goalNotes}
                onChangeText={setGoalNotes}
                placeholder={t('goalsEdit.notesPlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </Card>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
          >
            <LinearGradient colors={GRADIENTS.primary} style={styles.saveGradient}>
              {isSaving ? (
                <Text style={styles.saveText}>{t('common.loading')}</Text>
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color={COLORS.textInverse} />
                  <Text style={styles.saveText}>{t('common.save')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  sectionHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginBottom: SPACING.md,
  },
  goalsGrid: {
    gap: SPACING.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  goalItemSelected: {
    backgroundColor: COLORS.primaryMuted,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  goalLabelSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    minHeight: 120,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    ...SHADOWS.lg,
  },
  saveButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  saveText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
});
