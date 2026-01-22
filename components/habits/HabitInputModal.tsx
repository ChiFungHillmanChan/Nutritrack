/**
 * HabitInputModal Component
 *
 * Modal for inputting habit values with numeric input or specialized selectors.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import { MoodSelector } from './MoodSelector';
import { BristolSelector } from './BristolSelector';
import type { MoodLevel, BristolStoolType } from '../../types';
import type { HabitConfig } from './HabitCard';

interface HabitInputModalProps {
  isVisible: boolean;
  selectedHabit: HabitConfig | null;
  inputValue: string;
  onInputChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onMoodSelect: (mood: MoodLevel) => void;
  onBowelSelect: (type: BristolStoolType) => void;
}

// Quick add options for hydration
const HYDRATION_QUICK_OPTIONS = [250, 500];

export function HabitInputModal({
  isVisible,
  selectedHabit,
  inputValue,
  onInputChange,
  onClose,
  onSubmit,
  onMoodSelect,
  onBowelSelect,
}: HabitInputModalProps) {
  const { t } = useTranslation();
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Reset custom input state when modal opens/closes
  useEffect(() => {
    if (!isVisible) {
      setShowCustomInput(false);
    }
  }, [isVisible]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSubmitWithKeyboardDismiss = () => {
    Keyboard.dismiss();
    onSubmit();
  };

  const handleQuickAdd = (value: number) => {
    onInputChange(String(value));
    // Auto-submit after selecting quick option
    setTimeout(() => {
      onSubmit();
    }, 100);
  };

  // Render hydration-specific UI
  const renderHydrationContent = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Explanation text */}
      <View style={styles.explanationContainer}>
        <Ionicons name="information-circle" size={18} color={COLORS.primary} />
        <Text style={styles.explanationText}>
          {t('habits.fluids.explanation')}
        </Text>
      </View>

      {/* Quick add section */}
      <View style={styles.quickAddSection}>
        <Text style={styles.sectionTitle}>{t('habits.fluids.quickAdd')}</Text>
        <View style={styles.quickAddRow}>
          {HYDRATION_QUICK_OPTIONS.map((value) => (
            <TouchableOpacity
              key={value}
              style={styles.quickAddButton}
              onPress={() => handleQuickAdd(value)}
            >
              <Ionicons name="water" size={24} color={COLORS.sodium} />
              <Text style={styles.quickAddValue}>{value}</Text>
              <Text style={styles.quickAddUnit}>{t('units.ml')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom input section */}
      <View style={styles.customSection}>
        <TouchableOpacity
          style={styles.customToggle}
          onPress={() => setShowCustomInput(!showCustomInput)}
        >
          <Text style={styles.sectionTitle}>{t('habits.fluids.custom')}</Text>
          <Ionicons
            name={showCustomInput ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.textTertiary}
                value={inputValue}
                onChangeText={onInputChange}
                keyboardType="numeric"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmitWithKeyboardDismiss}
              />
              <Text style={styles.inputUnit}>{t('units.ml')}</Text>
            </View>
            <TouchableOpacity
              style={[styles.submitButton, !inputValue && styles.submitButtonDisabled]}
              onPress={handleSubmitWithKeyboardDismiss}
              disabled={!inputValue}
            >
              <LinearGradient
                colors={inputValue ? GRADIENTS.primary : [COLORS.textTertiary, COLORS.textTertiary]}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>{t('habits.record')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t('habits.record')} {selectedHabit ? t(selectedHabit.labelKey) : ''}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    dismissKeyboard();
                    onClose();
                  }}
                  accessibilityLabel={t('common.close')}
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedHabit?.type === 'mood' ? (
                <MoodSelector onSelect={onMoodSelect} />
              ) : selectedHabit?.type === 'bowels' ? (
                <BristolSelector onSelect={onBowelSelect} />
              ) : selectedHabit?.type === 'hydration' ? (
                renderHydrationContent()
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('habits.inputPlaceholder', {
                        habit: selectedHabit ? t(selectedHabit.labelKey) : '',
                      })}
                      placeholderTextColor={COLORS.textTertiary}
                      value={inputValue}
                      onChangeText={onInputChange}
                      keyboardType="numeric"
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleSubmitWithKeyboardDismiss}
                      blurOnSubmit={false}
                      accessibilityLabel={t('habits.inputPlaceholder', {
                        habit: selectedHabit ? t(selectedHabit.labelKey) : '',
                      })}
                      accessibilityHint={t('accessibility.enterNumericValue')}
                    />
                    {selectedHabit?.unitKey && (
                      <Text style={styles.inputUnit}>{t(selectedHabit.unitKey)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitWithKeyboardDismiss}
                    accessibilityLabel={t('habits.record')}
                    accessibilityRole="button"
                  >
                    <LinearGradient colors={GRADIENTS.primary} style={styles.submitGradient}>
                      <Text style={styles.submitText}>{t('habits.record')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING['3xl'],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  input: {
    flex: 1,
    height: 56,
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  inputUnit: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  submitButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  submitText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
  // Hydration-specific styles
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primaryMuted,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  explanationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    flex: 1,
    lineHeight: 18,
  },
  quickAddSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickAddButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAddValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.sodium,
    marginTop: SPACING.xs,
  },
  quickAddUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  customSection: {
    marginBottom: SPACING.md,
  },
  customToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  customInputContainer: {
    marginTop: SPACING.sm,
  },
});
