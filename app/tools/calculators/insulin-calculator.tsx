/**
 * Insulin Calculator
 * 
 * Calculates insulin dosage based on carbohydrates and blood sugar correction.
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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../../constants/typography';
import { Card } from '../../../components/ui';
import type { InsulinCalculation } from '../../../types';

export default function InsulinCalculatorScreen() {
  const [carbsGrams, setCarbsGrams] = useState('');
  const [currentBloodSugar, setCurrentBloodSugar] = useState('');
  const [targetBloodSugar, setTargetBloodSugar] = useState('100');
  const [carbRatio, setCarbRatio] = useState('10'); // 1 unit per X grams of carbs
  const [correctionFactor, setCorrectionFactor] = useState('50'); // 1 unit drops X mg/dL

  const [result, setResult] = useState<InsulinCalculation | null>(null);

  const calculateInsulin = () => {
    const carbs = parseFloat(carbsGrams);
    const current = parseFloat(currentBloodSugar);
    const target = parseFloat(targetBloodSugar);
    const ratio = parseFloat(carbRatio);
    const correction = parseFloat(correctionFactor);

    if (isNaN(carbs) || carbs < 0) {
      Alert.alert('錯誤', '請輸入有效嘅碳水化合物克數');
      return;
    }

    if (isNaN(ratio) || ratio <= 0) {
      Alert.alert('錯誤', '請輸入有效嘅碳水比例');
      return;
    }

    // Calculate carb coverage
    const carbCoverage = carbs / ratio;

    // Calculate correction dose (if blood sugar provided)
    let correctionDose = 0;
    if (!isNaN(current) && !isNaN(correction) && correction > 0) {
      const difference = current - target;
      if (difference > 0) {
        correctionDose = difference / correction;
      }
    }

    const totalDose = carbCoverage + correctionDose;

    setResult({
      carbs_grams: carbs,
      current_blood_sugar: isNaN(current) ? undefined : current,
      target_blood_sugar: target,
      correction_factor: correction,
      carb_ratio: ratio,
      calculated_dose: Math.round(totalDose * 10) / 10, // Round to 1 decimal
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>胰島素計算器</Text>
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
              <Text style={styles.disclaimerTitle}>重要提示</Text>
            </View>
            <Text style={styles.disclaimerText}>
              此計算器僅供參考。請務必諮詢你嘅醫生或糖尿病專科護士，並按照處方用藥。
            </Text>
          </Card>
        </Animated.View>

        {/* Input Section */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Card style={styles.inputCard}>
            <Text style={styles.sectionTitle}>餐前計算</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>碳水化合物（克）*</Text>
              <TextInput
                style={styles.input}
                placeholder="例：45"
                placeholderTextColor={COLORS.textTertiary}
                value={carbsGrams}
                onChangeText={setCarbsGrams}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>當前血糖（mg/dL）</Text>
              <TextInput
                style={styles.input}
                placeholder="可選 - 用於校正劑量"
                placeholderTextColor={COLORS.textTertiary}
                value={currentBloodSugar}
                onChangeText={setCurrentBloodSugar}
                keyboardType="numeric"
              />
            </View>
          </Card>
        </Animated.View>

        {/* Settings Section */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.inputCard}>
            <Text style={styles.sectionTitle}>個人設定</Text>
            <Text style={styles.sectionSubtitle}>請按照你嘅醫生處方設定</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>碳水比例 (I:C)</Text>
                <View style={styles.unitInput}>
                  <Text style={styles.unitPrefix}>1:</Text>
                  <TextInput
                    style={[styles.input, styles.unitInputField]}
                    placeholder="10"
                    placeholderTextColor={COLORS.textTertiary}
                    value={carbRatio}
                    onChangeText={setCarbRatio}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.inputHint}>1單位胰島素：X克碳水</Text>
              </View>

              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>校正因子 (ISF)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="50"
                  placeholderTextColor={COLORS.textTertiary}
                  value={correctionFactor}
                  onChangeText={setCorrectionFactor}
                  keyboardType="numeric"
                />
                <Text style={styles.inputHint}>1單位降低 X mg/dL</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>目標血糖（mg/dL）</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                placeholderTextColor={COLORS.textTertiary}
                value={targetBloodSugar}
                onChangeText={setTargetBloodSugar}
                keyboardType="numeric"
              />
            </View>
          </Card>
        </Animated.View>

        {/* Calculate Button */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <TouchableOpacity style={styles.calculateButton} onPress={calculateInsulin}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.calculateGradient}>
              <Ionicons name="calculator" size={20} color={COLORS.textInverse} />
              <Text style={styles.calculateText}>計算劑量</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Result */}
        {result && (
          <Animated.View entering={FadeInDown.delay(100)}>
            <Card style={styles.resultCard}>
              <Text style={styles.resultTitle}>建議劑量</Text>
              <View style={styles.resultValue}>
                <Text style={styles.resultNumber}>{result.calculated_dose}</Text>
                <Text style={styles.resultUnit}>單位</Text>
              </View>

              <View style={styles.resultBreakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>碳水覆蓋</Text>
                  <Text style={styles.breakdownValue}>
                    {Math.round((result.carbs_grams / result.carb_ratio) * 10) / 10} 單位
                  </Text>
                </View>
                {result.current_blood_sugar && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>血糖校正</Text>
                    <Text style={styles.breakdownValue}>
                      {Math.round(((result.current_blood_sugar - result.target_blood_sugar) / result.correction_factor) * 10) / 10} 單位
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.resultNote}>
                * 實際劑量請諮詢你嘅醫療團隊
              </Text>
            </Card>
          </Animated.View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
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

  // Input Card
  inputCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
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
  inputHint: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  unitInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingLeft: SPACING.lg,
  },
  unitPrefix: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  unitInputField: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: SPACING.xs,
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
    marginBottom: SPACING.lg,
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
  resultNote: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
