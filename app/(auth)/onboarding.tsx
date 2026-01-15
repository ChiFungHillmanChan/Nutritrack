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
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { Ionicons } from '@expo/vector-icons';
import { UserGoal, MedicalCondition } from '../../types';

type Step = 'basics' | 'goal' | 'conditions' | 'summary';

const GOALS: { value: UserGoal; label: string; icon: string; desc: string }[] = [
  { value: 'lose_weight', label: '減重', icon: 'trending-down', desc: '減少體脂，變得更健康' },
  { value: 'gain_weight', label: '增重', icon: 'trending-up', desc: '增加體重，變得更強壯' },
  { value: 'maintain', label: '維持', icon: 'remove', desc: '保持現有體重同狀態' },
  { value: 'build_muscle', label: '增肌', icon: 'barbell', desc: '增加肌肉量，塑造體態' },
];

const CONDITIONS: { value: MedicalCondition; label: string }[] = [
  { value: 'diabetes', label: '糖尿病' },
  { value: 'hypertension', label: '高血壓' },
  { value: 'heart_disease', label: '心臟病' },
  { value: 'kidney_disease', label: '腎病' },
  { value: 'celiac_disease', label: '乳糜瀉' },
  { value: 'lactose_intolerance', label: '乳糖不耐症' },
  { value: 'none', label: '冇以上情況' },
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
      const filtered = conditions.filter(c => c !== 'none');
      if (filtered.includes(condition)) {
        setConditions(filtered.filter(c => c !== condition));
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

  const renderBasicsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>基本資料</Text>
      <Text style={styles.stepDescription}>我哋需要呢啲資料嚟計算你嘅每日營養目標</Text>

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

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>身高 (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：170"
          placeholderTextColor={COLORS.textTertiary}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>體重 (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：65"
          placeholderTextColor={COLORS.textTertiary}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderGoalStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>你嘅目標</Text>
      <Text style={styles.stepDescription}>選擇一個最適合你嘅健康目標</Text>

      <View style={styles.goalGrid}>
        {GOALS.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[styles.goalCard, goal === item.value && styles.goalCardSelected]}
            onPress={() => setGoal(item.value)}
          >
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={goal === item.value ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.goalLabel, goal === item.value && styles.goalLabelSelected]}>
              {item.label}
            </Text>
            <Text style={styles.goalDesc}>{item.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderConditionsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>健康狀況</Text>
      <Text style={styles.stepDescription}>如果你有以下情況，我哋會調整營養建議</Text>

      <View style={styles.conditionsGrid}>
        {CONDITIONS.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.conditionChip,
              conditions.includes(item.value) && styles.conditionChipSelected,
            ]}
            onPress={() => handleConditionToggle(item.value)}
          >
            <Text
              style={[
                styles.conditionText,
                conditions.includes(item.value) && styles.conditionTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSummaryStep = () => {
    const heightNum = parseFloat(height) || 0;
    const weightNum = parseFloat(weight) || 0;
    const targets = goal ? calculateDailyTargets(heightNum, weightNum, goal, conditions) : null;

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>確認資料</Text>
        <Text style={styles.stepDescription}>以下係你嘅每日營養目標</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>姓名</Text>
            <Text style={styles.summaryValue}>{name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>身高</Text>
            <Text style={styles.summaryValue}>{height} cm</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>體重</Text>
            <Text style={styles.summaryValue}>{weight} kg</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>目標</Text>
            <Text style={styles.summaryValue}>
              {GOALS.find(g => g.value === goal)?.label}
            </Text>
          </View>
        </View>

        {targets && (
          <View style={styles.targetsCard}>
            <Text style={styles.targetsTitle}>每日目標</Text>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>卡路里</Text>
              <Text style={styles.targetValue}>
                {targets.calories.min} - {targets.calories.max} kcal
              </Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>蛋白質</Text>
              <Text style={styles.targetValue}>
                {targets.protein.min} - {targets.protein.max} g
              </Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>碳水化合物</Text>
              <Text style={styles.targetValue}>
                {targets.carbs.min} - {targets.carbs.max} g
              </Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>脂肪</Text>
              <Text style={styles.targetValue}>
                {targets.fat.min} - {targets.fat.max} g
              </Text>
            </View>
          </View>
        )}
      </View>
    );
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
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(getStepNumber() / 4) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>步驟 {getStepNumber()} / 4</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {step === 'basics' && renderBasicsStep()}
        {step === 'goal' && renderGoalStep()}
        {step === 'conditions' && renderConditionsStep()}
        {step === 'summary' && renderSummaryStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {step !== 'basics' && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.textInverse} />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {step === 'summary' ? '完成' : '下一步'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.textInverse} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    marginTop: 8,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepTitle: {
    ...TYPOGRAPHY.h2,
    marginBottom: 8,
  },
  stepDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalGrid: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  goalCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.successLight,
  },
  goalLabel: {
    ...TYPOGRAPHY.h4,
    marginTop: 8,
    color: COLORS.text,
  },
  goalLabelSelected: {
    color: COLORS.primary,
  },
  goalDesc: {
    ...TYPOGRAPHY.caption,
    marginTop: 4,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  conditionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  conditionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },
  conditionTextSelected: {
    color: COLORS.textInverse,
  },
  summaryCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  targetsCard: {
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    padding: 16,
  },
  targetsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  targetLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },
  targetValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.primary,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text,
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
    marginRight: 8,
  },
});
