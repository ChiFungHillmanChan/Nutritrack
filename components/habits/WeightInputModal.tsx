/**
 * WeightInputModal - Enhanced weight tracking modal
 *
 * Features:
 * - Shows last recorded weight with timestamp
 * - Unit preference (kg, stone, pounds)
 * - Weight change indicator
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import type { WeightUnit } from '../../types';

export interface WeightData {
  weightKg: number;
}

interface LastWeightRecord {
  value: number; // in kg
  timestamp: string;
}

interface WeightInputModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: WeightData) => void;
  lastWeight?: LastWeightRecord;
  preferredUnit: WeightUnit;
  onUnitChange: (unit: WeightUnit) => void;
}

const UNITS: { value: WeightUnit; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'pounds', label: 'lbs' },
  { value: 'stone', label: 'st' },
];

// Conversion helpers
const kgToLbs = (kg: number) => kg * 2.20462;
const kgToStone = (kg: number) => kg * 0.157473;
const lbsToKg = (lbs: number) => lbs / 2.20462;
const stoneToKg = (stone: number) => stone / 0.157473;

export function WeightInputModal({
  isVisible,
  onClose,
  onSubmit,
  lastWeight,
  preferredUnit,
  onUnitChange,
}: WeightInputModalProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  // Convert kg to display unit
  const convertFromKg = useCallback((kg: number, unit: WeightUnit): number => {
    switch (unit) {
      case 'pounds':
        return kgToLbs(kg);
      case 'stone':
        return kgToStone(kg);
      default:
        return kg;
    }
  }, []);

  // Convert display unit to kg
  const convertToKg = useCallback((value: number, unit: WeightUnit): number => {
    switch (unit) {
      case 'pounds':
        return lbsToKg(value);
      case 'stone':
        return stoneToKg(value);
      default:
        return value;
    }
  }, []);

  // Format last weight display
  const lastWeightDisplay = useMemo(() => {
    if (!lastWeight) return null;

    const displayValue = convertFromKg(lastWeight.value, preferredUnit);
    const date = new Date(lastWeight.timestamp);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    return {
      value: displayValue.toFixed(1),
      date: dateStr,
    };
  }, [lastWeight, preferredUnit, convertFromKg]);

  // Calculate change from last weight
  const weightChange = useMemo(() => {
    if (!lastWeight || !inputValue) return null;

    const currentKg = convertToKg(parseFloat(inputValue), preferredUnit);
    const diff = currentKg - lastWeight.value;
    const displayDiff = convertFromKg(Math.abs(diff), preferredUnit);

    return {
      value: displayDiff.toFixed(1),
      isGain: diff > 0,
      isLoss: diff < 0,
    };
  }, [lastWeight, inputValue, preferredUnit, convertToKg, convertFromKg]);

  const handleSubmit = useCallback(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) return;

    const weightKg = convertToKg(value, preferredUnit);
    onSubmit({ weightKg });
    setInputValue('');
  }, [inputValue, preferredUnit, convertToKg, onSubmit]);

  const getUnitLabel = () => {
    switch (preferredUnit) {
      case 'pounds':
        return 'lbs';
      case 'stone':
        return 'st';
      default:
        return 'kg';
    }
  };

  const isValid = inputValue && parseFloat(inputValue) > 0;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('habits.types.weight')}</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel={t('common.close')}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Last Weight Record */}
          {lastWeightDisplay && (
            <View style={styles.lastWeightCard}>
              <View style={styles.lastWeightInfo}>
                <Text style={styles.lastWeightLabel}>{t('habits.weight.lastRecord')}</Text>
                <Text style={styles.lastWeightValue}>
                  {lastWeightDisplay.value} {getUnitLabel()}
                </Text>
                <Text style={styles.lastWeightDate}>{lastWeightDisplay.date}</Text>
              </View>
              {weightChange && (weightChange.isGain || weightChange.isLoss) && (
                <View
                  style={[
                    styles.changeIndicator,
                    weightChange.isGain ? styles.changeGain : styles.changeLoss,
                  ]}
                >
                  <Ionicons
                    name={weightChange.isGain ? 'arrow-up' : 'arrow-down'}
                    size={14}
                    color={weightChange.isGain ? COLORS.error : COLORS.success}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      weightChange.isGain ? styles.changeTextGain : styles.changeTextLoss,
                    ]}
                  >
                    {weightChange.value} {getUnitLabel()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Unit Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('habits.weight.unitPreference')}</Text>
            <View style={styles.unitRow}>
              {UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    preferredUnit === unit.value && styles.unitButtonActive,
                  ]}
                  onPress={() => onUnitChange(unit.value)}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      preferredUnit === unit.value && styles.unitButtonTextActive,
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.section}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor={COLORS.textTertiary}
                autoFocus
              />
              <Text style={styles.inputUnit}>{getUnitLabel()}</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid}
          >
            <LinearGradient
              colors={isValid ? GRADIENTS.primary : [COLORS.textTertiary, COLORS.textTertiary]}
              style={styles.submitGradient}
            >
              <Ionicons name="checkmark" size={20} color={COLORS.textInverse} />
              <Text style={styles.submitText}>{t('habits.record')}</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  lastWeightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  lastWeightInfo: {
    flex: 1,
  },
  lastWeightLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  lastWeightValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  lastWeightDate: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  changeGain: {
    backgroundColor: COLORS.error + '15',
  },
  changeLoss: {
    backgroundColor: COLORS.success + '15',
  },
  changeText: {
    ...TYPOGRAPHY.labelSmall,
  },
  changeTextGain: {
    color: COLORS.error,
  },
  changeTextLoss: {
    color: COLORS.success,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  unitRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  unitButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  unitButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  unitButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textSecondary,
  },
  unitButtonTextActive: {
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
  },
  input: {
    flex: 1,
    height: 64,
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  inputUnit: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textSecondary,
  },
  submitButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  submitText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
});
