/**
 * Habits Tab Screen
 * 
 * Grid of trackable habits with quick-log functionality.
 */

import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { useHabitStore } from '../../stores/habitStore';
import { Card, CircularProgress } from '../../components/ui';
import type { HabitType, MoodLevel, BristolStoolType } from '../../types';

// Habit card configuration
interface HabitConfig {
  type: HabitType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  unit?: string;
  quickAdd?: number[];
  maxValue?: number;
}

const HABIT_CONFIGS: HabitConfig[] = [
  {
    type: 'hydration',
    label: '飲水',
    icon: 'water',
    color: COLORS.sodium,
    unit: 'ml',
    quickAdd: [250, 500],
    maxValue: 3000,
  },
  {
    type: 'sleep_duration',
    label: '睡眠',
    icon: 'moon',
    color: COLORS.protein,
    unit: '小時',
    maxValue: 12,
  },
  {
    type: 'mood',
    label: '心情',
    icon: 'happy',
    color: COLORS.carbs,
    maxValue: 5,
  },
  {
    type: 'five_a_day',
    label: '蔬果',
    icon: 'nutrition',
    color: COLORS.fiber,
    unit: '份',
    quickAdd: [1],
    maxValue: 5,
  },
  {
    type: 'weight',
    label: '體重',
    icon: 'scale',
    color: COLORS.calories,
    unit: 'kg',
  },
  {
    type: 'bowels',
    label: '腸道',
    icon: 'fitness',
    color: COLORS.fat,
  },
];

// Mood emojis
const MOOD_EMOJIS: Record<MoodLevel, { emoji: string; label: string }> = {
  1: { emoji: '😢', label: '很差' },
  2: { emoji: '😔', label: '不好' },
  3: { emoji: '😐', label: '一般' },
  4: { emoji: '😊', label: '好' },
  5: { emoji: '😄', label: '很好' },
};

// Bristol stool types
const BRISTOL_TYPES: Record<BristolStoolType, { label: string; desc: string }> = {
  1: { label: '第1型', desc: '硬塊狀' },
  2: { label: '第2型', desc: '香腸狀但有結塊' },
  3: { label: '第3型', desc: '香腸狀有裂紋' },
  4: { label: '第4型', desc: '光滑香腸狀' },
  5: { label: '第5型', desc: '軟塊狀' },
  6: { label: '第6型', desc: '糊狀' },
  7: { label: '第7型', desc: '水狀' },
};

export default function HabitsScreen() {
  const { user } = useUserStore();
  const { todayLogs, fetchTodayLogs, isLoading, logHydration, logMood, logFiveADay, logSleep, logWeight, logBowels, getTodayHydration } = useHabitStore();

  const [selectedHabit, setSelectedHabit] = useState<HabitConfig | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchTodayLogs(user.id);
    }
  }, [user?.id, fetchTodayLogs]);

  const handleRefresh = useCallback(() => {
    if (user?.id) {
      fetchTodayLogs(user.id);
    }
  }, [user?.id, fetchTodayLogs]);

  const handleQuickAdd = useCallback(async (habit: HabitConfig, value: number) => {
    if (!user?.id) return;

    switch (habit.type) {
      case 'hydration':
        await logHydration(user.id, value);
        break;
      case 'five_a_day':
        await logFiveADay(user.id, value);
        break;
    }
  }, [user?.id, logHydration, logFiveADay]);

  const openHabitModal = (habit: HabitConfig) => {
    setSelectedHabit(habit);
    setInputValue('');
    setModalVisible(true);
  };

  const handleLogHabit = async () => {
    if (!user?.id || !selectedHabit) return;

    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      Alert.alert('錯誤', '請輸入有效數字');
      return;
    }

    let success = false;
    switch (selectedHabit.type) {
      case 'hydration':
        success = await logHydration(user.id, value);
        break;
      case 'sleep_duration':
        success = await logSleep(user.id, value);
        break;
      case 'weight':
        success = await logWeight(user.id, value);
        break;
      case 'five_a_day':
        success = await logFiveADay(user.id, value);
        break;
      default:
        Alert.alert('錯誤', '暫不支援此習慣類型');
    }

    if (success) {
      setModalVisible(false);
      setSelectedHabit(null);
    }
  };

  const handleMoodSelect = async (mood: MoodLevel) => {
    if (!user?.id) return;
    await logMood(user.id, mood);
    setModalVisible(false);
    setSelectedHabit(null);
  };

  const handleBowelSelect = async (type: BristolStoolType) => {
    if (!user?.id) return;
    await logBowels(user.id, type);
    setModalVisible(false);
    setSelectedHabit(null);
  };

  const getHabitValue = (habitType: HabitType): number | string => {
    if (habitType === 'hydration') {
      return getTodayHydration();
    }
    const log = todayLogs.find((l) => l.habit_type === habitType);
    return log?.value ?? 0;
  };

  const getHabitProgress = (habit: HabitConfig): number => {
    const value = Number(getHabitValue(habit.type)) || 0;
    const max = habit.maxValue || 100;
    return Math.min((value / max) * 100, 100);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>習慣追蹤</Text>
          <Text style={styles.headerSubtitle}>建立健康習慣，每日堅持</Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Habit Grid */}
        <View style={styles.habitGrid}>
          {HABIT_CONFIGS.map((habit, index) => (
            <Animated.View
              key={habit.type}
              entering={FadeInDown.delay(index * 100).springify()}
              style={styles.habitCardContainer}
            >
              <HabitCard
                habit={habit}
                value={getHabitValue(habit.type)}
                progress={getHabitProgress(habit)}
                onPress={() => openHabitModal(habit)}
                onQuickAdd={habit.quickAdd ? (v) => handleQuickAdd(habit, v) : undefined}
              />
            </Animated.View>
          ))}
        </View>

        {/* Today's Summary */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryTitleRow}>
                <View style={styles.summaryDot} />
                <Text style={styles.summaryTitle}>今日記錄</Text>
              </View>
              <Text style={styles.summaryCount}>{todayLogs.length} 項</Text>
            </View>

            {todayLogs.length > 0 ? (
              <View style={styles.logsList}>
                {todayLogs.map((log, index) => {
                  const config = HABIT_CONFIGS.find((h) => h.type === log.habit_type);
                  return (
                    <Animated.View
                      key={log.id}
                      entering={FadeInRight.delay(index * 50)}
                      style={styles.logItem}
                    >
                      <View style={[styles.logIcon, { backgroundColor: (config?.color || COLORS.primary) + '15' }]}>
                        <Ionicons
                          name={config?.icon || 'checkmark'}
                          size={16}
                          color={config?.color || COLORS.primary}
                        />
                      </View>
                      <Text style={styles.logLabel}>{config?.label || log.habit_type}</Text>
                      <Text style={[styles.logValue, { color: config?.color || COLORS.primary }]}>
                        {log.value} {config?.unit || ''}
                      </Text>
                    </Animated.View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>今日未有記錄</Text>
                <Text style={styles.emptySubtext}>點擊上面嘅卡片開始追蹤</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Input Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                記錄{selectedHabit?.label}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedHabit?.type === 'mood' ? (
              <View style={styles.moodGrid}>
                {([1, 2, 3, 4, 5] as MoodLevel[]).map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={styles.moodButton}
                    onPress={() => handleMoodSelect(mood)}
                  >
                    <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood].emoji}</Text>
                    <Text style={styles.moodLabel}>{MOOD_EMOJIS[mood].label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : selectedHabit?.type === 'bowels' ? (
              <ScrollView style={styles.bristolList}>
                {([1, 2, 3, 4, 5, 6, 7] as BristolStoolType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.bristolItem}
                    onPress={() => handleBowelSelect(type)}
                  >
                    <Text style={styles.bristolLabel}>{BRISTOL_TYPES[type].label}</Text>
                    <Text style={styles.bristolDesc}>{BRISTOL_TYPES[type].desc}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={`輸入${selectedHabit?.label || ''}數值`}
                    placeholderTextColor={COLORS.textTertiary}
                    value={inputValue}
                    onChangeText={setInputValue}
                    keyboardType="numeric"
                    autoFocus
                  />
                  {selectedHabit?.unit && (
                    <Text style={styles.inputUnit}>{selectedHabit.unit}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={handleLogHabit}>
                  <LinearGradient
                    colors={GRADIENTS.primary}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitText}>記錄</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Habit Card Component
function HabitCard({
  habit,
  value,
  progress: _progress,
  onPress,
  onQuickAdd,
}: {
  habit: HabitConfig;
  value: number | string;
  progress: number;
  onPress: () => void;
  onQuickAdd?: (value: number) => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card style={styles.habitCard}>
        <View style={styles.habitCardContent}>
          <View style={styles.habitCardHeader}>
            <View style={[styles.habitIcon, { backgroundColor: habit.color + '15' }]}>
              <Ionicons name={habit.icon} size={20} color={habit.color} />
            </View>
            {habit.maxValue && (
              <CircularProgress
                value={Number(value) || 0}
                max={habit.maxValue}
                size={36}
                strokeWidth={3}
                color={habit.color}
                showValue={false}
              />
            )}
          </View>
          
          <Text style={styles.habitLabel}>{habit.label}</Text>
          <View style={styles.habitValueRow}>
            <Text style={[styles.habitValue, { color: habit.color }]}>
              {value || 0}
            </Text>
            {habit.unit && (
              <Text style={styles.habitUnit}>{habit.unit}</Text>
            )}
          </View>
        </View>

        <View style={styles.quickAddContainer}>
          {onQuickAdd && habit.quickAdd ? (
            <View style={styles.quickAddRow}>
              {habit.quickAdd.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.quickAddButton, { borderColor: habit.color }]}
                  onPress={() => onQuickAdd(v)}
                >
                  <Text style={[styles.quickAddText, { color: habit.color }]}>
                    +{v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Header
  header: {
    ...SHADOWS.lg,
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.8)',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },

  // Habit Grid
  habitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  habitCardContainer: {
    width: '47%',
  },
  habitCard: {
    padding: SPACING.md,
    height: 150,
  },
  habitCardContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  habitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  habitIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  habitValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  habitValue: {
    ...TYPOGRAPHY.h3,
  },
  habitUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  quickAddContainer: {
    height: 28,
    justifyContent: 'flex-end',
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  quickAddButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  quickAddText: {
    ...TYPOGRAPHY.captionMedium,
  },

  // Summary Card
  summaryCard: {
    padding: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  summaryTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  summaryCount: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  logsList: {
    gap: SPACING.sm,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  logLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  logValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },

  // Modal
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

  // Mood Grid
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
  },
  moodButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  moodLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  // Bristol List
  bristolList: {
    maxHeight: 300,
  },
  bristolItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  bristolLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  bristolDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
