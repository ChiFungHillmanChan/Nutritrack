/**
 * Custom hook for managing onboarding form state
 */

import { useState, useCallback } from 'react';
import type {
  OnboardingState,
  OnboardingActions,
  Gender,
  ActivityLevel,
  UserGoal,
  HealthGoal,
  MedicalCondition,
  DietaryPreference,
  Medication,
  Supplement,
} from '../types';

const DEFAULT_STATE: OnboardingState = {
  // Basic info
  name: '',
  gender: null,
  dateOfBirth: new Date(1990, 0, 1),
  showDatePicker: false,

  // Metrics
  height: '',
  weight: '',
  activityLevel: 'moderate',

  // Goals
  primaryGoal: null,
  healthGoals: [],

  // Medical
  conditions: [],

  // Medications & Supplements
  medications: [],
  supplements: [],
  newMedName: '',
  newSuppName: '',

  // Dietary
  dietaryPrefs: [],
  allergies: [],
  newAllergy: '',

  // Loading state
  isLoading: false,
};

/**
 * Initial values that can be passed to pre-fill the form
 * Used when user signs in with Google/Apple to pre-fill name and email
 */
export interface OnboardingInitialValues {
  name?: string;
  email?: string;
  // Note: Google and Apple do NOT provide date_of_birth or gender
}

export function useOnboardingState(initialValues?: OnboardingInitialValues): OnboardingState & OnboardingActions {
  // Create initial state by merging defaults with provided initial values
  // Using a function initializer ensures this only runs once on mount
  const [state, setState] = useState<OnboardingState>(() => ({
    ...DEFAULT_STATE,
    ...(initialValues?.name && { name: initialValues.name }),
  }));

  // Basic setters
  const setName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }));
  }, []);

  const setGender = useCallback((gender: Gender) => {
    setState((prev) => ({ ...prev, gender }));
  }, []);

  const setDateOfBirth = useCallback((dateOfBirth: Date) => {
    setState((prev) => ({ ...prev, dateOfBirth }));
  }, []);

  const setShowDatePicker = useCallback((showDatePicker: boolean) => {
    setState((prev) => ({ ...prev, showDatePicker }));
  }, []);

  // Metrics setters
  const setHeight = useCallback((height: string) => {
    setState((prev) => ({ ...prev, height }));
  }, []);

  const setWeight = useCallback((weight: string) => {
    setState((prev) => ({ ...prev, weight }));
  }, []);

  const setActivityLevel = useCallback((activityLevel: ActivityLevel) => {
    setState((prev) => ({ ...prev, activityLevel }));
  }, []);

  // Goals setters
  const setPrimaryGoal = useCallback((primaryGoal: UserGoal) => {
    setState((prev) => ({ ...prev, primaryGoal }));
  }, []);

  const handleHealthGoalToggle = useCallback((goal: HealthGoal) => {
    setState((prev) => {
      const healthGoals = prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter((g) => g !== goal)
        : [...prev.healthGoals, goal];
      return { ...prev, healthGoals };
    });
  }, []);

  // Medical setters
  const handleConditionToggle = useCallback((condition: MedicalCondition) => {
    setState((prev) => {
      if (condition === 'none') {
        return { ...prev, conditions: ['none'] };
      }
      const filtered = prev.conditions.filter((c) => c !== 'none');
      const conditions = filtered.includes(condition)
        ? filtered.filter((c) => c !== condition)
        : [...filtered, condition];
      return { ...prev, conditions };
    });
  }, []);

  // Medications & Supplements
  const setNewMedName = useCallback((newMedName: string) => {
    setState((prev) => ({ ...prev, newMedName }));
  }, []);

  const setNewSuppName = useCallback((newSuppName: string) => {
    setState((prev) => ({ ...prev, newSuppName }));
  }, []);

  const addMedication = useCallback(() => {
    setState((prev) => {
      if (!prev.newMedName.trim()) return prev;
      const newMed: Medication = {
        id: `med-${Date.now()}`,
        name: prev.newMedName.trim(),
        dosage: '',
        frequency: '',
        time_of_day: [],
      };
      return {
        ...prev,
        medications: [...prev.medications, newMed],
        newMedName: '',
      };
    });
  }, []);

  const removeMedication = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== id),
    }));
  }, []);

  const addSupplement = useCallback(() => {
    setState((prev) => {
      if (!prev.newSuppName.trim()) return prev;
      const newSupp: Supplement = {
        id: `supp-${Date.now()}`,
        name: prev.newSuppName.trim(),
        dosage: '',
        frequency: '',
      };
      return {
        ...prev,
        supplements: [...prev.supplements, newSupp],
        newSuppName: '',
      };
    });
  }, []);

  const removeSupplement = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      supplements: prev.supplements.filter((s) => s.id !== id),
    }));
  }, []);

  // Dietary
  const handleDietaryPrefToggle = useCallback((pref: DietaryPreference) => {
    setState((prev) => {
      const dietaryPrefs = prev.dietaryPrefs.includes(pref)
        ? prev.dietaryPrefs.filter((p) => p !== pref)
        : [...prev.dietaryPrefs, pref];
      return { ...prev, dietaryPrefs };
    });
  }, []);

  const setNewAllergy = useCallback((newAllergy: string) => {
    setState((prev) => ({ ...prev, newAllergy }));
  }, []);

  const addAllergy = useCallback(() => {
    setState((prev) => {
      const trimmed = prev.newAllergy.trim();
      if (!trimmed || prev.allergies.includes(trimmed)) return prev;
      return {
        ...prev,
        allergies: [...prev.allergies, trimmed],
        newAllergy: '',
      };
    });
  }, []);

  const removeAllergy = useCallback((allergy: string) => {
    setState((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
  }, []);

  // Loading
  const setIsLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  return {
    ...state,
    setName,
    setGender,
    setDateOfBirth,
    setShowDatePicker,
    setHeight,
    setWeight,
    setActivityLevel,
    setPrimaryGoal,
    handleHealthGoalToggle,
    handleConditionToggle,
    setNewMedName,
    setNewSuppName,
    addMedication,
    removeMedication,
    addSupplement,
    removeSupplement,
    handleDietaryPrefToggle,
    setNewAllergy,
    addAllergy,
    removeAllergy,
    setIsLoading,
  };
}
