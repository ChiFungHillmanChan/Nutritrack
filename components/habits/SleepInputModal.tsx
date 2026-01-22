/**
 * SleepInputModal - Enhanced sleep tracking modal
 *
 * Features:
 * - Sleep quality rating (3 emojis)
 * - Sleep time and wake up time (scroll pickers)
 * - Dream tracking (text input)
 * - Wake up during night (3 options)
 * - Energy level on waking (optional)
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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

export type SleepQualityRating = 'poor' | 'okay' | 'great';
export type WakeUpDuringNight = 'yes' | 'no' | 'cant_remember';
export type EnergyLevel = 'low' | 'moderate' | 'high';

export interface SleepData {
  quality: SleepQualityRating;
  sleepTime: Date;
  wakeTime: Date;
  dream?: string;
  wokeUpDuring?: WakeUpDuringNight;
  energyLevel?: EnergyLevel;
}

interface SleepInputModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: SleepData) => void;
}

const QUALITY_OPTIONS: { value: SleepQualityRating; emoji: string; labelKey: string }[] = [
  { value: 'poor', emoji: '😴', labelKey: 'habits.sleep.quality.poor' },
  { value: 'okay', emoji: '😐', labelKey: 'habits.sleep.quality.okay' },
  { value: 'great', emoji: '😊', labelKey: 'habits.sleep.quality.great' },
];

const WAKE_UP_OPTIONS: { value: WakeUpDuringNight; labelKey: string }[] = [
  { value: 'no', labelKey: 'common.no' },
  { value: 'yes', labelKey: 'common.yes' },
  { value: 'cant_remember', labelKey: 'habits.sleep.cantRemember' },
];

const ENERGY_OPTIONS: { value: EnergyLevel; emoji: string; labelKey: string }[] = [
  { value: 'low', emoji: '🔋', labelKey: 'habits.sleep.energy.low' },
  { value: 'moderate', emoji: '⚡', labelKey: 'habits.sleep.energy.moderate' },
  { value: 'high', emoji: '💪', labelKey: 'habits.sleep.energy.high' },
];

export function SleepInputModal({
  isVisible,
  onClose,
  onSubmit,
}: SleepInputModalProps) {
  const { t } = useTranslation();

  // Default times - sleep at 11pm yesterday, wake at 7am today
  const getDefaultSleepTime = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(23, 0, 0, 0);
    return date;
  };

  const getDefaultWakeTime = () => {
    const date = new Date();
    date.setHours(7, 0, 0, 0);
    return date;
  };

  const [quality, setQuality] = useState<SleepQualityRating>('okay');
  const [sleepTime, setSleepTime] = useState(getDefaultSleepTime());
  const [wakeTime, setWakeTime] = useState(getDefaultWakeTime());
  const [dream, setDream] = useState('');
  const [wokeUpDuring, setWokeUpDuring] = useState<WakeUpDuringNight | undefined>();
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | undefined>();
  
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);

  const handleSubmit = useCallback(() => {
    onSubmit({
      quality,
      sleepTime,
      wakeTime,
      dream: dream.trim() || undefined,
      wokeUpDuring,
      energyLevel,
    });
    // Reset form
    setQuality('okay');
    setSleepTime(getDefaultSleepTime());
    setWakeTime(getDefaultWakeTime());
    setDream('');
    setWokeUpDuring(undefined);
    setEnergyLevel(undefined);
  }, [quality, sleepTime, wakeTime, dream, wokeUpDuring, energyLevel, onSubmit]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = () => {
    let diff = wakeTime.getTime() - sleepTime.getTime();
    if (diff < 0) {
      diff += 24 * 60 * 60 * 1000; // Add 24 hours if wake time is next day
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}${t('units.hours')} ${minutes}${t('units.minutes')}`;
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
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('habits.sleep.recordSleep')}</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel={t('common.close')}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sleep Quality */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('habits.sleep.qualityTitle')}</Text>
              <View style={styles.qualityOptions}>
                {QUALITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.qualityButton,
                      quality === option.value && styles.qualityButtonActive,
                    ]}
                    onPress={() => setQuality(option.value)}
                  >
                    <Text style={styles.qualityEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.qualityLabel,
                        quality === option.value && styles.qualityLabelActive,
                      ]}
                    >
                      {t(option.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sleep & Wake Times */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('habits.sleep.times')}</Text>
              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowSleepPicker(true)}
                >
                  <Ionicons name="moon" size={20} color={COLORS.primary} />
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>{t('habits.sleep.sleepTime')}</Text>
                    <Text style={styles.timeValue}>{formatTime(sleepTime)}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowWakePicker(true)}
                >
                  <Ionicons name="sunny" size={20} color={COLORS.calories} />
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>{t('habits.sleep.wakeTime')}</Text>
                    <Text style={styles.timeValue}>{formatTime(wakeTime)}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                <Text style={styles.durationText}>{calculateDuration()}</Text>
              </View>
            </View>

            {/* Wake Up During Night */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('habits.sleep.wokeDuring')}</Text>
              <View style={styles.optionRow}>
                {WAKE_UP_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      wokeUpDuring === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setWokeUpDuring(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        wokeUpDuring === option.value && styles.optionTextActive,
                      ]}
                    >
                      {t(option.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Energy Level (Optional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('habits.sleep.energyTitle')} <Text style={styles.optional}>({t('habits.optional')})</Text>
              </Text>
              <View style={styles.energyOptions}>
                {ENERGY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.energyButton,
                      energyLevel === option.value && styles.energyButtonActive,
                    ]}
                    onPress={() => setEnergyLevel(
                      energyLevel === option.value ? undefined : option.value
                    )}
                  >
                    <Text style={styles.energyEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.energyLabel,
                        energyLevel === option.value && styles.energyLabelActive,
                      ]}
                    >
                      {t(option.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dream (Optional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('habits.sleep.dreamTitle')} <Text style={styles.optional}>({t('habits.optional')})</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={t('habits.sleep.dreamPlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
                value={dream}
                onChangeText={setDream}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.submitGradient}>
                <Ionicons name="checkmark" size={20} color={COLORS.textInverse} />
                <Text style={styles.submitText}>{t('habits.record')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>

          {/* Time Pickers */}
          {showSleepPicker && (
            <DateTimePicker
              value={sleepTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowSleepPicker(Platform.OS === 'ios');
                if (date) setSleepTime(date);
              }}
            />
          )}
          {showWakePicker && (
            <DateTimePicker
              value={wakeTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowWakePicker(Platform.OS === 'ios');
                if (date) setWakeTime(date);
              }}
            />
          )}
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
    maxHeight: '90%',
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
  optional: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontWeight: '400',
  },
  qualityOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  qualityButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  qualityButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  qualityEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  qualityLabel: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
  qualityLabelActive: {
    color: COLORS.primary,
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  timeValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
  },
  durationText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.primary,
  },
  optionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  optionText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textSecondary,
  },
  optionTextActive: {
    color: COLORS.primary,
  },
  energyOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  energyButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  energyButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  energyEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  energyLabel: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
  energyLabelActive: {
    color: COLORS.primary,
  },
  textInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.md,
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
