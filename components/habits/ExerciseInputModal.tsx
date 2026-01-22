/**
 * ExerciseInputModal - Exercise tracking modal
 *
 * Allows users to log exercise with:
 * - Exercise type selection
 * - Duration input (minutes)
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import type { ExerciseType } from '../../types';

export interface ExerciseData {
  type: ExerciseType;
  durationMinutes: number;
}

interface ExerciseInputModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: ExerciseData) => void;
}

interface ExerciseOption {
  type: ExerciseType;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
}

const EXERCISE_OPTIONS: ExerciseOption[] = [
  { type: 'walking', icon: 'walk', labelKey: 'exercises.walking' },
  { type: 'running', icon: 'fitness', labelKey: 'exercises.running' },
  { type: 'cycling', icon: 'bicycle', labelKey: 'exercises.cycling' },
  { type: 'swimming', icon: 'water', labelKey: 'exercises.swimming' },
  { type: 'strength_training', icon: 'barbell', labelKey: 'exercises.strength' },
  { type: 'yoga', icon: 'body', labelKey: 'exercises.yoga' },
  { type: 'hiit', icon: 'flash', labelKey: 'exercises.hiit' },
  { type: 'dancing', icon: 'musical-notes', labelKey: 'exercises.dancing' },
  { type: 'hiking', icon: 'trail-sign', labelKey: 'exercises.hiking' },
  { type: 'stretching', icon: 'accessibility', labelKey: 'exercises.stretching' },
  { type: 'other', icon: 'ellipsis-horizontal', labelKey: 'exercises.other' },
];

export function ExerciseInputModal({
  isVisible,
  onClose,
  onSubmit,
}: ExerciseInputModalProps) {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [duration, setDuration] = useState('');

  const handleSubmit = useCallback(() => {
    if (!selectedType) return;

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) return;

    onSubmit({
      type: selectedType,
      durationMinutes: durationNum,
    });

    // Reset form
    setSelectedType(null);
    setDuration('');
  }, [selectedType, duration, onSubmit]);

  const isValid = selectedType && duration && parseInt(duration, 10) > 0;

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
            <Text style={styles.modalTitle}>{t('habits.exercise.title')}</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel={t('common.close')}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Exercise Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('habits.exercise.type')}</Text>
              <View style={styles.exerciseGrid}>
                {EXERCISE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.exerciseButton,
                      selectedType === option.type && styles.exerciseButtonActive,
                    ]}
                    onPress={() => setSelectedType(option.type)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={selectedType === option.type ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.exerciseLabel,
                        selectedType === option.type && styles.exerciseLabelActive,
                      ]}
                      numberOfLines={1}
                    >
                      {t(option.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('habits.exercise.durationMinutes')}</Text>
              <View style={styles.durationContainer}>
                <TextInput
                  style={styles.durationInput}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={COLORS.textTertiary}
                />
                <Text style={styles.durationUnit}>{t('units.minutes')}</Text>
              </View>
              {/* Quick duration buttons */}
              <View style={styles.quickDurationRow}>
                {[15, 30, 45, 60].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.quickDurationButton,
                      duration === String(mins) && styles.quickDurationButtonActive,
                    ]}
                    onPress={() => setDuration(String(mins))}
                  >
                    <Text
                      style={[
                        styles.quickDurationText,
                        duration === String(mins) && styles.quickDurationTextActive,
                      ]}
                    >
                      {mins} {t('units.minutes')}
                    </Text>
                  </TouchableOpacity>
                ))}
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
          </ScrollView>
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
    maxHeight: '85%',
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
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  exerciseButton: {
    width: '30%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  exerciseLabel: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  exerciseLabelActive: {
    color: COLORS.primary,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
  },
  durationInput: {
    flex: 1,
    height: 56,
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  durationUnit: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  quickDurationRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  quickDurationButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickDurationButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  quickDurationText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
  quickDurationTextActive: {
    color: COLORS.primary,
  },
  submitButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.md,
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
