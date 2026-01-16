/**
 * Settings Screen
 *
 * Main settings page with profile, app settings, and data management.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { signOut } from '../../services/auth';
import { Card } from '../../components/ui';
import { SettingRow, ProfileHeader } from '../../components/settings';
import { settingsRepository } from '../../services/database';

export default function SettingsScreen() {
  const { user, signOut: storeSignOut } = useUserStore();
  
  // App settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataStats, setDataStats] = useState({
    foodLogsCount: 0,
    chatMessagesCount: 0,
    habitLogsCount: 0,
    exerciseLogsCount: 0,
  });

  // Load settings and stats on mount
  useEffect(() => {
    const settings = settingsRepository.getAllSettings();
    setNotificationsEnabled(settings.notifications_enabled);
    
    if (user?.id) {
      const stats = settingsRepository.getDatabaseStats(user.id);
      setDataStats(stats);
    }
  }, [user?.id]);

  // Handle notification toggle
  const handleNotificationToggle = useCallback((value: boolean) => {
    setNotificationsEnabled(value);
    settingsRepository.setSetting('notifications_enabled', value);
  }, []);

  // Handle profile edit
  const handleEditProfile = useCallback(() => {
    router.push('/profile-edit' as never);
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    Alert.alert('登出', '你確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '登出',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          await storeSignOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [storeSignOut]);

  // Handle clear data
  const handleClearData = useCallback(() => {
    Alert.alert(
      '清除所有數據',
      '這將刪除你的所有食物記錄、聊天記錄和習慣數據。此操作無法撤銷。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: () => {
            if (user?.id) {
              const success = settingsRepository.clearAllUserData(user.id);
              if (success) {
                setDataStats({
                  foodLogsCount: 0,
                  chatMessagesCount: 0,
                  habitLogsCount: 0,
                  exerciseLogsCount: 0,
                });
                Alert.alert('完成', '所有數據已清除');
              } else {
                Alert.alert('錯誤', '清除數據失敗');
              }
            }
          },
        },
      ]
    );
  }, [user?.id]);

  const totalRecords =
    dataStats.foodLogsCount +
    dataStats.chatMessagesCount +
    dataStats.habitLogsCount +
    dataStats.exerciseLogsCount;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <Animated.View entering={FadeIn.delay(100)}>
        <ProfileHeader user={user} onEditPress={handleEditProfile} />
      </Animated.View>

      {/* Daily Targets Summary */}
      {user?.daily_targets && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>每日營養目標</Text>
              </View>
            </View>

            <View style={styles.targetsList}>
              <TargetRow
                label="卡路里"
                value={`${user.daily_targets.calories.min} - ${user.daily_targets.calories.max}`}
                unit="kcal"
                color={COLORS.calories}
              />
              <TargetRow
                label="蛋白質"
                value={`${user.daily_targets.protein.min} - ${user.daily_targets.protein.max}`}
                unit="g"
                color={COLORS.protein}
              />
              <TargetRow
                label="碳水化合物"
                value={`${user.daily_targets.carbs.min} - ${user.daily_targets.carbs.max}`}
                unit="g"
                color={COLORS.carbs}
              />
              <TargetRow
                label="脂肪"
                value={`${user.daily_targets.fat.min} - ${user.daily_targets.fat.max}`}
                unit="g"
                color={COLORS.fat}
              />
            </View>
          </Card>
        </Animated.View>
      )}

      {/* App Settings */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Card style={styles.card}>
          <Text style={styles.groupTitle}>應用程式設定</Text>

          <SettingRow
            icon="notifications"
            iconBg={COLORS.caloriesBg}
            iconColor={COLORS.calories}
            label="通知提醒"
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{
                  false: COLORS.backgroundTertiary,
                  true: COLORS.primaryMuted,
                }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textMuted}
              />
            }
          />

          <SettingRow
            icon="language"
            iconBg={COLORS.proteinBg}
            iconColor={COLORS.protein}
            label="語言"
            value="繁體中文"
            onPress={() => Alert.alert('語言', '目前只支援繁體中文')}
          />
        </Card>
      </Animated.View>

      {/* Data Management */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Card style={styles.card}>
          <Text style={styles.groupTitle}>數據管理</Text>

          <View style={styles.statsRow}>
            <StatItem label="食物記錄" count={dataStats.foodLogsCount} />
            <StatItem label="聊天記錄" count={dataStats.chatMessagesCount} />
            <StatItem label="習慣記錄" count={dataStats.habitLogsCount} />
          </View>

          <SettingRow
            icon="trash"
            iconBg={COLORS.errorLight}
            iconColor={COLORS.error}
            label="清除所有數據"
            value={`${totalRecords} 筆記錄`}
            onPress={handleClearData}
            danger
          />
        </Card>
      </Animated.View>

      {/* Support & Info */}
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <Card style={styles.card}>
          <Text style={styles.groupTitle}>支援及資訊</Text>

          <SettingRow
            icon="document-text"
            iconBg={COLORS.fiberBg}
            iconColor={COLORS.fiber}
            label="私隱政策"
            onPress={() => router.push('/privacy-policy' as never)}
          />

          <SettingRow
            icon="information-circle"
            iconBg={COLORS.sodiumBg}
            iconColor={COLORS.sodium}
            label="關於 Nutritrack"
            onPress={() => router.push('/about' as never)}
          />
        </Card>
      </Animated.View>

      {/* Sign Out */}
      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <Card style={styles.signOutCard}>
          <SettingRow
            icon="log-out"
            iconBg={COLORS.errorLight}
            iconColor={COLORS.error}
            label="登出"
            onPress={handleSignOut}
            showChevron={false}
            danger
          />
        </Card>
      </Animated.View>

      {/* Version */}
      <Animated.View entering={FadeIn.delay(700)}>
        <Text style={styles.versionText}>Nutritrack v1.0.0</Text>
      </Animated.View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Helper Components
function TargetRow({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.targetRow}>
      <View style={[styles.targetDot, { backgroundColor: color }]} />
      <Text style={styles.targetLabel}>{label}</Text>
      <Text style={[styles.targetValue, { color }]}>{value}</Text>
      <Text style={styles.targetUnit}>{unit}</Text>
    </View>
  );
}

function StatItem({ label, count }: { label: string; count: number }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  signOutCard: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  groupTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  targetsList: {
    gap: SPACING.sm,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  targetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
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
    width: 35,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statCount: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
