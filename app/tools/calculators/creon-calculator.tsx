/**
 * Creon Calculator
 * 
 * Calculates pancreatic enzyme (Creon) dosage based on fat content.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../../constants/typography';
import { Card } from '../../../components/ui';
import { useTranslation } from '../../../hooks/useTranslation';
import type { CreonCalculation } from '../../../types';

// Common Creon capsule strengths (lipase units)
const CREON_STRENGTHS = [
  { value: 10000, label: 'Creon 10000' },
  { value: 25000, label: 'Creon 25000' },
  { value: 40000, label: 'Creon 40000' },
];

export default function CreonCalculatorScreen() {
  const { t } = useTranslation();
  const [fatGrams, setFatGrams] = useState('');
  const [lipasePerGram, setLipasePerGram] = useState('2000'); // Default: 2000 units per gram of fat
  const [selectedStrength, setSelectedStrength] = useState(25000);

  const [result, setResult] = useState<CreonCalculation | null>(null);

  const calculateCreon = () => {
    const fat = parseFloat(fatGrams);
    const lipase = parseFloat(lipasePerGram);

    if (isNaN(fat) || fat < 0) {
      Alert.alert(t('common.error'), t('calculators.creon.errors.invalidFat'));
      return;
    }

    if (isNaN(lipase) || lipase <= 0) {
      Alert.alert(t('common.error'), t('calculators.creon.errors.invalidLipase'));
      return;
    }

    // Calculate total lipase units needed
    const totalLipase = fat * lipase;

    // Calculate number of capsules (round up)
    const capsules = Math.ceil(totalLipase / selectedStrength);

    setResult({
      fat_grams: fat,
      lipase_units_per_gram: lipase,
      calculated_capsules: capsules,
      capsule_strength: selectedStrength,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('calculators.creon.title')}</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Disclaimer */}
          <Animated.View entering={FadeIn}>
            <Card style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <Ionicons name="warning" size={20} color={COLORS.error} />
                <Text style={styles.disclaimerTitle}>{t('calculators.creon.disclaimer')}</Text>
              </View>
              <Text style={styles.disclaimerText}>
                {t('calculators.creon.disclaimerText')}
              </Text>
            </Card>
          </Animated.View>

          {/* Info Card */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <Card style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {t('calculators.creon.infoText')}
              </Text>
            </Card>
          </Animated.View>

          {/* Input Section */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Card style={styles.inputCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('calculators.creon.fatInput')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="20"
                  placeholderTextColor={COLORS.textTertiary}
                  value={fatGrams}
                  onChangeText={setFatGrams}
                  keyboardType="numeric"
                />
              </View>
            </Card>
          </Animated.View>

          {/* Settings Section */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <Card style={styles.inputCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('calculators.creon.lipasePerGram')}</Text>
                <View style={styles.unitInput}>
                  <TextInput
                    style={[styles.input, styles.unitInputField]}
                    placeholder="2000"
                    placeholderTextColor={COLORS.textTertiary}
                    value={lipasePerGram}
                    onChangeText={setLipasePerGram}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('calculators.creon.capsuleStrength')}</Text>
                <View style={styles.strengthGrid}>
                  {CREON_STRENGTHS.map((strength) => (
                    <TouchableOpacity
                      key={strength.value}
                      style={[
                        styles.strengthButton,
                        selectedStrength === strength.value && styles.strengthButtonSelected,
                      ]}
                      onPress={() => setSelectedStrength(strength.value)}
                    >
                      <Text
                        style={[
                          styles.strengthText,
                          selectedStrength === strength.value && styles.strengthTextSelected,
                        ]}
                      >
                        {strength.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Calculate Button */}
          <Animated.View entering={FadeInDown.delay(400)}>
            <TouchableOpacity style={styles.calculateButton} onPress={calculateCreon}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.calculateGradient}>
                <Ionicons name="calculator" size={20} color={COLORS.textInverse} />
                <Text style={styles.calculateText}>{t('calculators.creon.calculate')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Result */}
          {result && (
            <Animated.View entering={FadeInDown.delay(100)}>
              <Card style={styles.resultCard}>
                <Text style={styles.resultTitle}>{t('calculators.creon.result')}</Text>
                <View style={styles.resultValue}>
                  <Text style={styles.resultNumber}>{result.calculated_capsules}</Text>
                  <Text style={styles.resultUnit}>{t('calculators.creon.capsules')}</Text>
                </View>

                <Text style={styles.resultStrength}>
                  {CREON_STRENGTHS.find((s) => s.value === result.capsule_strength)?.label}
                </Text>

                <View style={styles.resultBreakdown}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{t('calculators.creon.fatInput')}</Text>
                    <Text style={styles.breakdownValue}>{result.fat_grams} {t('units.g')}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{t('calculators.creon.totalLipase')}</Text>
                    <Text style={styles.breakdownValue}>
                      {(result.fat_grams * result.lipase_units_per_gram).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },

  // Disclaimer
  disclaimerCard: {
    backgroundColor: COLORS.errorLight,
    marginBottom: SPACING.lg,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  disclaimerTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.error,
  },
  disclaimerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error,
    lineHeight: 20,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primaryMuted,
  },
  infoText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },

  // Input Card
  inputCard: {
    marginBottom: SPACING.lg,
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

  // Strength Grid
  strengthGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  strengthButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  strengthButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  strengthText: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.textSecondary,
  },
  strengthTextSelected: {
    color: COLORS.primary,
  },

  // Calculate Button
  calculateButton: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.colored(COLORS.primary),
  },
  calculateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  calculateText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },

  // Result
  resultCard: {
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  resultValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  resultNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
  },
  resultUnit: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  resultStrength: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resultBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + '30',
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
