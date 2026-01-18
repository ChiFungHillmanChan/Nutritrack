/**
 * ProfileHeader Component
 *
 * Displays the user profile header with avatar, name, sync time,
 * and edit button. Includes QuickActions component.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../../components/ui';
import { QuickActions } from '../../components/profile';
import { useTranslation } from '../../hooks/useTranslation';

export interface ProfileHeaderProps {
  userName: string | undefined;
  lastSyncTime: string;
  onEditProfile: () => void;
}

export function ProfileHeader({
  userName,
  lastSyncTime,
  onEditProfile,
}: ProfileHeaderProps) {
  const { t } = useTranslation();
  const displayName = userName ?? t('home.userDefault');
  const avatarInitial = userName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeader}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={onEditProfile}
          accessibilityLabel={t('accessibility.editProfile')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.tapToEditProfile')}
        >
          <LinearGradient colors={GRADIENTS.primary} style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Name and Sync Time */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.syncTime}>
            {t('settings.lastSync')}: {lastSyncTime}
          </Text>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditProfile}
          accessibilityLabel={t('accessibility.syncData')}
          accessibilityRole="button"
        >
          <Ionicons name="sync" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <QuickActions />
    </Card>
  );
}

const styles = StyleSheet.create({
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
});
