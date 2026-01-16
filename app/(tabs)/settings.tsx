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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { signOut } from '../../services/auth';
import { Card, NutritionBadge } from '../../components/ui';

export default function SettingsScreen() {
  const { user, signOut: storeSignOut } = useUserStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const handleEditProfile = useCallback(() => {
    Alert.alert('即將推出', '編輯個人資料功能即將推出');
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <Animated.View entering={FadeIn.delay(100)}>
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="pencil" size={16} color={COLORS.textInverse} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.name ?? '用戶'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.height_cm ?? '-'}</Text>
              <Text style={styles.statLabel}>身高 cm</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.weight_kg ?? '-'}</Text>
              <Text style={styles.statLabel}>體重 kg</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getGoalLabel(user?.goal)}</Text>
              <Text style={styles.statLabel}>目標</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Daily Targets */}
      {user?.daily_targets && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card style={styles.targetsCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>每日營養目標</Text>
              </View>
              <TouchableOpacity style={styles.sectionAction}>
                <Text style={styles.sectionActionText}>編輯</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.targetsList}>
              <TargetItem
                icon="flame"
                label="卡路里"
                value={`${user.daily_targets.calories.min} - ${user.daily_targets.calories.max}`}
                unit="kcal"
                color={COLORS.calories}
              />
              <TargetItem
                icon="fish"
                label="蛋白質"
                value={`${user.daily_targets.protein.min} - ${user.daily_targets.protein.max}`}
                unit="g"
                color={COLORS.protein}
              />
              <TargetItem
                icon="nutrition"
                label="碳水化合物"
                value={`${user.daily_targets.carbs.min} - ${user.daily_targets.carbs.max}`}
                unit="g"
                color={COLORS.carbs}
              />
              <TargetItem
                icon="water"
                label="脂肪"
                value={`${user.daily_targets.fat.min} - ${user.daily_targets.fat.max}`}
                unit="g"
                color={COLORS.fat}
              />
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Settings Options */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Card style={styles.settingsCard}>
          <Text style={styles.settingsGroupTitle}>應用程式設定</Text>

          {/* Notifications */}
          <SettingRow
            icon="notifications"
            iconBg={COLORS.caloriesBg}
            iconColor={COLORS.calories}
            label="通知提醒"
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: COLORS.backgroundTertiary,
                  true: COLORS.primaryMuted,
                }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textMuted}
              />
            }
          />

          {/* Language */}
          <SettingRow
            icon="language"
            iconBg={COLORS.proteinBg}
            iconColor={COLORS.protein}
            label="語言"
            value="繁體中文"
            onPress={() => {}}
          />

          {/* Theme */}
          <SettingRow
            icon="moon"
            iconBg={COLORS.fatBg}
            iconColor={COLORS.fat}
            label="外觀主題"
            value="淺色模式"
            onPress={() => {}}
          />
        </Card>
      </Animated.View>

      {/* Support & Info */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Card style={styles.settingsCard}>
          <Text style={styles.settingsGroupTitle}>支援及資訊</Text>

          <SettingRow
            icon="help-circle"
            iconBg={COLORS.carbsBg}
            iconColor={COLORS.carbs}
            label="幫助中心"
            onPress={() => {}}
          />

          <SettingRow
            icon="document-text"
            iconBg={COLORS.fiberBg}
            iconColor={COLORS.fiber}
            label="私隱政策"
            onPress={() => {}}
          />

          <SettingRow
            icon="information-circle"
            iconBg={COLORS.sodiumBg}
            iconColor={COLORS.sodium}
            label="關於 Nutritrack"
            onPress={() => {}}
          />
        </Card>
      </Animated.View>

      {/* Sign Out */}
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>登出</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Version */}
      <Animated.View entering={FadeIn.delay(600)}>
        <Text style={styles.versionText}>Nutritrack v1.0.0</Text>
        <Text style={styles.copyrightText}>Made with ❤️ for healthy living</Text>
      </Animated.View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Helper Components
function TargetItem({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.targetItem}>
      <View style={[styles.targetIcon, { backgroundColor: color + '15' }]}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={color}
        />
      </View>
      <View style={styles.targetInfo}>
        <Text style={styles.targetLabel}>{label}</Text>
        <View style={styles.targetValueRow}>
          <Text style={[styles.targetValue, { color }]}>{value}</Text>
          <Text style={styles.targetUnit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  trailing,
  onPress,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={iconColor}
        />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {trailing}
        {onPress && !trailing && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.textTertiary}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
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
    padding: SPACING.lg,
  },

  // Profile Header
  profileHeader: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  profileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textInverse,
  },
  statLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: 'rgba(255,255,255,0.7)',
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Targets Card
  targetsCard: {
    marginBottom: SPACING.lg,
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
  sectionAction: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  sectionActionText: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.primary,
  },
  targetsList: {
    gap: SPACING.md,
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  targetInfo: {
    flex: 1,
  },
  targetLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  targetValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  targetValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
  },
  targetUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },

  // Settings Card
  settingsCard: {
    marginBottom: SPACING.lg,
  },
  settingsGroupTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },

  // Sign Out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  signOutText: {
    ...TYPOGRAPHY.button,
    color: COLORS.error,
  },

  // Version
  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  copyrightText: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
