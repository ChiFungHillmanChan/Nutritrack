/**
 * Profile Edit Screen
 *
 * Allows users to edit their profile information including
 * name, height, weight, goal, and activity level.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { useUserStore, calculateAge } from '../stores/userStore';
import { User, UserGoal, ActivityLevel, Gender } from '../types';
import { Card } from '../components/ui';
import { useTranslation } from '../hooks/useTranslation';

export default function ProfileEditScreen() {
  const { user, updateProfile, calculateDailyTargets } = useUserStore();
  const { t } = useTranslation();

  // Form state
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [heightCm, setHeightCm] = useState(user?.height_cm?.toString() ?? '');
  const [weightKg, setWeightKg] = useState(user?.weight_kg?.toString() ?? '');
  const [goal, setGoal] = useState<UserGoal>(user?.goal ?? 'maintain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    user?.activity_level ?? 'moderate'
  );
  const [gender, setGender] = useState<Gender>(user?.gender ?? 'prefer_not_to_say');
  const [isSaving, setIsSaving] = useState(false);

  // Get translated options
  const GOALS = useMemo(() => [
    { value: 'lose_weight' as UserGoal, label: t('profileEdit.goals.loseWeight'), icon: 'trending-down' },
    { value: 'maintain' as UserGoal, label: t('profileEdit.goals.maintain'), icon: 'remove' },
    { value: 'gain_weight' as UserGoal, label: t('profileEdit.goals.gainWeight'), icon: 'trending-up' },
    { value: 'build_muscle' as UserGoal, label: t('profileEdit.goals.buildMuscle'), icon: 'barbell' },
  ], [t]);

  const ACTIVITY_LEVELS = useMemo(() => [
    { value: 'sedentary' as ActivityLevel, label: t('profileEdit.activity.sedentary'), desc: t('profileEdit.activity.sedentaryDesc') },
    { value: 'light' as ActivityLevel, label: t('profileEdit.activity.light'), desc: t('profileEdit.activity.lightDesc') },
    { value: 'moderate' as ActivityLevel, label: t('profileEdit.activity.moderate'), desc: t('profileEdit.activity.moderateDesc') },
    { value: 'active' as ActivityLevel, label: t('profileEdit.activity.active'), desc: t('profileEdit.activity.activeDesc') },
    { value: 'very_active' as ActivityLevel, label: t('profileEdit.activity.veryActive'), desc: t('profileEdit.activity.veryActiveDesc') },
  ], [t]);

  const GENDERS = useMemo(() => [
    { value: 'male' as Gender, label: t('profileEdit.genders.male') },
    { value: 'female' as Gender, label: t('profileEdit.genders.female') },
    { value: 'other' as Gender, label: t('profileEdit.genders.other') },
    { value: 'prefer_not_to_say' as Gender, label: t('profileEdit.genders.preferNotToSay') },
  ], [t]);

  const handleSave = useCallback(async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('profileEdit.errors.nameRequired'));
      return;
    }

    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);

    if (isNaN(height) || height < 100 || height > 250) {
      Alert.alert(t('common.error'), t('profileEdit.errors.invalidHeight'));
      return;
    }

    if (isNaN(weight) || weight < 30 || weight > 300) {
      Alert.alert(t('common.error'), t('profileEdit.errors.invalidWeight'));
      return;
    }

    setIsSaving(true);

    try {
      // Calculate new daily targets based on updated profile
      const age = calculateAge(user?.date_of_birth);
      const newTargets = calculateDailyTargets({
        height,
        weight,
        age,
        gender,
        activityLevel,
        goal,
        healthGoals: user?.health_goals ?? [],
        conditions: user?.medical_conditions ?? [],
      });

      const updates: Partial<User> = {
        name: name.trim(),
        email: email.trim(),
        height_cm: height,
        weight_kg: weight,
        goal,
        activity_level: activityLevel,
        gender,
        daily_targets: newTargets,
      };

      const success = await updateProfile(updates);

      if (success) {
        Alert.alert(t('common.success'), t('profileEdit.success.updated'), [
          { text: t('common.ok'), onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t('common.error'), t('profileEdit.errors.updateFailed'));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert(t('common.error'), t('profileEdit.errors.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [
    name,
    email,
    heightCm,
    weightKg,
    goal,
    activityLevel,
    gender,
    user,
    updateProfile,
    calculateDailyTargets,
    t,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('profileEdit.title'),
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={styles.saveButton}
            >
              <Text style={[styles.saveText, isSaving && styles.savingText]}>
                {isSaving ? t('profileEdit.saving') : t('common.save')}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Info */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>{t('profileEdit.basicInfo')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profileEdit.name')}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t('profileEdit.namePlaceholder')}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profileEdit.email')}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t('profileEdit.emailPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profileEdit.gender')}</Text>
              <View style={styles.optionsRow}>
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[
                      styles.optionChip,
                      gender === g.value && styles.optionChipSelected,
                    ]}
                    onPress={() => setGender(g.value)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        gender === g.value && styles.optionChipTextSelected,
                      ]}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          {/* Body Measurements */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>{t('profileEdit.bodyData')}</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t('profileEdit.height')} ({t('units.cm')})</Text>
                <TextInput
                  style={styles.input}
                  value={heightCm}
                  onChangeText={setHeightCm}
                  placeholder="170"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t('profileEdit.weight')} ({t('units.kg')})</Text>
                <TextInput
                  style={styles.input}
                  value={weightKg}
                  onChangeText={setWeightKg}
                  placeholder="65"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </Card>

          {/* Goal Selection */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>{t('profileEdit.healthGoal')}</Text>
            <View style={styles.goalsGrid}>
              {GOALS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[
                    styles.goalCard,
                    goal === g.value && styles.goalCardSelected,
                  ]}
                  onPress={() => setGoal(g.value)}
                >
                  <Ionicons
                    name={g.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={goal === g.value ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.goalLabel,
                      goal === g.value && styles.goalLabelSelected,
                    ]}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Activity Level */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>{t('profileEdit.activityLevel')}</Text>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.activityRow,
                  activityLevel === level.value && styles.activityRowSelected,
                ]}
                onPress={() => setActivityLevel(level.value)}
              >
                <View style={styles.activityInfo}>
                  <Text
                    style={[
                      styles.activityLabel,
                      activityLevel === level.value && styles.activityLabelSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text style={styles.activityDesc}>{level.desc}</Text>
                </View>
                {activityLevel === level.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </Card>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  saveText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    fontWeight: '600',
  },
  savingText: {
    color: COLORS.textMuted,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  optionChipSelected: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  optionChipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  optionChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  goalCard: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  goalLabel: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.textSecondary,
  },
  goalLabelSelected: {
    color: COLORS.primary,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
  },
  activityRowSelected: {
    backgroundColor: COLORS.primaryMuted,
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  activityLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  activityDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
