import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { signOut } from '../../services/auth';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, signOut: storeSignOut } = useUserStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      '登出',
      '你確定要登出嗎？',
      [
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
      ]
    );
  }, [storeSignOut]);

  const handleEditProfile = useCallback(() => {
    // TODO: Navigate to edit profile screen
    Alert.alert('即將推出', '編輯個人資料功能即將推出');
  }, []);

  const handleNotificationSettings = useCallback(() => {
    // TODO: Navigate to notification settings
    Alert.alert('即將推出', '通知設定功能即將推出');
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name ?? '用戶'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>你嘅資料</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.height_cm ?? '-'}</Text>
            <Text style={styles.statLabel}>身高 (cm)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.weight_kg ?? '-'}</Text>
            <Text style={styles.statLabel}>體重 (kg)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getGoalLabel(user?.goal)}</Text>
            <Text style={styles.statLabel}>目標</Text>
          </View>
        </View>
      </View>

      {/* Daily Targets Section */}
      {user?.daily_targets && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>每日目標</Text>
          <View style={styles.targetsList}>
            <TargetItem
              label="卡路里"
              value={`${user.daily_targets.calories.min} - ${user.daily_targets.calories.max} kcal`}
              icon="flame"
              color={COLORS.calories}
            />
            <TargetItem
              label="蛋白質"
              value={`${user.daily_targets.protein.min} - ${user.daily_targets.protein.max} g`}
              icon="fish"
              color={COLORS.protein}
            />
            <TargetItem
              label="碳水化合物"
              value={`${user.daily_targets.carbs.min} - ${user.daily_targets.carbs.max} g`}
              icon="nutrition"
              color={COLORS.carbs}
            />
            <TargetItem
              label="脂肪"
              value={`${user.daily_targets.fat.min} - ${user.daily_targets.fat.max} g`}
              icon="water"
              color={COLORS.fat}
            />
          </View>
        </View>
      )}

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>設定</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={22} color={COLORS.text} />
              <Text style={styles.settingLabel}>通知提醒</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={22} color={COLORS.text} />
              <Text style={styles.settingLabel}>語言</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>繁體中文</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={22} color={COLORS.text} />
              <Text style={styles.settingLabel}>幫助中心</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text" size={22} color={COLORS.text} />
              <Text style={styles.settingLabel}>私隱政策</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out" size={20} color={COLORS.error} />
        <Text style={styles.signOutText}>登出</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.versionText}>Nutritrack v1.0.0</Text>
    </ScrollView>
  );
}

function TargetItem({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <View style={styles.targetItem}>
      <View style={[styles.targetIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={color} />
      </View>
      <View style={styles.targetInfo}>
        <Text style={styles.targetLabel}>{label}</Text>
        <Text style={styles.targetValue}>{value}</Text>
      </View>
    </View>
  );
}

function getGoalLabel(goal?: string): string {
  const labels: Record<string, string> = {
    lose_weight: '減重',
    gain_weight: '增重',
    maintain: '維持',
    build_muscle: '增肌',
  };
  return goal ? labels[goal] ?? '-' : '-';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textInverse,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    ...TYPOGRAPHY.h4,
  },
  profileEmail: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  section: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    marginTop: 4,
  },
  targetsList: {
    gap: 12,
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  targetLabel: {
    ...TYPOGRAPHY.caption,
  },
  targetValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
  settingsList: {
    gap: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingLabel: {
    ...TYPOGRAPHY.body,
  },
  settingValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  signOutText: {
    ...TYPOGRAPHY.button,
    color: COLORS.error,
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    marginBottom: 24,
  },
});
