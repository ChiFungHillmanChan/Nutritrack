/**
 * ChatBubble Component
 *
 * Renders a single chat message bubble with avatar (for assistant),
 * formatted text with bold support, and timestamp.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Layout, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { COLORS, GRADIENTS, SHADOWS } from '../../../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../../../constants/typography';
import { ChatMessage } from '../../../../stores/chatStore';
import { parseMarkdownText } from '../utils/parseMarkdown';

interface ChatBubbleProps {
  message: ChatMessage;
  messageIndex: number;
  maxBubbleWidth: number;
  language: string;
}

/**
 * Format timestamp for display in the message bubble.
 */
function formatTime(date: Date, language: string): string {
  return date.toLocaleTimeString(language === 'zh-TW' ? 'zh-HK' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Render formatted text with bold markdown support.
 */
function renderFormattedText(content: string, isUserMessage: boolean) {
  const segments = parseMarkdownText(content);
  return (
    <Text style={[styles.messageText, isUserMessage && styles.userMessageText]}>
      {segments.map((segment, segmentIndex) => (
        <Text
          key={segmentIndex}
          style={segment.isBold ? styles.boldText : undefined}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

export function ChatBubble({
  message,
  messageIndex,
  maxBubbleWidth,
  language,
}: ChatBubbleProps) {
  const isUserMessage = message.role === 'user';
  const EnterAnimation = isUserMessage ? SlideInRight : SlideInLeft;

  return (
    <Animated.View
      entering={EnterAnimation.delay(messageIndex * 50).springify()}
      layout={Layout.springify()}
      style={[styles.messageWrapper, isUserMessage && styles.userMessageWrapper]}
    >
      {!isUserMessage && (
        <View style={styles.avatarContainer}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.avatar}>
            <Ionicons name="nutrition" size={16} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          { maxWidth: maxBubbleWidth },
          isUserMessage ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {renderFormattedText(message.content, isUserMessage)}
        <Text
          style={[styles.messageTime, isUserMessage && styles.userMessageTime]}
        >
          {formatTime(new Date(message.timestamp), language)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  messageBubble: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADIUS.xs,
    ...SHADOWS.colored(COLORS.primary),
  },
  assistantBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: RADIUS.xs,
    ...SHADOWS.sm,
  },
  messageText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  boldText: {
    fontWeight: '700',
  },
  userMessageText: {
    color: COLORS.textInverse,
  },
  messageTime: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
});
