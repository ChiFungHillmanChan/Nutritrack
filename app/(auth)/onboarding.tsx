import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { UserGoal, MedicalCondition } from '../../types';
import { Card } from '../../components/ui';

const { width } = Dimensions.get('window');

type Step = 'basics' | 'goal' | 'conditions' | 'summary';

const GOALS: { value: UserGoal; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string; color: string }[] = [
  { value: 'lose_weight', label: '減重', icon: 'trending-down', desc: '減少體脂，變得更健康', color: COLORS.calories },
  { value: 'gain_weight', label: '增重', icon: 'trending-up', desc: '增加體重，變得更強壯', color: COLORS.carbs },
  { value: 'maintain', label: '維持', icon: 'remove', desc: '保持現有體重同狀態', color: COLORS.fiber },
  { value: 'build_muscle', label: '增肌', icon: 'barbell', desc: '增加肌肉量，塑造體態', color: COLORS.protein },
];

const CONDITIONS: { value: MedicalCondition; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'diabetes', label: '糖尿病', icon: 'water' },
  { value: 'hypertension', label: '高血壓', icon: 'pulse' },
  { value: 'heart_disease', label: '心臟病', icon: 'heart' },
  { value: 'kidney_disease', label: '腎病', icon: 'medical' },
  { value: 'celiac_disease', label: '乳糜瀉', icon: 'nutrition' },
  { value: 'lactose_intolerance', label: '乳糖不耐症', icon: 'cafe' },
  { value: 'none', label: '冇以上情況', icon: 'checkmark-circle' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>('basics');
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { updateProfile, calculateDailyTargets } = useUserStore();

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

  const handleNext = () => {
    switch (step) {
      case 'basics':
        if (!name || !height || !weight) {
          Alert.alert('錯誤', '請填寫所有資料');
          return;
        }
        setStep('goal');
        break;
      case 'goal':
        if (!goal) {
          Alert.alert('錯誤', '請選擇你嘅目標');
          return;
        }
        setStep('conditions');
        break;
      case 'conditions':
        if (conditions.length === 0) {
          Alert.alert('錯誤', '請選擇你嘅健康狀況');
          return;
        }
        setStep('summary');
        break;
      case 'summary':
        handleComplete();
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'goal':
        setStep('basics');
        break;
      case 'conditions':
        setStep('goal');
        break;
      case 'summary':
        setStep('conditions');
        break;
    }
  };

  const handleComplete = async () => {
    if (!goal) return;

    setIsLoading(true);

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const dailyTargets = calculateDailyTargets(heightNum, weightNum, goal, conditions);

    const success = await updateProfile({
      name,
      height_cm: heightNum,
      weight_kg: weightNum,
      goal,
      medical_conditions: conditions,
      daily_targets: dailyTargets,
    });

    setIsLoading(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('錯誤', '儲存資料失敗，請再試一次');
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'basics':
        return 1;
      case 'goal':
        return 2;
      case 'conditions':
        return 3;
      case 'summary':
        return 4;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <Animated.View entering={FadeIn} style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.stepText}>步驟 {getStepNumber()} / 4</Text>
          <Text style={styles.progressPercentage}>{Math.round((getStepNumber() / 4) * 100)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${(getStepNumber() / 4) * 100}%` },
            ]}
          />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'basics' && <BasicsStep name={name} setName={setName} height={height} setHeight={setHeight} weight={weight} setWeight={setWeight} />}
        {step === 'goal' && <GoalStep goal={goal} setGoal={setGoal} />}
        {step === 'conditions' && <ConditionsStep conditions={conditions} handleConditionToggle={handleConditionToggle} />}
        {step === 'summary' && <SummaryStep name={name} height={height} weight={weight} goal={goal} conditions={conditions} calculateDailyTargets={calculateDailyTargets} />}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {step !== 'basics' ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
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
                  {step === 'summary' ? '開始使用' : '繼續'}
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

// Step Components
function BasicsStep({ name, setName, height, setHeight, weight, setWeight }: {
  name: string;
  setName: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.stepIconGradient}>
            <Ionicons name="person" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>基本資料</Text>
        <Text style={styles.stepDescription}>我哋需要呢啲資料嚟計算你嘅每日營養目標</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>姓名</Text>
          <TextInput
            style={styles.input}
            placeholder="你嘅名"
            placeholderTextColor={COLORS.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.inputLabel}>身高</Text>
            <View style={styles.unitInput}>
              <TextInput
                style={[styles.input, styles.unitInputField]}
                placeholder="170"
                placeholderTextColor={COLORS.textTertiary}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>cm</Text>
            </View>
          </View>

          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.inputLabel}>體重</Text>
            <View style={styles.unitInput}>
              <TextInput
                style={[styles.input, styles.unitInputField]}
                placeholder="65"
                placeholderTextColor={COLORS.textTertiary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>kg</Text>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

function GoalStep({ goal, setGoal }: { goal: UserGoal | null; setGoal: (v: UserGoal) => void }) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.carbs, COLORS.accentDark]} style={styles.stepIconGradient}>
            <Ionicons name="trophy" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>你嘅目標</Text>
        <Text style={styles.stepDescription}>選擇一個最適合你嘅健康目標</Text>
      </View>

      <View style={styles.goalsGrid}>
        {GOALS.map((item, index) => (
          <Animated.View key={item.value} entering={FadeInRight.delay(index * 100)}>
            <TouchableOpacity
              style={[
                styles.goalCard,
                goal === item.value && styles.goalCardSelected,
                goal === item.value && { borderColor: item.color },
              ]}
              onPress={() => setGoal(item.value)}
              activeOpacity={0.8}
            >
              <View style={[styles.goalIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.goalContent}>
                <Text style={[styles.goalLabel, goal === item.value && { color: item.color }]}>
                  {item.label}
                </Text>
                <Text style={styles.goalDesc}>{item.desc}</Text>
              </View>
              {goal === item.value && (
                <View style={[styles.goalCheck, { backgroundColor: item.color }]}>
                  <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

function ConditionsStep({ conditions, handleConditionToggle }: {
  conditions: MedicalCondition[];
  handleConditionToggle: (c: MedicalCondition) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.protein, COLORS.fat]} style={styles.stepIconGradient}>
            <Ionicons name="medical" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>健康狀況</Text>
        <Text style={styles.stepDescription}>如果你有以下情況，我哋會調整營養建議</Text>
      </View>

      <Card style={styles.conditionsCard}>
        <View style={styles.conditionsGrid}>
          {CONDITIONS.map((item, index) => (
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 50)}>
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

function SummaryStep({ name, height, weight, goal, conditions, calculateDailyTargets }: {
  name: string;
  height: string;
  weight: string;
  goal: UserGoal | null;
  conditions: MedicalCondition[];
  calculateDailyTargets: (h: number, w: number, g: UserGoal, c: MedicalCondition[]) => unknown;
}) {
  const heightNum = parseFloat(height) || 0;
  const weightNum = parseFloat(weight) || 0;
  const targets = goal ? calculateDailyTargets(heightNum, weightNum, goal, conditions) as {
    calories: { min: number; max: number };
    protein: { min: number; max: number };
    carbs: { min: number; max: number };
    fat: { min: number; max: number };
  } : null;

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.stepIconGradient}>
            <Ionicons name="sparkles" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>準備就緒！</Text>
        <Text style={styles.stepDescription}>以下係你嘅個人化營養目標</Text>
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
              {height}cm · {weight}kg · {GOALS.find((g) => g.value === goal)?.label}
            </Text>
          </View>
        </View>
      </Card>

      {/* Targets Card */}
      {targets && (
        <Card style={styles.targetsCard}>
          <Text style={styles.targetsTitle}>每日營養目標</Text>
          <View style={styles.targetsList}>
            <TargetRow label="卡路里" value={`${targets.calories.min} - ${targets.calories.max}`} unit="kcal" color={COLORS.calories} icon="flame" />
            <TargetRow label="蛋白質" value={`${targets.protein.min} - ${targets.protein.max}`} unit="g" color={COLORS.protein} icon="fish" />
            <TargetRow label="碳水化合物" value={`${targets.carbs.min} - ${targets.carbs.max}`} unit="g" color={COLORS.carbs} icon="nutrition" />
            <TargetRow label="脂肪" value={`${targets.fat.min} - ${targets.fat.max}`} unit="g" color={COLORS.fat} icon="water" />
          </View>
        </Card>
      )}
    </Animated.View>
  );
}

function TargetRow({ label, value, unit, color, icon }: {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
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

  // Form Card
  formCard: {
    padding: SPACING.lg,
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

  // Summary
  summaryCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
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
