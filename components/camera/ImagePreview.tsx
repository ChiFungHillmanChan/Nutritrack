/**
 * ImagePreview - Displays captured/selected image with controls
 *
 * Shows the image preview with a reset button and optional
 * confidence badge when analysis is complete.
 */

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

interface ImagePreviewProps {
  imageUri: string;
  confidence?: number;
  onReset: () => void;
}

export function ImagePreview({ imageUri, confidence, onReset }: ImagePreviewProps) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.imagePreview}>
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.imageOverlay}
        />
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onReset}
          accessibilityLabel={t('accessibility.clearSelectedImage')}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={20} color={COLORS.textInverse} />
        </TouchableOpacity>
        {confidence !== undefined && (
          <View style={styles.confidenceBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.confidenceText}>
              {Math.round(confidence * 100)}% {t('camera.accuracy')}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  imagePreview: {
    position: 'relative',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  resetButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  confidenceText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.success,
  },
});
