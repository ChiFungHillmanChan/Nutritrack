/**
 * CaptureSection - Camera placeholder and capture buttons
 *
 * Displays the initial state before an image is selected,
 * with buttons to take a photo or choose from gallery.
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';

interface CaptureSectionProps {
  onTakePhoto: () => void;
  onPickImage: () => void;
}

export function CaptureSection({ onTakePhoto, onPickImage }: CaptureSectionProps) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeIn} style={styles.captureSection}>
      <Card style={styles.captureCard} variant="elevated">
        <View style={styles.cameraPlaceholder}>
          <LinearGradient
            colors={[COLORS.primaryMuted, COLORS.successLight]}
            style={styles.placeholderGradient}
          >
            <View style={styles.placeholderIcon}>
              <Ionicons name="camera" size={48} color={COLORS.primary} />
            </View>
          </LinearGradient>
          <Text style={styles.placeholderTitle}>{t('camera.placeholderTitle')}</Text>
          <Text style={styles.placeholderSubtitle}>
            {t('camera.placeholderSubtitle')}
          </Text>
        </View>

        <View style={styles.captureButtons}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={onTakePhoto}
            activeOpacity={0.8}
            accessibilityLabel={t('camera.takePhoto')}
            accessibilityRole="button"
            accessibilityHint={t('accessibility.openCameraToTakePhoto')}
          >
            <LinearGradient
              colors={GRADIENTS.primary}
              style={styles.captureButtonGradient}
            >
              <Ionicons name="camera" size={24} color={COLORS.textInverse} />
              <Text style={styles.captureButtonText}>{t('camera.takePhoto')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, styles.secondaryButton]}
            onPress={onPickImage}
            activeOpacity={0.8}
            accessibilityLabel={t('camera.choosePhoto')}
            accessibilityRole="button"
            accessibilityHint={t('accessibility.openGalleryToChoosePhoto')}
          >
            <View style={styles.secondaryButtonInner}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>{t('camera.choosePhoto')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  captureSection: {
    marginBottom: SPACING.lg,
  },
  captureCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },
  placeholderGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  placeholderTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  placeholderSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  captureButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
  },
  captureButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  captureButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.colored(COLORS.primary),
  },
  captureButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  secondaryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
  },
});
