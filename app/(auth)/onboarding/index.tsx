/**
 * OnboardingScreen - Main orchestration component for user onboarding flow
 *
 * This component manages the multi-step onboarding wizard, coordinating
 * between step components and handling navigation/validation/completion.
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../../../constants/colors';
import { useUserStore, calculateAge } from '../../../stores/userStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { signOut } from '../../../services/auth';

// Import from components/onboarding (no longer in app/ directory)
import {
  styles,
  useOnboardingState,
  getGenderOptions,
  getActivityLevels,
  getPrimaryGoals,
  getHealthGoals,
  getConditions,
  getDietaryPrefs,
  BasicsStep,
  MetricsStep,
  GoalsStep,
  ConditionsStep,
  MedicationsStep,
  DietaryStep,
  SummaryStep,
  STEPS,
} from '../../../components/onboarding';
import type { Step } from '../../../components/onboarding';

export default function OnboardingScreen() {
  const { t, language } = useTranslation();
  const [step, setStep] = useState<Step>('basics');
  const state = useOnboardingState();
  const { updateProfile, calculateDailyTargets } = useUserStore();

  // Get translated options
  const genderOptions = getGenderOptions(t);
  const activityLevelOptions = getActivityLevels(t);
  const primaryGoalOptions = getPrimaryGoals(t);
  const healthGoalOptions = getHealthGoals(t);
  const conditionOptions = getConditions(t);
  const dietaryPrefOptions = getDietaryPrefs(t);

  const validateStep = (): boolean => {
    switch (step) {
      case 'basics':
        if (!state.name) {
          Alert.alert(t('common.error'), t('onboarding.validation.enterName'));
          return false;
        }
        return true;
      case 'metrics':
        if (!state.height || !state.weight) {
          Alert.alert(t('common.error'), t('onboarding.validation.enterHeightWeight'));
          return false;
        }
        return true;
      case 'goals':
        if (!state.primaryGoal) {
          Alert.alert(t('common.error'), t('onboarding.validation.selectGoal'));
          return false;
        }
        return true;
      case 'conditions':
        if (state.conditions.length === 0) {
          Alert.alert(t('common.error'), t('onboarding.validation.selectConditions'));
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleComplete = async () => {
    if (!state.primaryGoal) return;

    state.setIsLoading(true);

    const heightNum = parseFloat(state.height);
    const weightNum = parseFloat(state.weight);
    const age = calculateAge(state.dateOfBirth.toISOString().split('T')[0]);

    const dailyTargets = calculateDailyTargets({
      height: heightNum,
      weight: weightNum,
      age,
      gender: state.gender || 'prefer_not_to_say',
      activityLevel: state.activityLevel,
      goal: state.primaryGoal,
      healthGoals: state.healthGoals,
      conditions: state.conditions,
    });

    const success = await updateProfile({
      name: state.name,
      gender: state.gender || 'prefer_not_to_say',
      date_of_birth: state.dateOfBirth.toISOString().split('T')[0],
      height_cm: heightNum,
      weight_kg: weightNum,
      activity_level: state.activityLevel,
      goal: state.primaryGoal,
      health_goals: state.healthGoals,
      medical_conditions: state.conditions,
      medications: state.medications,
      supplements: state.supplements,
      dietary_preferences: state.dietaryPrefs,
      allergies: state.allergies,
      daily_targets: dailyTargets,
      onboarding_completed: true,
    });

    state.setIsLoading(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert(t('common.error'), t('onboarding.validation.saveFailed'));
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };

  const handleBack = async () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    } else {
      // On basics step, sign out and go back to login
      // This clears the session so user can login with a different method
      await signOut();
      router.replace('/(auth)/login');
    }
  };

  const getStepNumber = () => STEPS.indexOf(step) + 1;
  const totalSteps = STEPS.length;

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <Animated.View entering={FadeIn} style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.stepText}>
            {t('common.step')} {getStepNumber()} / {totalSteps}
          </Text>
          <Text style={styles.progressPercentage}>{Math.round((getStepNumber() / totalSteps) * 100)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, { width: `${(getStepNumber() / totalSteps) * 100}%` }]} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'basics' && (
          <BasicsStep
            name={state.name}
            setName={state.setName}
            gender={state.gender}
            setGender={state.setGender}
            dateOfBirth={state.dateOfBirth}
            setDateOfBirth={state.setDateOfBirth}
            showDatePicker={state.showDatePicker}
            setShowDatePicker={state.setShowDatePicker}
            t={t}
            language={language}
            genders={genderOptions}
          />
        )}
        {step === 'metrics' && (
          <MetricsStep
            height={state.height}
            setHeight={state.setHeight}
            weight={state.weight}
            setWeight={state.setWeight}
            activityLevel={state.activityLevel}
            setActivityLevel={state.setActivityLevel}
            t={t}
            activityLevels={activityLevelOptions}
          />
        )}
        {step === 'goals' && (
          <GoalsStep
            primaryGoal={state.primaryGoal}
            setPrimaryGoal={state.setPrimaryGoal}
            healthGoals={state.healthGoals}
            handleHealthGoalToggle={state.handleHealthGoalToggle}
            t={t}
            primaryGoals={primaryGoalOptions}
            healthGoalOptions={healthGoalOptions}
          />
        )}
        {step === 'conditions' && (
          <ConditionsStep
            conditions={state.conditions}
            handleConditionToggle={state.handleConditionToggle}
            t={t}
            conditionOptions={conditionOptions}
          />
        )}
        {step === 'medications' && (
          <MedicationsStep
            medications={state.medications}
            supplements={state.supplements}
            newMedName={state.newMedName}
            setNewMedName={state.setNewMedName}
            newSuppName={state.newSuppName}
            setNewSuppName={state.setNewSuppName}
            addMedication={state.addMedication}
            removeMedication={state.removeMedication}
            addSupplement={state.addSupplement}
            removeSupplement={state.removeSupplement}
            t={t}
          />
        )}
        {step === 'dietary' && (
          <DietaryStep
            dietaryPrefs={state.dietaryPrefs}
            handleDietaryPrefToggle={state.handleDietaryPrefToggle}
            allergies={state.allergies}
            newAllergy={state.newAllergy}
            setNewAllergy={state.setNewAllergy}
            addAllergy={state.addAllergy}
            removeAllergy={state.removeAllergy}
            t={t}
            dietaryPrefOptions={dietaryPrefOptions}
          />
        )}
        {step === 'summary' && (
          <SummaryStep
            name={state.name}
            gender={state.gender}
            dateOfBirth={state.dateOfBirth}
            height={state.height}
            weight={state.weight}
            activityLevel={state.activityLevel}
            primaryGoal={state.primaryGoal}
            healthGoals={state.healthGoals}
            conditions={state.conditions}
            medications={state.medications}
            supplements={state.supplements}
            dietaryPrefs={state.dietaryPrefs}
            allergies={state.allergies}
            calculateDailyTargets={calculateDailyTargets}
            t={t}
            genders={genderOptions}
            activityLevels={activityLevelOptions}
            primaryGoals={primaryGoalOptions}
            healthGoalOptions={healthGoalOptions}
            conditionOptions={conditionOptions}
            dietaryPrefOptions={dietaryPrefOptions}
          />
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, state.isLoading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={state.isLoading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            {state.isLoading ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {step === 'summary' ? t('onboarding.summary.startUsing') : t('common.continue')}
                </Text>
                <Ionicons name={step === 'summary' ? 'checkmark' : 'arrow-forward'} size={20} color={COLORS.textInverse} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
