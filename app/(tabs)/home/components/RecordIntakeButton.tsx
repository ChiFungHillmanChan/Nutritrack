/**
 * RecordIntakeButton Component
 *
 * Gradient button that navigates to the camera for food logging.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, GRADIENTS, SHADOWS } from '../../../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../../../constants/typography';
import { useTranslation } from '../../../../hooks/useTranslation';

export function RecordIntakeButton() {
  const { t } = useTranslation();

  const handlePress = () => {
    router.push('/(tabs)/camera');
  };

  return (
    <Animated.View entering={FadeInDown.delay(300).springify()}>
      <TouchableOpacity
        style={styles.recordButton}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityLabel={t('home.recordIntake')}
        accessibilityRole="button"
        accessibilityHint={t('accessibility.navigateToCamera')}
      >
        <LinearGradient
          colors={GRADIENTS.primary}
          style={styles.recordButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.recordButtonText}>{t('home.recordIntake')}</Text>
          <View style={styles.recordButtonIcon}>
            <Ionicons name="camera" size={20} color={COLORS.primary} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  recordButton: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  recordButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  recordButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.textInverse,
    marginRight: SPACING.sm,
  },
  recordButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
