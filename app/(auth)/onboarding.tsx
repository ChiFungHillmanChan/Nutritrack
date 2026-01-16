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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore, calculateAge } from '../../stores/userStore';
import {
  UserGoal,
  HealthGoal,
  MedicalCondition,
  Gender,
  ActivityLevel,
  DietaryPreference,
  Medication,
  Supplement,
  DailyTargets,
} from '../../types';

// Type for the calculateDailyTargets function
interface TargetCalculationParams {
  height: number;
  weight: number;
  age?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  goal: UserGoal;
  healthGoals?: HealthGoal[];
  conditions: MedicalCondition[];
}

type CalculateDailyTargetsFunction = (params: TargetCalculationParams) => DailyTargets;
import { Card } from '../../components/ui';

type Step = 'basics' | 'metrics' | 'goals' | 'conditions' | 'medications' | 'dietary' | 'summary';

const STEPS: Step[] = ['basics', 'metrics', 'goals', 'conditions', 'medications', 'dietary', 'summary'];

// Gender options
const GENDERS: { value: Gender; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'male', label: '男性', icon: 'male' },
  { value: 'female', label: '女性', icon: 'female' },
  { value: 'other', label: '其他', icon: 'person' },
  { value: 'prefer_not_to_say', label: '不願透露', icon: 'help-circle' },
];

// Activity levels
const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: '久坐', desc: '幾乎不運動，辦公室工作' },
  { value: 'light', label: '輕度活動', desc: '每週運動1-3次' },
  { value: 'moderate', label: '中度活動', desc: '每週運動3-5次' },
  { value: 'active', label: '活躍', desc: '每週運動6-7次' },
  { value: 'very_active', label: '非常活躍', desc: '每天高強度運動或體力勞動' },
];

// Primary goals (for calorie calculation)
const PRIMARY_GOALS: { value: UserGoal; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string; color: string }[] = [
  { value: 'lose_weight', label: '減重', icon: 'trending-down', desc: '減少體脂，變得更健康', color: COLORS.calories },
  { value: 'gain_weight', label: '增重', icon: 'trending-up', desc: '增加體重，變得更強壯', color: COLORS.carbs },
  { value: 'maintain', label: '維持', icon: 'remove', desc: '保持現有體重同狀態', color: COLORS.fiber },
  { value: 'build_muscle', label: '增肌', icon: 'barbell', desc: '增加肌肉量，塑造體態', color: COLORS.protein },
];

// Health goals (multi-select)
const HEALTH_GOALS: { value: HealthGoal; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'healthy_balanced_eating', label: '均衡飲食', icon: 'nutrition' },
  { value: 'weight_loss', label: '減重', icon: 'trending-down' },
  { value: 'weight_gain', label: '增重', icon: 'trending-up' },
  { value: 'healthy_bowels', label: '改善腸道健康', icon: 'fitness' },
  { value: 'muscle_gain', label: '增肌', icon: 'barbell' },
  { value: 'improve_hydration', label: '改善水分攝取', icon: 'water' },
  { value: 'blood_sugar_control', label: '控制血糖', icon: 'pulse' },
  { value: 'fix_micros', label: '改善微量營養', icon: 'leaf' },
  { value: 'improve_sleep', label: '改善睡眠', icon: 'moon' },
  { value: 'improve_breathing', label: '改善呼吸', icon: 'cloud' },
  { value: 'reduce_alcohol', label: '減少酒精', icon: 'beer' },
  { value: 'reduce_smoking', label: '減少吸煙', icon: 'ban' },
  { value: 'achieve_10k_steps', label: '每日萬步', icon: 'footsteps' },
  { value: 'improve_mental_health', label: '改善心理健康', icon: 'happy' },
];

// Medical conditions
const CONDITIONS: { value: MedicalCondition; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'none', label: '冇以上情況', icon: 'checkmark-circle' },
  { value: 't1dm', label: '一型糖尿病', icon: 'water' },
  { value: 't2dm', label: '二型糖尿病', icon: 'water' },
  { value: 'hypertension', label: '高血壓', icon: 'pulse' },
  { value: 'coronary_heart_disease', label: '冠心病', icon: 'heart' },
  { value: 'high_cholesterol', label: '高膽固醇', icon: 'analytics' },
  { value: 'kidney_disease', label: '腎病', icon: 'medical' },
  { value: 'copd', label: 'COPD', icon: 'cloud' },
  { value: 'asthma', label: '哮喘', icon: 'cloud-outline' },
  { value: 'cancer', label: '癌症', icon: 'ribbon' },
  { value: 'celiac_disease', label: '乳糜瀉', icon: 'nutrition' },
  { value: 'lactose_intolerance', label: '乳糖不耐症', icon: 'cafe' },
  { value: 'pcos', label: '多囊卵巢症', icon: 'female' },
  { value: 'thyroid_disorders', label: '甲狀腺問題', icon: 'body' },
  { value: 'ibs', label: '腸易激綜合症', icon: 'fitness' },
  { value: 'crohns_disease', label: '克隆氏症', icon: 'fitness' },
  { value: 'ulcerative_colitis', label: '潰瘍性結腸炎', icon: 'fitness' },
];

// Dietary preferences
const DIETARY_PREFS: { value: DietaryPreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'vegetarian', label: '素食', icon: 'leaf' },
  { value: 'vegan', label: '純素', icon: 'flower' },
  { value: 'pescatarian', label: '魚素', icon: 'fish' },
  { value: 'halal', label: '清真', icon: 'moon' },
  { value: 'kosher', label: '猶太潔食', icon: 'star' },
  { value: 'gluten_free', label: '無麩質', icon: 'nutrition' },
  { value: 'dairy_free', label: '無乳製品', icon: 'cafe-outline' },
  { value: 'nut_free', label: '無堅果', icon: 'warning' },
  { value: 'low_sodium', label: '低鈉', icon: 'water-outline' },
  { value: 'low_carb', label: '低碳水', icon: 'cellular' },
  { value: 'keto', label: '生酮', icon: 'flame' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>('basics');
  
  // Basic info
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(1990, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Metrics
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  
  // Goals
  const [primaryGoal, setPrimaryGoal] = useState<UserGoal | null>(null);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  
  // Medical
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  
  // Medications & Supplements
  const [medications, setMedications] = useState<Medication[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newSuppName, setNewSuppName] = useState('');
  
  // Dietary
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const { updateProfile, calculateDailyTargets } = useUserStore();

  const handleHealthGoalToggle = (goal: HealthGoal) => {
    if (healthGoals.includes(goal)) {
      setHealthGoals(healthGoals.filter((g) => g !== goal));
    } else {
      setHealthGoals([...healthGoals, goal]);
    }
  };

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

  const handleDietaryPrefToggle = (pref: DietaryPreference) => {
    if (dietaryPrefs.includes(pref)) {
      setDietaryPrefs(dietaryPrefs.filter((p) => p !== pref));
    } else {
      setDietaryPrefs([...dietaryPrefs, pref]);
    }
  };

  const addMedication = () => {
    if (newMedName.trim()) {
      setMedications([
        ...medications,
        {
          id: `med-${Date.now()}`,
          name: newMedName.trim(),
          dosage: '',
          frequency: '',
          time_of_day: [],
        },
      ]);
      setNewMedName('');
    }
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const addSupplement = () => {
    if (newSuppName.trim()) {
      setSupplements([
        ...supplements,
        {
          id: `supp-${Date.now()}`,
          name: newSuppName.trim(),
          dosage: '',
          frequency: '',
        },
      ]);
      setNewSuppName('');
    }
  };

  const removeSupplement = (id: string) => {
    setSupplements(supplements.filter((s) => s.id !== id));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 'basics':
        if (!name) {
          Alert.alert('錯誤', '請輸入你嘅名字');
          return false;
        }
        return true;
      case 'metrics':
        if (!height || !weight) {
          Alert.alert('錯誤', '請填寫身高同體重');
          return false;
        }
        return true;
      case 'goals':
        if (!primaryGoal) {
          Alert.alert('錯誤', '請選擇你嘅主要目標');
          return false;
        }
        return true;
      case 'conditions':
        if (conditions.length === 0) {
          Alert.alert('錯誤', '請選擇你嘅健康狀況');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    }
  };

  const handleComplete = async () => {
    if (!primaryGoal) return;

    setIsLoading(true);

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const age = calculateAge(dateOfBirth.toISOString().split('T')[0]);

    const dailyTargets = calculateDailyTargets({
      height: heightNum,
      weight: weightNum,
      age,
      gender: gender || 'prefer_not_to_say',
      activityLevel,
      goal: primaryGoal,
      healthGoals,
      conditions,
    });

    const success = await updateProfile({
      name,
      gender: gender || 'prefer_not_to_say',
      date_of_birth: dateOfBirth.toISOString().split('T')[0],
      height_cm: heightNum,
      weight_kg: weightNum,
      activity_level: activityLevel,
      goal: primaryGoal,
      health_goals: healthGoals,
      medical_conditions: conditions,
      medications,
      supplements,
      dietary_preferences: dietaryPrefs,
      allergies,
      daily_targets: dailyTargets,
    });

    setIsLoading(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('錯誤', '儲存資料失敗，請再試一次');
    }
  };

  const getStepNumber = () => STEPS.indexOf(step) + 1;
  const totalSteps = STEPS.length;

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <Animated.View entering={FadeIn} style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.stepText}>步驟 {getStepNumber()} / {totalSteps}</Text>
          <Text style={styles.progressPercentage}>{Math.round((getStepNumber() / totalSteps) * 100)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${(getStepNumber() / totalSteps) * 100}%` },
            ]}
          />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'basics' && (
          <BasicsStep
            name={name}
            setName={setName}
            gender={gender}
            setGender={setGender}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
          />
        )}
        {step === 'metrics' && (
          <MetricsStep
            height={height}
            setHeight={setHeight}
            weight={weight}
            setWeight={setWeight}
            activityLevel={activityLevel}
            setActivityLevel={setActivityLevel}
          />
        )}
        {step === 'goals' && (
          <GoalsStep
            primaryGoal={primaryGoal}
            setPrimaryGoal={setPrimaryGoal}
            healthGoals={healthGoals}
            handleHealthGoalToggle={handleHealthGoalToggle}
          />
        )}
        {step === 'conditions' && (
          <ConditionsStep
            conditions={conditions}
            handleConditionToggle={handleConditionToggle}
          />
        )}
        {step === 'medications' && (
          <MedicationsStep
            medications={medications}
            supplements={supplements}
            newMedName={newMedName}
            setNewMedName={setNewMedName}
            newSuppName={newSuppName}
            setNewSuppName={setNewSuppName}
            addMedication={addMedication}
            removeMedication={removeMedication}
            addSupplement={addSupplement}
            removeSupplement={removeSupplement}
          />
        )}
        {step === 'dietary' && (
          <DietaryStep
            dietaryPrefs={dietaryPrefs}
            handleDietaryPrefToggle={handleDietaryPrefToggle}
            allergies={allergies}
            newAllergy={newAllergy}
            setNewAllergy={setNewAllergy}
            addAllergy={addAllergy}
            removeAllergy={removeAllergy}
          />
        )}
        {step === 'summary' && (
          <SummaryStep
            name={name}
            gender={gender}
            dateOfBirth={dateOfBirth}
            height={height}
            weight={weight}
            activityLevel={activityLevel}
            primaryGoal={primaryGoal}
            healthGoals={healthGoals}
            conditions={conditions}
            medications={medications}
            supplements={supplements}
            dietaryPrefs={dietaryPrefs}
            allergies={allergies}
            calculateDailyTargets={calculateDailyTargets}
          />
        )}
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

// ============================================
// STEP COMPONENTS
// ============================================

function BasicsStep({
  name,
  setName,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  showDatePicker,
  setShowDatePicker,
}: {
  name: string;
  setName: (v: string) => void;
  gender: Gender | null;
  setGender: (v: Gender) => void;
  dateOfBirth: Date;
  setDateOfBirth: (v: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (v: boolean) => void;
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
        <Text style={styles.stepDescription}>讓我哋認識你多啲</Text>
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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>性別</Text>
          <View style={styles.genderGrid}>
            {GENDERS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.genderChip,
                  gender === item.value && styles.genderChipSelected,
                ]}
                onPress={() => setGender(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={gender === item.value ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === item.value && styles.genderTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>出生日期</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.dateButtonText}>
              {dateOfBirth.toLocaleDateString('zh-HK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.ageText}>
              ({calculateAge(dateOfBirth.toISOString().split('T')[0])} 歲)
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
            />
          )}
        </View>
      </Card>
    </Animated.View>
  );
}

function MetricsStep({
  height,
  setHeight,
  weight,
  setWeight,
  activityLevel,
  setActivityLevel,
}: {
  height: string;
  setHeight: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  activityLevel: ActivityLevel;
  setActivityLevel: (v: ActivityLevel) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.carbs, COLORS.accentDark]} style={styles.stepIconGradient}>
            <Ionicons name="body" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>身體數據</Text>
        <Text style={styles.stepDescription}>用嚟計算你嘅每日營養需求</Text>
      </View>

      <Card style={styles.formCard}>
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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>活動水平</Text>
          <View style={styles.activityList}>
            {ACTIVITY_LEVELS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.activityItem,
                  activityLevel === item.value && styles.activityItemSelected,
                ]}
                onPress={() => setActivityLevel(item.value)}
                activeOpacity={0.8}
              >
                <View style={styles.activityRadio}>
                  {activityLevel === item.value && (
                    <View style={styles.activityRadioInner} />
                  )}
                </View>
                <View style={styles.activityContent}>
                  <Text
                    style={[
                      styles.activityLabel,
                      activityLevel === item.value && styles.activityLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.activityDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

function GoalsStep({
  primaryGoal,
  setPrimaryGoal,
  healthGoals,
  handleHealthGoalToggle,
}: {
  primaryGoal: UserGoal | null;
  setPrimaryGoal: (v: UserGoal) => void;
  healthGoals: HealthGoal[];
  handleHealthGoalToggle: (g: HealthGoal) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.calories, COLORS.caloriesBg]} style={styles.stepIconGradient}>
            <Ionicons name="trophy" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>健康目標</Text>
        <Text style={styles.stepDescription}>選擇你想達成嘅目標</Text>
      </View>

      {/* Primary Goal */}
      <Text style={styles.sectionLabel}>主要目標（選擇一個）</Text>
      <View style={styles.goalsGrid}>
        {PRIMARY_GOALS.map((item, index) => (
          <Animated.View key={item.value} entering={FadeInRight.delay(index * 100)}>
            <TouchableOpacity
              style={[
                styles.goalCard,
                primaryGoal === item.value && styles.goalCardSelected,
                primaryGoal === item.value && { borderColor: item.color },
              ]}
              onPress={() => setPrimaryGoal(item.value)}
              activeOpacity={0.8}
            >
              <View style={[styles.goalIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.goalContent}>
                <Text style={[styles.goalLabel, primaryGoal === item.value && { color: item.color }]}>
                  {item.label}
                </Text>
                <Text style={styles.goalDesc}>{item.desc}</Text>
              </View>
              {primaryGoal === item.value && (
                <View style={[styles.goalCheck, { backgroundColor: item.color }]}>
                  <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Additional Health Goals */}
      <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>其他健康目標（可多選）</Text>
      <Card style={styles.conditionsCard}>
        <View style={styles.conditionsGrid}>
          {HEALTH_GOALS.map((item, index) => (
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 30)}>
              <TouchableOpacity
                style={[
                  styles.conditionChip,
                  healthGoals.includes(item.value) && styles.conditionChipSelected,
                ]}
                onPress={() => handleHealthGoalToggle(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={healthGoals.includes(item.value) ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.conditionText,
                    healthGoals.includes(item.value) && styles.conditionTextSelected,
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

function ConditionsStep({
  conditions,
  handleConditionToggle,
}: {
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
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 30)}>
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

function MedicationsStep({
  medications,
  supplements,
  newMedName,
  setNewMedName,
  newSuppName,
  setNewSuppName,
  addMedication,
  removeMedication,
  addSupplement,
  removeSupplement,
}: {
  medications: Medication[];
  supplements: Supplement[];
  newMedName: string;
  setNewMedName: (v: string) => void;
  newSuppName: string;
  setNewSuppName: (v: string) => void;
  addMedication: () => void;
  removeMedication: (id: string) => void;
  addSupplement: () => void;
  removeSupplement: (id: string) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.fiber, COLORS.fiberBg]} style={styles.stepIconGradient}>
            <Ionicons name="medkit" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>藥物及補充品</Text>
        <Text style={styles.stepDescription}>記錄你正在服用嘅藥物（選填）</Text>
      </View>

      {/* Medications */}
      <Card style={styles.formCard}>
        <Text style={styles.cardTitle}>目前藥物</Text>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, styles.addItemInput]}
            placeholder="藥物名稱"
            placeholderTextColor={COLORS.textTertiary}
            value={newMedName}
            onChangeText={setNewMedName}
            onSubmitEditing={addMedication}
          />
          <TouchableOpacity style={styles.addButton} onPress={addMedication}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        {medications.length > 0 && (
          <View style={styles.itemsList}>
            {medications.map((med) => (
              <View key={med.id} style={styles.listItem}>
                <Ionicons name="medical" size={16} color={COLORS.primary} />
                <Text style={styles.listItemText}>{med.name}</Text>
                <TouchableOpacity onPress={() => removeMedication(med.id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Supplements */}
      <Card style={[styles.formCard, styles.marginTopMd]}>
        <Text style={styles.cardTitle}>營養補充品 / ONS</Text>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, styles.addItemInput]}
            placeholder="補充品名稱"
            placeholderTextColor={COLORS.textTertiary}
            value={newSuppName}
            onChangeText={setNewSuppName}
            onSubmitEditing={addSupplement}
          />
          <TouchableOpacity style={styles.addButton} onPress={addSupplement}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        {supplements.length > 0 && (
          <View style={styles.itemsList}>
            {supplements.map((supp) => (
              <View key={supp.id} style={styles.listItem}>
                <Ionicons name="leaf" size={16} color={COLORS.fiber} />
                <Text style={styles.listItemText}>{supp.name}</Text>
                <TouchableOpacity onPress={() => removeSupplement(supp.id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Animated.View>
  );
}

function DietaryStep({
  dietaryPrefs,
  handleDietaryPrefToggle,
  allergies,
  newAllergy,
  setNewAllergy,
  addAllergy,
  removeAllergy,
}: {
  dietaryPrefs: DietaryPreference[];
  handleDietaryPrefToggle: (p: DietaryPreference) => void;
  allergies: string[];
  newAllergy: string;
  setNewAllergy: (v: string) => void;
  addAllergy: () => void;
  removeAllergy: (a: string) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.carbs, COLORS.carbsBg]} style={styles.stepIconGradient}>
            <Ionicons name="restaurant" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>飲食偏好</Text>
        <Text style={styles.stepDescription}>幫助我哋提供合適嘅食物建議</Text>
      </View>

      {/* Dietary Preferences */}
      <Text style={styles.sectionLabel}>飲食方式</Text>
      <Card style={styles.conditionsCard}>
        <View style={styles.conditionsGrid}>
          {DIETARY_PREFS.map((item, index) => (
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 30)}>
              <TouchableOpacity
                style={[
                  styles.conditionChip,
                  dietaryPrefs.includes(item.value) && styles.conditionChipSelected,
                ]}
                onPress={() => handleDietaryPrefToggle(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={dietaryPrefs.includes(item.value) ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.conditionText,
                    dietaryPrefs.includes(item.value) && styles.conditionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Card>

      {/* Allergies */}
      <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>食物過敏</Text>
      <Card style={styles.formCard}>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, styles.addItemInput]}
            placeholder="輸入過敏食物"
            placeholderTextColor={COLORS.textTertiary}
            value={newAllergy}
            onChangeText={setNewAllergy}
            onSubmitEditing={addAllergy}
          />
          <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        {allergies.length > 0 && (
          <View style={styles.allergiesList}>
            {allergies.map((allergy) => (
              <View key={allergy} style={styles.allergyChip}>
                <Text style={styles.allergyText}>{allergy}</Text>
                <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                  <Ionicons name="close" size={16} color={COLORS.textInverse} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Animated.View>
  );
}

function SummaryStep({
  name,
  gender,
  dateOfBirth,
  height,
  weight,
  activityLevel,
  primaryGoal,
  healthGoals,
  conditions,
  medications,
  supplements,
  dietaryPrefs,
  allergies,
  calculateDailyTargets,
}: {
  name: string;
  gender: Gender | null;
  dateOfBirth: Date;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  primaryGoal: UserGoal | null;
  healthGoals: HealthGoal[];
  conditions: MedicalCondition[];
  medications: Medication[];
  supplements: Supplement[];
  dietaryPrefs: DietaryPreference[];
  allergies: string[];
  calculateDailyTargets: CalculateDailyTargetsFunction;
}) {
  const heightNum = parseFloat(height) || 0;
  const weightNum = parseFloat(weight) || 0;
  const age = calculateAge(dateOfBirth.toISOString().split('T')[0]);
  
  const targets = primaryGoal
    ? calculateDailyTargets({
        height: heightNum,
        weight: weightNum,
        age,
        gender: gender || 'prefer_not_to_say',
        activityLevel,
        goal: primaryGoal,
        healthGoals,
        conditions,
      })
    : null;

  const getGenderLabel = (g: Gender | null) => {
    return GENDERS.find((item) => item.value === g)?.label || '-';
  };

  const getActivityLabel = (a: ActivityLevel) => {
    return ACTIVITY_LEVELS.find((item) => item.value === a)?.label || '-';
  };

  const getGoalLabel = (g: UserGoal | null) => {
    return PRIMARY_GOALS.find((item) => item.value === g)?.label || '-';
  };

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.stepIconGradient}>
            <Ionicons name="sparkles" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>準備就緒！</Text>
        <Text style={styles.stepDescription}>以下係你嘅個人化設定</Text>
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
              {getGenderLabel(gender)} · {age}歲 · {height}cm · {weight}kg
            </Text>
            <Text style={styles.summaryMeta}>
              {getActivityLabel(activityLevel)} · {getGoalLabel(primaryGoal)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Additional Info */}
      {(healthGoals.length > 0 || conditions.filter(c => c !== 'none').length > 0 || medications.length > 0 || supplements.length > 0 || dietaryPrefs.length > 0 || allergies.length > 0) && (
        <Card style={[styles.summaryCard, styles.marginTopMd]}>
          {healthGoals.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>健康目標</Text>
              <Text style={styles.summarySectionText}>
                {healthGoals.map(g => HEALTH_GOALS.find(h => h.value === g)?.label).join('、')}
              </Text>
            </View>
          )}
          {conditions.filter(c => c !== 'none').length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>健康狀況</Text>
              <Text style={styles.summarySectionText}>
                {conditions.filter(c => c !== 'none').map(c => CONDITIONS.find(cond => cond.value === c)?.label).join('、')}
              </Text>
            </View>
          )}
          {medications.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>藥物</Text>
              <Text style={styles.summarySectionText}>
                {medications.map(m => m.name).join('、')}
              </Text>
            </View>
          )}
          {supplements.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>補充品</Text>
              <Text style={styles.summarySectionText}>
                {supplements.map(s => s.name).join('、')}
              </Text>
            </View>
          )}
          {dietaryPrefs.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>飲食偏好</Text>
              <Text style={styles.summarySectionText}>
                {dietaryPrefs.map(p => DIETARY_PREFS.find(pref => pref.value === p)?.label).join('、')}
              </Text>
            </View>
          )}
          {allergies.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>過敏</Text>
              <Text style={styles.summarySectionText}>{allergies.join('、')}</Text>
            </View>
          )}
        </Card>
      )}

      {/* Targets Card */}
      {targets && (
        <Card style={[styles.targetsCard, styles.marginTopMd]}>
          <Text style={styles.targetsTitle}>每日營養目標</Text>
          <View style={styles.targetsList}>
            <TargetRow label="卡路里" value={`${targets.calories.min} - ${targets.calories.max}`} unit="kcal" color={COLORS.calories} icon="flame" />
            <TargetRow label="蛋白質" value={`${targets.protein.min} - ${targets.protein.max}`} unit="g" color={COLORS.protein} icon="fish" />
            <TargetRow label="碳水化合物" value={`${targets.carbs.min} - ${targets.carbs.max}`} unit="g" color={COLORS.carbs} icon="nutrition" />
            <TargetRow label="脂肪" value={`${targets.fat.min} - ${targets.fat.max}`} unit="g" color={COLORS.fat} icon="water" />
            <TargetRow label="纖維" value={`${targets.fiber.min} - ${targets.fiber.max}`} unit="g" color={COLORS.fiber} icon="leaf" />
            <TargetRow label="水分" value={`${Math.round(targets.water / 1000 * 10) / 10}`} unit="L" color={COLORS.sodium} icon="water-outline" />
          </View>
        </Card>
      )}
    </Animated.View>
  );
}

function TargetRow({
  label,
  value,
  unit,
  color,
  icon,
}: {
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

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Margin helpers
  marginTopMd: {
    marginTop: SPACING.md,
  },
  marginTopLg: {
    marginTop: SPACING.lg,
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

  // Section Label
  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },

  // Form Card
  formCard: {
    padding: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.md,
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

  // Gender Grid
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  genderChip: {
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
  genderChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.textSecondary,
  },
  genderTextSelected: {
    color: COLORS.textInverse,
  },

  // Date Button
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  dateButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  ageText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  // Activity List
  activityList: {
    gap: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  activityItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  activityRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  activityLabelSelected: {
    color: COLORS.primary,
  },
  activityDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
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

  // Add Item Row
  addItemRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addItemInput: {
    flex: 1,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsList: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  listItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },

  // Allergies
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error,
    gap: SPACING.xs,
  },
  allergyText: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.textInverse,
  },

  // Summary
  summaryCard: {
    padding: SPACING.lg,
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
  summarySection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  summarySectionTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  summarySectionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
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
