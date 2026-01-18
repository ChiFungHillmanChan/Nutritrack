/**
 * HabitInputModal Component
 *
 * Modal for inputting habit values with numeric input or specialized selectors.
 */

import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
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

  const renderModalContent = () => {
    if (selectedHabit?.type === 'mood') {
      return <MoodSelector onSelect={onMoodSelect} />;
    }

    if (selectedHabit?.type === 'bowels') {
      return <BristolSelector onSelect={onBowelSelect} />;
    }

    return (
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
          onPress={onSubmit}
          accessibilityLabel={t('habits.record')}
          accessibilityRole="button"
        >
          <LinearGradient colors={GRADIENTS.primary} style={styles.submitGradient}>
            <Text style={styles.submitText}>{t('habits.record')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('habits.record')} {selectedHabit ? t(selectedHabit.labelKey) : ''}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel={t('common.close')}
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {renderModalContent()}
        </View>
      </View>
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
  submitGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  submitText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
});
