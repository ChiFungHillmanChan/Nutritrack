/**
 * Profile Edit Screen
 *
 * Allows users to edit their profile information including
 * name, height, weight, goal, and activity level.
 */

import { useState, useCallback } from 'react';
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
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { useUserStore, calculateAge } from '../stores/userStore';
import { User, UserGoal, ActivityLevel, Gender } from '../types';
import { Card } from '../components/ui';

const GOALS: { value: UserGoal; label: string; icon: string }[] = [
  { value: 'lose_weight', label: '減重', icon: 'trending-down' },
  { value: 'maintain', label: '維持體重', icon: 'remove' },
  { value: 'gain_weight', label: '增重', icon: 'trending-up' },
  { value: 'build_muscle', label: '增肌', icon: 'barbell' },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: '久坐', desc: '很少運動' },
  { value: 'light', label: '輕度活動', desc: '每週運動1-3天' },
  { value: 'moderate', label: '中度活動', desc: '每週運動3-5天' },
  { value: 'active', label: '活躍', desc: '每週運動6-7天' },
  { value: 'very_active', label: '非常活躍', desc: '每天高強度運動' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: '其他' },
  { value: 'prefer_not_to_say', label: '不願透露' },
];

export default function ProfileEditScreen() {
  const { user, updateProfile, calculateDailyTargets } = useUserStore();

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

  const handleSave = useCallback(async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('錯誤', '請輸入名稱');
      return;
    }

    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);

    if (isNaN(height) || height < 100 || height > 250) {
      Alert.alert('錯誤', '請輸入有效的身高 (100-250 cm)');
      return;
    }

    if (isNaN(weight) || weight < 30 || weight > 300) {
      Alert.alert('錯誤', '請輸入有效的體重 (30-300 kg)');
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
        Alert.alert('成功', '個人資料已更新', [
          { text: '確定', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('錯誤', '更新失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('錯誤', '更新失敗，請稍後再試');
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
  ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: '編輯個人資料',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={styles.saveButton}
            >
              <Text style={[styles.saveText, isSaving && styles.savingText]}>
                {isSaving ? '儲存中...' : '儲存'}
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
            <Text style={styles.sectionTitle}>基本資料</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>名稱</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="輸入你的名稱"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>電郵</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="輸入你的電郵"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>性別</Text>
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
            <Text style={styles.sectionTitle}>身體數據</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>身高 (cm)</Text>
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
                <Text style={styles.label}>體重 (kg)</Text>
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
            <Text style={styles.sectionTitle}>健康目標</Text>
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
            <Text style={styles.sectionTitle}>活動水平</Text>
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
