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
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { signOut } from '../../services/auth';
import { Card } from '../../components/ui';
import { GoalsCard } from '../../components/profile';
import { settingsRepository } from '../../services/database';
import { useTranslation } from '../../hooks/useTranslation';
import {
  ProfileHeader,
  TimelineCard,
  SupportInfoSection,
  DataManagementSection,
  SettingRow,
  type DataStats,
} from '../../components/settings-page';

export default function ProfileScreen() {
  const { user, signOut: storeSignOut } = useUserStore();
  const { t } = useTranslation();

  const [lastSyncTime, setLastSyncTime] = useState<string>('--');
  const [dataStats, setDataStats] = useState<DataStats>({
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

  // Handle clear data
  const handleClearData = useCallback(() => {
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
  }, [user?.id, t]);

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
        <ProfileHeader
          userName={user?.name}
          lastSyncTime={lastSyncTime}
          onEditProfile={handleEditProfile}
        />
      </Animated.View>

      {/* My Goals */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <GoalsCard goals={user?.health_goals || []} style={styles.goalsCard} />
      </Animated.View>

      {/* Timeline Entry Card */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <TimelineCard totalRecords={totalRecords} onPress={handleTimelinePress} />
      </Animated.View>

      {/* Support & Info */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <SupportInfoSection />
      </Animated.View>

      {/* Data Management */}
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <DataManagementSection dataStats={dataStats} onClearData={handleClearData} />
      </Animated.View>

      {/* Sign Out */}
      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <Card style={styles.signOutCard}>
          <SettingRow
            icon="log-out"
            iconBackgroundColor={COLORS.errorLight}
            iconColor={COLORS.error}
            label={t('auth.logout.button')}
            onPress={handleSignOut}
            showChevron={false}
            isDanger
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  goalsCard: {
    marginBottom: SPACING.lg,
  },
  signOutCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
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
