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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../../constants/typography';
import { Card } from '../../../components/ui';
import type { CreonCalculation } from '../../../types';

// Common Creon capsule strengths (lipase units)
const CREON_STRENGTHS = [
  { value: 10000, label: 'Creon 10000' },
  { value: 25000, label: 'Creon 25000' },
  { value: 40000, label: 'Creon 40000' },
];

export default function CreonCalculatorScreen() {
  const [fatGrams, setFatGrams] = useState('');
  const [lipasePerGram, setLipasePerGram] = useState('2000'); // Default: 2000 units per gram of fat
  const [selectedStrength, setSelectedStrength] = useState(25000);

  const [result, setResult] = useState<CreonCalculation | null>(null);

  const calculateCreon = () => {
    const fat = parseFloat(fatGrams);
    const lipase = parseFloat(lipasePerGram);

    if (isNaN(fat) || fat < 0) {
      Alert.alert('錯誤', '請輸入有效嘅脂肪克數');
      return;
    }

    if (isNaN(lipase) || lipase <= 0) {
      Alert.alert('錯誤', '請輸入有效嘅脂肪酶劑量');
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creon 計算器</Text>
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
              此計算器僅供參考。Creon 劑量因人而異，請按照你嘅醫生或營養師處方用藥。
            </Text>
          </Card>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Card style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Creon 含有消化酵素（脂肪酶、蛋白酶、澱粉酶），幫助消化食物。通常用於胰腺功能不全、囊性纖維化等情況。
            </Text>
          </Card>
        </Animated.View>

        {/* Input Section */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.inputCard}>
            <Text style={styles.sectionTitle}>餐食資料</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>脂肪含量（克）*</Text>
              <TextInput
                style={styles.input}
                placeholder="例：20"
                placeholderTextColor={COLORS.textTertiary}
                value={fatGrams}
                onChangeText={setFatGrams}
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>可從食物標籤或營養分析獲取</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Settings Section */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Card style={styles.inputCard}>
            <Text style={styles.sectionTitle}>處方設定</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>脂肪酶劑量（每克脂肪）</Text>
              <View style={styles.unitInput}>
                <TextInput
                  style={[styles.input, styles.unitInputField]}
                  placeholder="2000"
                  placeholderTextColor={COLORS.textTertiary}
                  value={lipasePerGram}
                  onChangeText={setLipasePerGram}
                  keyboardType="numeric"
                />
                <Text style={styles.unitSuffix}>單位/克</Text>
              </View>
              <Text style={styles.inputHint}>一般建議為 500-4000 單位/克脂肪</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Creon 強度</Text>
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
                <Text style={styles.resultNumber}>{result.calculated_capsules}</Text>
                <Text style={styles.resultUnit}>粒膠囊</Text>
              </View>

              <Text style={styles.resultStrength}>
                {CREON_STRENGTHS.find((s) => s.value === result.capsule_strength)?.label}
              </Text>

              <View style={styles.resultBreakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>脂肪含量</Text>
                  <Text style={styles.breakdownValue}>{result.fat_grams} 克</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>所需脂肪酶</Text>
                  <Text style={styles.breakdownValue}>
                    {(result.fat_grams * result.lipase_units_per_gram).toLocaleString()} 單位
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>實際劑量</Text>
                  <Text style={styles.breakdownValue}>
                    {(result.calculated_capsules * result.capsule_strength).toLocaleString()} 單位
                  </Text>
                </View>
              </View>

              <Text style={styles.resultNote}>
                * 餐前或餐中服用，請勿咀嚼膠囊
              </Text>
            </Card>
          </Animated.View>
        )}

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Card style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>使用提示</Text>
            <View style={styles.tipsList}>
              <TipItem text="正餐時服用全劑量，小食時可減半" />
              <TipItem text="高脂餐食可能需要額外劑量" />
              <TipItem text="如有不適，請諮詢醫生調整劑量" />
              <TipItem text="儲存於陰涼乾燥處" />
            </View>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipItem}>
      <Ionicons name="checkmark-circle" size={16} color={COLORS.fiber} />
      <Text style={styles.tipText}>{text}</Text>
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
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
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
  unitSuffix: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
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
  resultNote: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },

  // Tips
  tipsCard: {
    backgroundColor: COLORS.fiberBg,
  },
  tipsTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.fiber,
    marginBottom: SPACING.md,
  },
  tipsList: {
    gap: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    flex: 1,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
