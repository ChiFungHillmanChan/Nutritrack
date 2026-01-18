/**
 * SummaryStep - Shows profile summary and calculated daily targets
 */

import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../../../../constants/colors';
import { calculateAge } from '../../../../stores/userStore';
import { Card } from '../../../../components/ui';
import { styles } from '../styles';
import type {
  Gender,
  ActivityLevel,
  UserGoal,
  HealthGoal,
  MedicalCondition,
  DietaryPreference,
  Medication,
  Supplement,
  GenderOption,
  ActivityLevelOption,
  PrimaryGoalOption,
  HealthGoalOption,
  ConditionOption,
  DietaryPrefOption,
  CalculateDailyTargetsFunction,
  TranslationFunction,
} from '../types';

interface SummaryStepProps {
  name: string;
  gender: Gender | null;
  dateOfBirth: Date;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  primaryGoal: UserGoal | null;
  healthGoals: HealthGoal[];
  conditions: MedicalCondition[];
  medications: Medication[];
  supplements: Supplement[];
  dietaryPrefs: DietaryPreference[];
  allergies: string[];
  calculateDailyTargets: CalculateDailyTargetsFunction;
  t: TranslationFunction;
  genders: GenderOption[];
  activityLevels: ActivityLevelOption[];
  primaryGoals: PrimaryGoalOption[];
  healthGoalOptions: HealthGoalOption[];
  conditionOptions: ConditionOption[];
  dietaryPrefOptions: DietaryPrefOption[];
}

function TargetRow({
  label,
  value,
  unit,
  color,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.targetRow}>
      <View style={[styles.targetIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.targetLabel}>{label}</Text>
      <Text style={[styles.targetValue, { color }]}>{value}</Text>
      <Text style={styles.targetUnit}>{unit}</Text>
    </View>
  );
}

export function SummaryStep({
  name,
  gender,
  dateOfBirth,
  height,
  weight,
  activityLevel,
  primaryGoal,
  healthGoals,
  conditions,
  medications,
  supplements,
  dietaryPrefs,
  allergies,
  calculateDailyTargets,
  t,
  genders,
  activityLevels,
  primaryGoals,
  healthGoalOptions,
  conditionOptions,
  dietaryPrefOptions,
}: SummaryStepProps) {
  const heightNum = parseFloat(height) || 0;
  const weightNum = parseFloat(weight) || 0;
  const age = calculateAge(dateOfBirth.toISOString().split('T')[0]);

  const targets = primaryGoal
    ? calculateDailyTargets({
        height: heightNum,
        weight: weightNum,
        age,
        gender: gender || 'prefer_not_to_say',
        activityLevel,
        goal: primaryGoal,
        healthGoals,
        conditions,
      })
    : null;

  const getGenderLabel = (genderValue: Gender | null) => {
    return genders.find((item) => item.value === genderValue)?.label || '-';
  };

  const getActivityLabel = (activityValue: ActivityLevel) => {
    return activityLevels.find((item) => item.value === activityValue)?.label || '-';
  };

  const getGoalLabel = (goalValue: UserGoal | null) => {
    return primaryGoals.find((item) => item.value === goalValue)?.label || '-';
  };

  const hasAdditionalInfo =
    healthGoals.length > 0 ||
    conditions.filter((c) => c !== 'none').length > 0 ||
    medications.length > 0 ||
    supplements.length > 0 ||
    dietaryPrefs.length > 0 ||
    allergies.length > 0;

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.stepIconGradient}>
            <Ionicons name="sparkles" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.summary.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.summary.description')}</Text>
      </View>

      {/* Profile Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryAvatar}>
            <Text style={styles.summaryAvatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryName}>{name}</Text>
            <Text style={styles.summaryMeta}>
              {getGenderLabel(gender)} · {age}
              {t('units.years')} · {height}
              {t('units.cm')} · {weight}
              {t('units.kg')}
            </Text>
            <Text style={styles.summaryMeta}>
              {getActivityLabel(activityLevel)} · {getGoalLabel(primaryGoal)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Additional Info */}
      {hasAdditionalInfo && (
        <Card style={[styles.summaryCard, styles.marginTopMd]}>
          {healthGoals.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.healthGoalsTitle')}</Text>
              <Text style={styles.summarySectionText}>
                {healthGoals.map((g) => healthGoalOptions.find((h) => h.value === g)?.label).join(', ')}
              </Text>
            </View>
          )}
          {conditions.filter((c) => c !== 'none').length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.conditionsTitle')}</Text>
              <Text style={styles.summarySectionText}>
                {conditions
                  .filter((c) => c !== 'none')
                  .map((c) => conditionOptions.find((cond) => cond.value === c)?.label)
                  .join(', ')}
              </Text>
            </View>
          )}
          {medications.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.medicationsTitle')}</Text>
              <Text style={styles.summarySectionText}>{medications.map((m) => m.name).join(', ')}</Text>
            </View>
          )}
          {supplements.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.supplementsTitle')}</Text>
              <Text style={styles.summarySectionText}>{supplements.map((s) => s.name).join(', ')}</Text>
            </View>
          )}
          {dietaryPrefs.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.dietaryPrefsTitle')}</Text>
              <Text style={styles.summarySectionText}>
                {dietaryPrefs.map((p) => dietaryPrefOptions.find((pref) => pref.value === p)?.label).join(', ')}
              </Text>
            </View>
          )}
          {allergies.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.allergiesTitle')}</Text>
              <Text style={styles.summarySectionText}>{allergies.join(', ')}</Text>
            </View>
          )}
        </Card>
      )}

      {/* Targets Card */}
      {targets && (
        <Card style={[styles.targetsCard, styles.marginTopMd]}>
          <Text style={styles.targetsTitle}>{t('onboarding.summary.dailyTargets')}</Text>
          <View style={styles.targetsList}>
            <TargetRow
              label={t('onboarding.nutrients.calories')}
              value={`${targets.calories.min} - ${targets.calories.max}`}
              unit={t('units.kcal')}
              color={COLORS.calories}
              icon="flame"
            />
            <TargetRow
              label={t('onboarding.nutrients.protein')}
              value={`${targets.protein.min} - ${targets.protein.max}`}
              unit={t('units.g')}
              color={COLORS.protein}
              icon="fish"
            />
            <TargetRow
              label={t('onboarding.nutrients.carbs')}
              value={`${targets.carbs.min} - ${targets.carbs.max}`}
              unit={t('units.g')}
              color={COLORS.carbs}
              icon="nutrition"
            />
            <TargetRow
              label={t('onboarding.nutrients.fat')}
              value={`${targets.fat.min} - ${targets.fat.max}`}
              unit={t('units.g')}
              color={COLORS.fat}
              icon="water"
            />
            <TargetRow
              label={t('onboarding.nutrients.fiber')}
              value={`${targets.fiber.min} - ${targets.fiber.max}`}
              unit={t('units.g')}
              color={COLORS.fiber}
              icon="leaf"
            />
            <TargetRow
              label={t('onboarding.nutrients.water')}
              value={`${Math.round((targets.water / 1000) * 10) / 10}`}
              unit={t('units.l')}
              color={COLORS.sodium}
              icon="water-outline"
            />
          </View>
        </Card>
      )}
    </Animated.View>
  );
}
