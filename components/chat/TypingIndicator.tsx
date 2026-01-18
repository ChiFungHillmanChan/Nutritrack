/**
 * TypingIndicator Component
 *
 * Displays animated loading dots while the AI assistant
 * is generating a response.
 */

import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/typography';

export function TypingIndicator() {
  return (
    <Animated.View entering={FadeIn} style={styles.loadingContainer}>
      <View style={styles.loadingBubble}>
        <View style={styles.typingDots}>
          <Animated.View
            entering={FadeIn.delay(0)}
            style={[styles.dot, styles.dotOpacity40]}
          />
          <Animated.View
            entering={FadeIn.delay(100)}
            style={[styles.dot, styles.dotOpacity60]}
          />
          <Animated.View
            entering={FadeIn.delay(200)}
            style={[styles.dot, styles.dotOpacity80]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  loadingBubble: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.xs,
    marginLeft: 40,
    ...SHADOWS.sm,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textTertiary,
  },
  dotOpacity40: {
    opacity: 0.4,
  },
  dotOpacity60: {
    opacity: 0.6,
  },
  dotOpacity80: {
    opacity: 0.8,
  },
});
