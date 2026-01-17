/**
 * Profile Screen - Redesigned
 * 
 * User profile page with:
 * - Profile header with avatar and sync time
 * - Quick actions row (5 icons)
 * - My Goals section with checkboxes
 * - Timeline entry card
 * - Language switcher
 */

import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { signOut } from '../../services/auth';
import { Card } from '../../components/ui';
import { QuickActions, GoalsCard } from '../../components/profile';
import { LanguageSwitcher } from '../../components/settings';
import { settingsRepository } from '../../services/database';
import { useTranslation } from '../../hooks/useTranslation';

export default function ProfileScreen() {
  const { user, signOut: storeSignOut } = useUserStore();
  const { t } = useTranslation();
  
  const [lastSyncTime, setLastSyncTime] = useState<string>('--');
  const [dataStats, setDataStats] = useState({
    foodLogsCount: 0,
    chatMessagesCount: 0,
    habitLogsCount: 0,
    exerciseLogsCount: 0,
  });

  // Load stats on mount
  useEffect(() => {
    if (user?.id) {
      const stats = settingsRepository.getDatabaseStats(user.id);
      setDataStats(stats);
      
      // Set last sync time to now (for demo purposes)
      const now = new Date();
      setLastSyncTime(
        `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
    }
  }, [user?.id]);

  // Handle profile edit
  const handleEditProfile = useCallback(() => {
    router.push('/profile-edit' as never);
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    Alert.alert(t('auth.logout.title'), t('auth.logout.confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout.button'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          await storeSignOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [storeSignOut, t]);

  // Handle timeline navigation
  const handleTimelinePress = useCallback(() => {
    router.push('/timeline' as never);
  }, []);

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
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <TouchableOpacity onPress={handleEditProfile}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Name and Sync Time */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name ?? t('home.userDefault')}</Text>
              <Text style={styles.syncTime}>
                {t('settings.lastSync')}: {lastSyncTime}
              </Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="sync" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <QuickActions />
        </Card>
      </Animated.View>

      {/* My Goals */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <GoalsCard
          goals={user?.health_goals || []}
          style={styles.goalsCard}
        />
      </Animated.View>

      {/* Timeline Entry Card */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <TouchableOpacity onPress={handleTimelinePress} activeOpacity={0.8}>
          <Card style={styles.timelineCard}>
            <View style={styles.timelineContent}>
              <View style={styles.timelineIcon}>
                <Ionicons name="document-text" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.timelineInfo}>
                <Text style={styles.timelineTitle}>{t('settings.timeline.title')}</Text>
                <Text style={styles.timelineSubtitle}>
                  {t('settings.timeline.subtitle')}
                </Text>
                <Text style={styles.timelineCount}>
                  {t('settings.timeline.totalRecords', { count: totalRecords })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>

      {/* Support & Info */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Card style={styles.card}>
          <Text style={styles.groupTitle}>{t('settings.supportInfo')}</Text>

          {/* Language Switcher */}
          <LanguageSwitcher />

          <SettingRow
            icon="document-text"
            iconBg={COLORS.fiberBg}
            iconColor={COLORS.fiber}
            label={t('settings.privacyPolicy')}
            onPress={() => router.push('/privacy-policy' as never)}
          />

          <SettingRow
            icon="information-circle"
            iconBg={COLORS.sodiumBg}
            iconColor={COLORS.sodium}
            label={t('settings.about')}
            onPress={() => router.push('/about' as never)}
          />

          <SettingRow
            icon="help-circle"
            iconBg={COLORS.infoBg}
            iconColor={COLORS.info}
            label={t('settings.faq')}
            onPress={() => Alert.alert(t('settings.faq'), t('settings.faqComingSoon'))}
          />
        </Card>
      </Animated.View>

      {/* Data Management */}
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <Card style={styles.card}>
          <Text style={styles.groupTitle}>{t('settings.dataManagement')}</Text>

          <View style={styles.statsRow}>
            <StatItem label={t('settings.foodLogs')} count={dataStats.foodLogsCount} />
            <StatItem label={t('settings.chatLogs')} count={dataStats.chatMessagesCount} />
            <StatItem label={t('settings.habitLogs')} count={dataStats.habitLogsCount} />
          </View>

          <SettingRow
            icon="trash"
            iconBg={COLORS.errorLight}
            iconColor={COLORS.error}
            label={t('settings.clearAllData')}
            value={`${totalRecords} ${t('common.items')}`}
            onPress={() => {
              Alert.alert(
                t('settings.clearConfirm.title'),
                t('settings.clearConfirm.message'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('settings.clearConfirm.clear'),
                    style: 'destructive',
                    onPress: () => {
                      if (user?.id) {
                        settingsRepository.clearAllUserData(user.id);
                        setDataStats({
                          foodLogsCount: 0,
                          chatMessagesCount: 0,
                          habitLogsCount: 0,
                          exerciseLogsCount: 0,
                        });
                        Alert.alert(t('settings.cleared'), t('settings.clearedMessage'));
                      }
                    },
                  },
                ]
              );
            }}
            danger
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
            label={t('auth.logout.button')}
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
function SettingRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
        {label}
      </Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
      )}
    </TouchableOpacity>
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

  // Profile Card
  profileCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  syncTime: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Goals Card
  goalsCard: {
    marginBottom: SPACING.lg,
  },

  // Timeline Card
  timelineCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primaryMuted,
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  timelineSubtitle: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  timelineCount: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Cards
  card: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  signOutCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  groupTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
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
  settingLabelDanger: {
    color: COLORS.error,
  },
  settingValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },

  // Stats
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

  // Version
  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
