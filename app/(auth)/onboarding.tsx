import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore, calculateAge } from '../../stores/userStore';
import { useTranslation } from '../../hooks/useTranslation';
import {
  UserGoal,
  HealthGoal,
  MedicalCondition,
  Gender,
  ActivityLevel,
  DietaryPreference,
  Medication,
  Supplement,
  DailyTargets,
} from '../../types';
import {
  saveOnboardingProgress,
  getOnboardingProgress,
  clearOnboardingProgress,
  OnboardingProgress,
} from '../../services/database/repositories/settingsRepository';
import { getSupabaseClient } from '../../services/supabase';

// Type for the calculateDailyTargets function
interface TargetCalculationParams {
  height: number;
  weight: number;
  age?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  goal: UserGoal;
  healthGoals?: HealthGoal[];
  conditions: MedicalCondition[];
}

type CalculateDailyTargetsFunction = (params: TargetCalculationParams) => DailyTargets;
import { Card } from '../../components/ui';

type Step = 'basics' | 'metrics' | 'goals' | 'conditions' | 'medications' | 'dietary' | 'summary';

const STEPS: Step[] = ['basics', 'metrics', 'goals', 'conditions', 'medications', 'dietary', 'summary'];

// Helper function to get gender options with translations
function getGenderOptions(t: (key: string) => string): { value: Gender; label: string; icon: keyof typeof Ionicons.glyphMap }[] {
  return [
    { value: 'male', label: t('onboarding.gender.male'), icon: 'male' },
    { value: 'female', label: t('onboarding.gender.female'), icon: 'female' },
    { value: 'other', label: t('onboarding.gender.other'), icon: 'person' },
    { value: 'prefer_not_to_say', label: t('onboarding.gender.preferNotToSay'), icon: 'help-circle' },
  ];
}

// Helper function to get activity levels with translations
function getActivityLevels(t: (key: string) => string): { value: ActivityLevel; label: string; desc: string }[] {
  return [
    { value: 'sedentary', label: t('onboarding.activity.sedentary'), desc: t('onboarding.activity.sedentaryDesc') },
    { value: 'light', label: t('onboarding.activity.light'), desc: t('onboarding.activity.lightDesc') },
    { value: 'moderate', label: t('onboarding.activity.moderate'), desc: t('onboarding.activity.moderateDesc') },
    { value: 'active', label: t('onboarding.activity.active'), desc: t('onboarding.activity.activeDesc') },
    { value: 'very_active', label: t('onboarding.activity.veryActive'), desc: t('onboarding.activity.veryActiveDesc') },
  ];
}

// Helper function to get primary goals with translations
function getPrimaryGoals(t: (key: string) => string): { value: UserGoal; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string; color: string }[] {
  return [
    { value: 'lose_weight', label: t('onboarding.primaryGoals.loseWeight'), icon: 'trending-down', desc: t('onboarding.primaryGoals.loseWeightDesc'), color: COLORS.calories },
    { value: 'gain_weight', label: t('onboarding.primaryGoals.gainWeight'), icon: 'trending-up', desc: t('onboarding.primaryGoals.gainWeightDesc'), color: COLORS.carbs },
    { value: 'maintain', label: t('onboarding.primaryGoals.maintain'), icon: 'remove', desc: t('onboarding.primaryGoals.maintainDesc'), color: COLORS.fiber },
    { value: 'build_muscle', label: t('onboarding.primaryGoals.buildMuscle'), icon: 'barbell', desc: t('onboarding.primaryGoals.buildMuscleDesc'), color: COLORS.protein },
  ];
}

// Helper function to get health goals with translations
function getHealthGoals(t: (key: string) => string): { value: HealthGoal; label: string; icon: keyof typeof Ionicons.glyphMap }[] {
  return [
    { value: 'healthy_balanced_eating', label: t('onboarding.healthGoals.healthyBalancedEating'), icon: 'nutrition' },
    { value: 'weight_loss', label: t('onboarding.healthGoals.weightLoss'), icon: 'trending-down' },
    { value: 'weight_gain', label: t('onboarding.healthGoals.weightGain'), icon: 'trending-up' },
    { value: 'healthy_bowels', label: t('onboarding.healthGoals.healthyBowels'), icon: 'fitness' },
    { value: 'muscle_gain', label: t('onboarding.healthGoals.muscleGain'), icon: 'barbell' },
    { value: 'improve_hydration', label: t('onboarding.healthGoals.improveHydration'), icon: 'water' },
    { value: 'blood_sugar_control', label: t('onboarding.healthGoals.bloodSugarControl'), icon: 'pulse' },
    { value: 'fix_micros', label: t('onboarding.healthGoals.fixMicros'), icon: 'leaf' },
    { value: 'improve_sleep', label: t('onboarding.healthGoals.improveSleep'), icon: 'moon' },
    { value: 'improve_breathing', label: t('onboarding.healthGoals.improveBreathing'), icon: 'cloud' },
    { value: 'reduce_alcohol', label: t('onboarding.healthGoals.reduceAlcohol'), icon: 'beer' },
    { value: 'reduce_smoking', label: t('onboarding.healthGoals.reduceSmoking'), icon: 'ban' },
    { value: 'achieve_10k_steps', label: t('onboarding.healthGoals.achieve10kSteps'), icon: 'footsteps' },
    { value: 'improve_mental_health', label: t('onboarding.healthGoals.improveMentalHealth'), icon: 'happy' },
  ];
}

// Helper function to get conditions with translations
function getConditions(t: (key: string) => string): { value: MedicalCondition; label: string; icon: keyof typeof Ionicons.glyphMap }[] {
  return [
    { value: 'none', label: t('onboarding.conditions.none'), icon: 'checkmark-circle' },
    { value: 't1dm', label: t('onboarding.conditions.t1dm'), icon: 'water' },
    { value: 't2dm', label: t('onboarding.conditions.t2dm'), icon: 'water' },
    { value: 'hypertension', label: t('onboarding.conditions.hypertension'), icon: 'pulse' },
    { value: 'coronary_heart_disease', label: t('onboarding.conditions.coronaryHeartDisease'), icon: 'heart' },
    { value: 'high_cholesterol', label: t('onboarding.conditions.highCholesterol'), icon: 'analytics' },
    { value: 'kidney_disease', label: t('onboarding.conditions.kidneyDisease'), icon: 'medical' },
    { value: 'copd', label: t('onboarding.conditions.copd'), icon: 'cloud' },
    { value: 'asthma', label: t('onboarding.conditions.asthma'), icon: 'cloud-outline' },
    { value: 'cancer', label: t('onboarding.conditions.cancer'), icon: 'ribbon' },
    { value: 'celiac_disease', label: t('onboarding.conditions.celiacDisease'), icon: 'nutrition' },
    { value: 'lactose_intolerance', label: t('onboarding.conditions.lactoseIntolerance'), icon: 'cafe' },
    { value: 'pcos', label: t('onboarding.conditions.pcos'), icon: 'female' },
    { value: 'thyroid_disorders', label: t('onboarding.conditions.thyroidDisorders'), icon: 'body' },
    { value: 'ibs', label: t('onboarding.conditions.ibs'), icon: 'fitness' },
    { value: 'crohns_disease', label: t('onboarding.conditions.crohnsDisease'), icon: 'fitness' },
    { value: 'ulcerative_colitis', label: t('onboarding.conditions.ulcerativeColitis'), icon: 'fitness' },
  ];
}

// Helper function to get dietary preferences with translations
function getDietaryPrefs(t: (key: string) => string): { value: DietaryPreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] {
  return [
    { value: 'vegetarian', label: t('onboarding.dietaryPrefs.vegetarian'), icon: 'leaf' },
    { value: 'vegan', label: t('onboarding.dietaryPrefs.vegan'), icon: 'flower' },
    { value: 'pescatarian', label: t('onboarding.dietaryPrefs.pescatarian'), icon: 'fish' },
    { value: 'halal', label: t('onboarding.dietaryPrefs.halal'), icon: 'moon' },
    { value: 'kosher', label: t('onboarding.dietaryPrefs.kosher'), icon: 'star' },
    { value: 'gluten_free', label: t('onboarding.dietaryPrefs.glutenFree'), icon: 'nutrition' },
    { value: 'dairy_free', label: t('onboarding.dietaryPrefs.dairyFree'), icon: 'cafe-outline' },
    { value: 'nut_free', label: t('onboarding.dietaryPrefs.nutFree'), icon: 'warning' },
    { value: 'low_sodium', label: t('onboarding.dietaryPrefs.lowSodium'), icon: 'water-outline' },
    { value: 'low_carb', label: t('onboarding.dietaryPrefs.lowCarb'), icon: 'cellular' },
    { value: 'keto', label: t('onboarding.dietaryPrefs.keto'), icon: 'flame' },
  ];
}

export default function OnboardingScreen() {
  const { t, language } = useTranslation();
  const [step, setStep] = useState<Step>('basics');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track current user ID for progress persistence
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Basic info
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(1990, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Metrics
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  
  // Goals
  const [primaryGoal, setPrimaryGoal] = useState<UserGoal | null>(null);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  
  // Medical
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  
  // Medications & Supplements
  const [medications, setMedications] = useState<Medication[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newSuppName, setNewSuppName] = useState('');
  
  // Dietary
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const { updateProfile, calculateDailyTargets, oauthMetadata, setOAuthMetadata } = useUserStore();

  // Get current user ID and load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setIsInitialized(true);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        setCurrentUserId(userId);
        
        // Load saved progress
        const savedProgress = getOnboardingProgress(userId);
        if (savedProgress) {
          console.log('[Onboarding] Restoring saved progress:', savedProgress);
          
          // Restore step
          if (savedProgress.currentStep !== undefined) {
            setStep(STEPS[savedProgress.currentStep] || 'basics');
          }
          
          // Restore basics
          if (savedProgress.name) setName(savedProgress.name);
          if (savedProgress.gender !== undefined) setGender(savedProgress.gender);
          if (savedProgress.dateOfBirth) {
            setDateOfBirth(new Date(savedProgress.dateOfBirth));
          }
          
          // Restore metrics
          if (savedProgress.height) setHeight(savedProgress.height);
          if (savedProgress.weight) setWeight(savedProgress.weight);
          if (savedProgress.activityLevel) setActivityLevel(savedProgress.activityLevel);
          
          // Restore goals
          if (savedProgress.primaryGoal !== undefined) setPrimaryGoal(savedProgress.primaryGoal);
          if (savedProgress.healthGoals) setHealthGoals(savedProgress.healthGoals);
          
          // Restore conditions
          if (savedProgress.conditions) setConditions(savedProgress.conditions);
          
          // Restore medications & supplements
          if (savedProgress.medications) setMedications(savedProgress.medications);
          if (savedProgress.supplements) setSupplements(savedProgress.supplements);
          
          // Restore dietary
          if (savedProgress.dietaryPrefs) setDietaryPrefs(savedProgress.dietaryPrefs);
          if (savedProgress.allergies) setAllergies(savedProgress.allergies);
        }
      }
      
      setIsInitialized(true);
    };

    loadSavedProgress();
  }, []);

  // Save progress whenever form data changes (debounced via step change)
  const saveProgress = useCallback((currentStepIndex: number) => {
    if (!currentUserId || !isInitialized) return;

    const progress: OnboardingProgress = {
      currentStep: currentStepIndex,
      userId: currentUserId,
      lastUpdated: new Date().toISOString(),
      
      // Basics
      name,
      gender,
      dateOfBirth: dateOfBirth.toISOString(),
      
      // Metrics
      height,
      weight,
      activityLevel,
      
      // Goals
      primaryGoal,
      healthGoals,
      
      // Conditions
      conditions,
      
      // Medications
      medications,
      supplements,
      
      // Dietary
      dietaryPrefs,
      allergies,
    };

    console.log('[Onboarding] Saving progress at step:', currentStepIndex);
    saveOnboardingProgress(progress);
  }, [
    currentUserId, isInitialized, name, gender, dateOfBirth, height, weight, 
    activityLevel, primaryGoal, healthGoals, conditions, medications, 
    supplements, dietaryPrefs, allergies
  ]);

  // Pre-fill form with OAuth metadata (from Google/Apple login)
  // Only apply if no saved progress was loaded
  useEffect(() => {
    if (oauthMetadata && isInitialized) {
      console.log('[Onboarding] Pre-filling with OAuth metadata:', oauthMetadata);
      
      // Pre-fill name if available and not already set from saved progress
      if (oauthMetadata.name && !name) {
        setName(oauthMetadata.name);
      }
    }
  }, [oauthMetadata, isInitialized]);

  // Clear OAuth metadata when leaving onboarding
  useEffect(() => {
    return () => {
      // Clear OAuth metadata when component unmounts (onboarding completed)
      setOAuthMetadata(null);
    };
  }, [setOAuthMetadata]);

  // Get translated options
  const GENDERS = getGenderOptions(t);
  const ACTIVITY_LEVELS = getActivityLevels(t);
  const PRIMARY_GOALS = getPrimaryGoals(t);
  const HEALTH_GOALS = getHealthGoals(t);
  const CONDITIONS = getConditions(t);
  const DIETARY_PREFS = getDietaryPrefs(t);

  const handleHealthGoalToggle = (goal: HealthGoal) => {
    if (healthGoals.includes(goal)) {
      setHealthGoals(healthGoals.filter((g) => g !== goal));
    } else {
      setHealthGoals([...healthGoals, goal]);
    }
  };

  const handleConditionToggle = (condition: MedicalCondition) => {
    if (condition === 'none') {
      setConditions(['none']);
    } else {
      const filtered = conditions.filter((c) => c !== 'none');
      if (filtered.includes(condition)) {
        setConditions(filtered.filter((c) => c !== condition));
      } else {
        setConditions([...filtered, condition]);
      }
    }
  };

  const handleDietaryPrefToggle = (pref: DietaryPreference) => {
    if (dietaryPrefs.includes(pref)) {
      setDietaryPrefs(dietaryPrefs.filter((p) => p !== pref));
    } else {
      setDietaryPrefs([...dietaryPrefs, pref]);
    }
  };

  const addMedication = () => {
    if (newMedName.trim()) {
      setMedications([
        ...medications,
        {
          id: `med-${Date.now()}`,
          name: newMedName.trim(),
          dosage: '',
          frequency: '',
          time_of_day: [],
        },
      ]);
      setNewMedName('');
    }
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const addSupplement = () => {
    if (newSuppName.trim()) {
      setSupplements([
        ...supplements,
        {
          id: `supp-${Date.now()}`,
          name: newSuppName.trim(),
          dosage: '',
          frequency: '',
        },
      ]);
      setNewSuppName('');
    }
  };

  const removeSupplement = (id: string) => {
    setSupplements(supplements.filter((s) => s.id !== id));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 'basics':
        if (!name) {
          Alert.alert(t('common.error'), t('onboarding.validation.enterName'));
          return false;
        }
        return true;
      case 'metrics':
        if (!height || !weight) {
          Alert.alert(t('common.error'), t('onboarding.validation.enterHeightWeight'));
          return false;
        }
        return true;
      case 'goals':
        if (!primaryGoal) {
          Alert.alert(t('common.error'), t('onboarding.validation.selectGoal'));
          return false;
        }
        return true;
      case 'conditions':
        if (conditions.length === 0) {
          Alert.alert(t('common.error'), t('onboarding.validation.selectConditions'));
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const currentIndex = STEPS.indexOf(step);
    
    // Save progress before moving to next step
    saveProgress(currentIndex);
    
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(step);
    
    // Save progress before going back
    saveProgress(currentIndex);
    
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    } else {
      // On first step, navigate to login screen to allow selecting another login method
      // Use replace instead of back() because login uses replace() to navigate here
      router.replace('/(auth)/login');
    }
  };

  const handleComplete = async () => {
    if (!primaryGoal) return;

    setIsLoading(true);

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const age = calculateAge(dateOfBirth.toISOString().split('T')[0]);

    const dailyTargets = calculateDailyTargets({
      height: heightNum,
      weight: weightNum,
      age,
      gender: gender || 'prefer_not_to_say',
      activityLevel,
      goal: primaryGoal,
      healthGoals,
      conditions,
    });

    const success = await updateProfile({
      name,
      gender: gender || 'prefer_not_to_say',
      date_of_birth: dateOfBirth.toISOString().split('T')[0],
      height_cm: heightNum,
      weight_kg: weightNum,
      activity_level: activityLevel,
      goal: primaryGoal,
      health_goals: healthGoals,
      medical_conditions: conditions,
      medications,
      supplements,
      dietary_preferences: dietaryPrefs,
      allergies,
      daily_targets: dailyTargets,
      onboarding_completed: true, // Mark onboarding as complete
    });

    setIsLoading(false);

    if (success) {
      // Clear saved onboarding progress after successful completion
      if (currentUserId) {
        console.log('[Onboarding] Clearing saved progress after completion');
        clearOnboardingProgress(currentUserId);
      }
      router.replace('/(tabs)');
    } else {
      Alert.alert(t('common.error'), t('onboarding.validation.saveFailed'));
    }
  };

  const getStepNumber = () => STEPS.indexOf(step) + 1;
  const totalSteps = STEPS.length;

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <Animated.View entering={FadeIn} style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.stepText}>{t('common.step')} {getStepNumber()} / {totalSteps}</Text>
          <Text style={styles.progressPercentage}>{Math.round((getStepNumber() / totalSteps) * 100)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${(getStepNumber() / totalSteps) * 100}%` },
            ]}
          />
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
            name={name}
            setName={setName}
            gender={gender}
            setGender={setGender}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            t={t}
            language={language}
            genders={GENDERS}
          />
        )}
        {step === 'metrics' && (
          <MetricsStep
            height={height}
            setHeight={setHeight}
            weight={weight}
            setWeight={setWeight}
            activityLevel={activityLevel}
            setActivityLevel={setActivityLevel}
            t={t}
            activityLevels={ACTIVITY_LEVELS}
          />
        )}
        {step === 'goals' && (
          <GoalsStep
            primaryGoal={primaryGoal}
            setPrimaryGoal={setPrimaryGoal}
            healthGoals={healthGoals}
            handleHealthGoalToggle={handleHealthGoalToggle}
            t={t}
            primaryGoals={PRIMARY_GOALS}
            healthGoalOptions={HEALTH_GOALS}
          />
        )}
        {step === 'conditions' && (
          <ConditionsStep
            conditions={conditions}
            handleConditionToggle={handleConditionToggle}
            t={t}
            conditionOptions={CONDITIONS}
          />
        )}
        {step === 'medications' && (
          <MedicationsStep
            medications={medications}
            supplements={supplements}
            newMedName={newMedName}
            setNewMedName={setNewMedName}
            newSuppName={newSuppName}
            setNewSuppName={setNewSuppName}
            addMedication={addMedication}
            removeMedication={removeMedication}
            addSupplement={addSupplement}
            removeSupplement={removeSupplement}
            t={t}
          />
        )}
        {step === 'dietary' && (
          <DietaryStep
            dietaryPrefs={dietaryPrefs}
            handleDietaryPrefToggle={handleDietaryPrefToggle}
            allergies={allergies}
            newAllergy={newAllergy}
            setNewAllergy={setNewAllergy}
            addAllergy={addAllergy}
            removeAllergy={removeAllergy}
            t={t}
            dietaryPrefOptions={DIETARY_PREFS}
          />
        )}
        {step === 'summary' && (
          <SummaryStep
            name={name}
            gender={gender}
            dateOfBirth={dateOfBirth}
            height={height}
            weight={weight}
            activityLevel={activityLevel}
            primaryGoal={primaryGoal}
            healthGoals={healthGoals}
            conditions={conditions}
            medications={medications}
            supplements={supplements}
            dietaryPrefs={dietaryPrefs}
            allergies={allergies}
            calculateDailyTargets={calculateDailyTargets}
            t={t}
            genders={GENDERS}
            activityLevels={ACTIVITY_LEVELS}
            primaryGoals={PRIMARY_GOALS}
            healthGoalOptions={HEALTH_GOALS}
            conditionOptions={CONDITIONS}
            dietaryPrefOptions={DIETARY_PREFS}
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
          style={[styles.nextButton, isLoading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {step === 'summary' ? t('onboarding.summary.startUsing') : t('common.continue')}
                </Text>
                <Ionicons
                  name={step === 'summary' ? 'checkmark' : 'arrow-forward'}
                  size={20}
                  color={COLORS.textInverse}
                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// STEP COMPONENTS
// ============================================

function BasicsStep({
  name,
  setName,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  showDatePicker,
  setShowDatePicker,
  t,
  language,
  genders,
}: {
  name: string;
  setName: (v: string) => void;
  gender: Gender | null;
  setGender: (v: Gender) => void;
  dateOfBirth: Date;
  setDateOfBirth: (v: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (v: boolean) => void;
  t: (key: string) => string;
  language: string;
  genders: { value: Gender; label: string; icon: keyof typeof Ionicons.glyphMap }[];
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.stepIconGradient}>
            <Ionicons name="person" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.basics.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.basics.description')}</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('onboarding.basics.name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('onboarding.basics.namePlaceholder')}
            placeholderTextColor={COLORS.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('onboarding.basics.gender')}</Text>
          <View style={styles.genderGrid}>
            {genders.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.genderChip,
                  gender === item.value && styles.genderChipSelected,
                ]}
                onPress={() => setGender(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={gender === item.value ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === item.value && styles.genderTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('onboarding.basics.dateOfBirth')}</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.dateButtonText}>
              {dateOfBirth.toLocaleDateString(language === 'zh-TW' ? 'zh-HK' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.ageText}>
              ({calculateAge(dateOfBirth.toISOString().split('T')[0])} {t('units.years')})
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant="light"
                textColor={COLORS.text}
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  // On Android, close picker after selection
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }
                  if (selectedDate) {
                    setDateOfBirth(selectedDate);
                  }
                }}
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
              />
              {/* iOS needs a confirm button since spinner stays open */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.datePickerConfirmButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerConfirmText}>{t('common.confirm')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}

function MetricsStep({
  height,
  setHeight,
  weight,
  setWeight,
  activityLevel,
  setActivityLevel,
  t,
  activityLevels,
}: {
  height: string;
  setHeight: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  activityLevel: ActivityLevel;
  setActivityLevel: (v: ActivityLevel) => void;
  t: (key: string) => string;
  activityLevels: { value: ActivityLevel; label: string; desc: string }[];
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.carbs, COLORS.accentDark]} style={styles.stepIconGradient}>
            <Ionicons name="body" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.metrics.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.metrics.description')}</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.inputLabel}>{t('onboarding.metrics.height')}</Text>
            <View style={styles.unitInput}>
              <TextInput
                style={[styles.input, styles.unitInputField]}
                placeholder="170"
                placeholderTextColor={COLORS.textTertiary}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>{t('units.cm')}</Text>
            </View>
          </View>

          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.inputLabel}>{t('onboarding.metrics.weight')}</Text>
            <View style={styles.unitInput}>
              <TextInput
                style={[styles.input, styles.unitInputField]}
                placeholder="65"
                placeholderTextColor={COLORS.textTertiary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>{t('units.kg')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('onboarding.metrics.activityLevel')}</Text>
          <View style={styles.activityList}>
            {activityLevels.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.activityItem,
                  activityLevel === item.value && styles.activityItemSelected,
                ]}
                onPress={() => setActivityLevel(item.value)}
                activeOpacity={0.8}
              >
                <View style={styles.activityRadio}>
                  {activityLevel === item.value && (
                    <View style={styles.activityRadioInner} />
                  )}
                </View>
                <View style={styles.activityContent}>
                  <Text
                    style={[
                      styles.activityLabel,
                      activityLevel === item.value && styles.activityLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.activityDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

function GoalsStep({
  primaryGoal,
  setPrimaryGoal,
  healthGoals,
  handleHealthGoalToggle,
  t,
  primaryGoals,
  healthGoalOptions,
}: {
  primaryGoal: UserGoal | null;
  setPrimaryGoal: (v: UserGoal) => void;
  healthGoals: HealthGoal[];
  handleHealthGoalToggle: (g: HealthGoal) => void;
  t: (key: string) => string;
  primaryGoals: { value: UserGoal; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string; color: string }[];
  healthGoalOptions: { value: HealthGoal; label: string; icon: keyof typeof Ionicons.glyphMap }[];
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.calories, COLORS.caloriesBg]} style={styles.stepIconGradient}>
            <Ionicons name="trophy" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.goals.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.goals.description')}</Text>
      </View>

      {/* Primary Goal */}
      <Text style={styles.sectionLabel}>{t('onboarding.goals.primaryGoal')}</Text>
      <View style={styles.goalsGrid}>
        {primaryGoals.map((item, index) => (
          <Animated.View key={item.value} entering={FadeInRight.delay(index * 100)}>
            <TouchableOpacity
              style={[
                styles.goalCard,
                primaryGoal === item.value && styles.goalCardSelected,
                primaryGoal === item.value && { borderColor: item.color },
              ]}
              onPress={() => setPrimaryGoal(item.value)}
              activeOpacity={0.8}
            >
              <View style={[styles.goalIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.goalContent}>
                <Text style={[styles.goalLabel, primaryGoal === item.value && { color: item.color }]}>
                  {item.label}
                </Text>
                <Text style={styles.goalDesc}>{item.desc}</Text>
              </View>
              {primaryGoal === item.value && (
                <View style={[styles.goalCheck, { backgroundColor: item.color }]}>
                  <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Additional Health Goals */}
      <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>{t('onboarding.goals.additionalGoals')}</Text>
      <Card style={styles.conditionsCard}>
        <View style={styles.conditionsGrid}>
          {healthGoalOptions.map((item, index) => (
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 30)}>
              <TouchableOpacity
                style={[
                  styles.conditionChip,
                  healthGoals.includes(item.value) && styles.conditionChipSelected,
                ]}
                onPress={() => handleHealthGoalToggle(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={healthGoals.includes(item.value) ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.conditionText,
                    healthGoals.includes(item.value) && styles.conditionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}

function ConditionsStep({
  conditions,
  handleConditionToggle,
  t,
  conditionOptions,
}: {
  conditions: MedicalCondition[];
  handleConditionToggle: (c: MedicalCondition) => void;
  t: (key: string) => string;
  conditionOptions: { value: MedicalCondition; label: string; icon: keyof typeof Ionicons.glyphMap }[];
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.protein, COLORS.fat]} style={styles.stepIconGradient}>
            <Ionicons name="medical" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.conditions.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.conditions.description')}</Text>
      </View>

      <Card style={styles.conditionsCard}>
        <View style={styles.conditionsGrid}>
          {conditionOptions.map((item, index) => (
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 30)}>
              <TouchableOpacity
                style={[
                  styles.conditionChip,
                  conditions.includes(item.value) && styles.conditionChipSelected,
                ]}
                onPress={() => handleConditionToggle(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={conditions.includes(item.value) ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.conditionText,
                    conditions.includes(item.value) && styles.conditionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}

function MedicationsStep({
  medications,
  supplements,
  newMedName,
  setNewMedName,
  newSuppName,
  setNewSuppName,
  addMedication,
  removeMedication,
  addSupplement,
  removeSupplement,
  t,
}: {
  medications: Medication[];
  supplements: Supplement[];
  newMedName: string;
  setNewMedName: (v: string) => void;
  newSuppName: string;
  setNewSuppName: (v: string) => void;
  addMedication: () => void;
  removeMedication: (id: string) => void;
  addSupplement: () => void;
  removeSupplement: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.fiber, COLORS.fiberBg]} style={styles.stepIconGradient}>
            <Ionicons name="medkit" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.medications.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.medications.description')}</Text>
      </View>

      {/* Medications */}
      <Card style={styles.formCard}>
        <Text style={styles.cardTitle}>{t('onboarding.medications.currentMeds')}</Text>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, styles.addItemInput]}
            placeholder={t('onboarding.medications.medNamePlaceholder')}
            placeholderTextColor={COLORS.textTertiary}
            value={newMedName}
            onChangeText={setNewMedName}
            onSubmitEditing={addMedication}
          />
          <TouchableOpacity style={styles.addButton} onPress={addMedication}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        {medications.length > 0 && (
          <View style={styles.itemsList}>
            {medications.map((med) => (
              <View key={med.id} style={styles.listItem}>
                <Ionicons name="medical" size={16} color={COLORS.primary} />
                <Text style={styles.listItemText}>{med.name}</Text>
                <TouchableOpacity onPress={() => removeMedication(med.id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Supplements */}
      <Card style={[styles.formCard, styles.marginTopMd]}>
        <Text style={styles.cardTitle}>{t('onboarding.medications.supplements')}</Text>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, styles.addItemInput]}
            placeholder={t('onboarding.medications.suppNamePlaceholder')}
            placeholderTextColor={COLORS.textTertiary}
            value={newSuppName}
            onChangeText={setNewSuppName}
            onSubmitEditing={addSupplement}
          />
          <TouchableOpacity style={styles.addButton} onPress={addSupplement}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        {supplements.length > 0 && (
          <View style={styles.itemsList}>
            {supplements.map((supp) => (
              <View key={supp.id} style={styles.listItem}>
                <Ionicons name="leaf" size={16} color={COLORS.fiber} />
                <Text style={styles.listItemText}>{supp.name}</Text>
                <TouchableOpacity onPress={() => removeSupplement(supp.id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Animated.View>
  );
}

function DietaryStep({
  dietaryPrefs,
  handleDietaryPrefToggle,
  allergies,
  newAllergy,
  setNewAllergy,
  addAllergy,
  removeAllergy,
  t,
  dietaryPrefOptions,
}: {
  dietaryPrefs: DietaryPreference[];
  handleDietaryPrefToggle: (p: DietaryPreference) => void;
  allergies: string[];
  newAllergy: string;
  setNewAllergy: (v: string) => void;
  addAllergy: () => void;
  removeAllergy: (a: string) => void;
  t: (key: string) => string;
  dietaryPrefOptions: { value: DietaryPreference; label: string; icon: keyof typeof Ionicons.glyphMap }[];
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.carbs, COLORS.carbsBg]} style={styles.stepIconGradient}>
            <Ionicons name="restaurant" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.dietary.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.dietary.description')}</Text>
      </View>

      {/* Dietary Preferences */}
      <Text style={styles.sectionLabel}>{t('onboarding.dietary.dietaryWays')}</Text>
      <Card style={styles.conditionsCard}>
        <View style={styles.conditionsGrid}>
          {dietaryPrefOptions.map((item, index) => (
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 30)}>
              <TouchableOpacity
                style={[
                  styles.conditionChip,
                  dietaryPrefs.includes(item.value) && styles.conditionChipSelected,
                ]}
                onPress={() => handleDietaryPrefToggle(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={dietaryPrefs.includes(item.value) ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.conditionText,
                    dietaryPrefs.includes(item.value) && styles.conditionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Card>

      {/* Allergies */}
      <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>{t('onboarding.dietary.allergies')}</Text>
      <Card style={styles.formCard}>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, styles.addItemInput]}
            placeholder={t('onboarding.dietary.allergyPlaceholder')}
            placeholderTextColor={COLORS.textTertiary}
            value={newAllergy}
            onChangeText={setNewAllergy}
            onSubmitEditing={addAllergy}
          />
          <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        {allergies.length > 0 && (
          <View style={styles.allergiesList}>
            {allergies.map((allergy) => (
              <View key={allergy} style={styles.allergyChip}>
                <Text style={styles.allergyText}>{allergy}</Text>
                <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                  <Ionicons name="close" size={16} color={COLORS.textInverse} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Animated.View>
  );
}

function SummaryStep({
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
}: {
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
  t: (key: string) => string;
  genders: { value: Gender; label: string; icon: keyof typeof Ionicons.glyphMap }[];
  activityLevels: { value: ActivityLevel; label: string; desc: string }[];
  primaryGoals: { value: UserGoal; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string; color: string }[];
  healthGoalOptions: { value: HealthGoal; label: string; icon: keyof typeof Ionicons.glyphMap }[];
  conditionOptions: { value: MedicalCondition; label: string; icon: keyof typeof Ionicons.glyphMap }[];
  dietaryPrefOptions: { value: DietaryPreference; label: string; icon: keyof typeof Ionicons.glyphMap }[];
}) {
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

  const getGenderLabel = (g: Gender | null) => {
    return genders.find((item) => item.value === g)?.label || '-';
  };

  const getActivityLabel = (a: ActivityLevel) => {
    return activityLevels.find((item) => item.value === a)?.label || '-';
  };

  const getGoalLabel = (g: UserGoal | null) => {
    return primaryGoals.find((item) => item.value === g)?.label || '-';
  };

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
              {getGenderLabel(gender)} · {age}{t('units.years')} · {height}{t('units.cm')} · {weight}{t('units.kg')}
            </Text>
            <Text style={styles.summaryMeta}>
              {getActivityLabel(activityLevel)} · {getGoalLabel(primaryGoal)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Additional Info */}
      {(healthGoals.length > 0 || conditions.filter(c => c !== 'none').length > 0 || medications.length > 0 || supplements.length > 0 || dietaryPrefs.length > 0 || allergies.length > 0) && (
        <Card style={[styles.summaryCard, styles.marginTopMd]}>
          {healthGoals.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.healthGoalsTitle')}</Text>
              <Text style={styles.summarySectionText}>
                {healthGoals.map(g => healthGoalOptions.find(h => h.value === g)?.label).join('、')}
              </Text>
            </View>
          )}
          {conditions.filter(c => c !== 'none').length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.conditionsTitle')}</Text>
              <Text style={styles.summarySectionText}>
                {conditions.filter(c => c !== 'none').map(c => conditionOptions.find(cond => cond.value === c)?.label).join('、')}
              </Text>
            </View>
          )}
          {medications.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.medicationsTitle')}</Text>
              <Text style={styles.summarySectionText}>
                {medications.map(m => m.name).join('、')}
              </Text>
            </View>
          )}
          {supplements.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.supplementsTitle')}</Text>
              <Text style={styles.summarySectionText}>
                {supplements.map(s => s.name).join('、')}
              </Text>
            </View>
          )}
          {dietaryPrefs.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.dietaryPrefsTitle')}</Text>
              <Text style={styles.summarySectionText}>
                {dietaryPrefs.map(p => dietaryPrefOptions.find(pref => pref.value === p)?.label).join('、')}
              </Text>
            </View>
          )}
          {allergies.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>{t('onboarding.summary.allergiesTitle')}</Text>
              <Text style={styles.summarySectionText}>{allergies.join('、')}</Text>
            </View>
          )}
        </Card>
      )}

      {/* Targets Card */}
      {targets && (
        <Card style={[styles.targetsCard, styles.marginTopMd]}>
          <Text style={styles.targetsTitle}>{t('onboarding.summary.dailyTargets')}</Text>
          <View style={styles.targetsList}>
            <TargetRow label={t('onboarding.nutrients.calories')} value={`${targets.calories.min} - ${targets.calories.max}`} unit={t('units.kcal')} color={COLORS.calories} icon="flame" />
            <TargetRow label={t('onboarding.nutrients.protein')} value={`${targets.protein.min} - ${targets.protein.max}`} unit={t('units.g')} color={COLORS.protein} icon="fish" />
            <TargetRow label={t('onboarding.nutrients.carbs')} value={`${targets.carbs.min} - ${targets.carbs.max}`} unit={t('units.g')} color={COLORS.carbs} icon="nutrition" />
            <TargetRow label={t('onboarding.nutrients.fat')} value={`${targets.fat.min} - ${targets.fat.max}`} unit={t('units.g')} color={COLORS.fat} icon="water" />
            <TargetRow label={t('onboarding.nutrients.fiber')} value={`${targets.fiber.min} - ${targets.fiber.max}`} unit={t('units.g')} color={COLORS.fiber} icon="leaf" />
            <TargetRow label={t('onboarding.nutrients.water')} value={`${Math.round(targets.water / 1000 * 10) / 10}`} unit={t('units.l')} color={COLORS.sodium} icon="water-outline" />
          </View>
        </Card>
      )}
    </Animated.View>
  );
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

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Margin helpers
  marginTopMd: {
    marginTop: SPACING.md,
  },
  marginTopLg: {
    marginTop: SPACING.lg,
  },

  // Progress Header
  progressHeader: {
    backgroundColor: COLORS.surface,
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
  progressPercentage: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING['3xl'],
  },

  // Step Header
  stepHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepIconContainer: {
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  stepIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Section Label
  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },

  // Form Card
  formCard: {
    padding: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    height: 52,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  unitInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingRight: SPACING.lg,
  },
  unitInputField: {
    flex: 1,
    borderWidth: 0,
  },
  unitText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },

  // Gender Grid
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  genderChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.textSecondary,
  },
  genderTextSelected: {
    color: COLORS.textInverse,
  },

  // Date Button
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  dateButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  ageText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  // Date Picker Container (for iOS spinner)
  datePickerContainer: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  iosDatePicker: {
    height: 200,
    width: '100%',
  },
  datePickerConfirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerConfirmText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },

  // Activity List
  activityList: {
    gap: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  activityItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  activityRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  activityLabelSelected: {
    color: COLORS.primary,
  },
  activityDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Goals
  goalsGrid: {
    gap: SPACING.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  goalCardSelected: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.md,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: 2,
  },
  goalDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  goalCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Conditions
  conditionsCard: {
    padding: SPACING.lg,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  conditionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  conditionText: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.textSecondary,
  },
  conditionTextSelected: {
    color: COLORS.textInverse,
  },

  // Add Item Row
  addItemRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addItemInput: {
    flex: 1,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsList: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  listItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },

  // Allergies
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error,
    gap: SPACING.xs,
  },
  allergyText: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.textInverse,
  },

  // Summary
  summaryCard: {
    padding: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  summaryAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  summaryMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summarySection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  summarySectionTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  summarySectionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },

  // Targets
  targetsCard: {
    padding: SPACING.lg,
  },
  targetsTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  targetsList: {
    gap: SPACING.md,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  targetLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  targetValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
  },
  targetUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    width: 32,
  },

  // Navigation
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  nextButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.colored(COLORS.primary),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  nextButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
});
