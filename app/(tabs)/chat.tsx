import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { useFoodStore } from '../../stores/foodStore';
import { useChatStore, ChatMessage } from '../../stores/chatStore';
import { sendChatMessage, DemoResponses } from '../../services/ai';
import { useTranslation } from '../../hooks/useTranslation';

// Parse markdown-style text into structured segments for rendering
interface TextSegment {
  text: string;
  bold: boolean;
}

function parseMarkdownText(content: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // Match **bold** patterns
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({ text: content.slice(lastIndex, match.index), bold: false });
    }
    // Add bold text
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({ text: content.slice(lastIndex), bold: false });
  }

  return segments.length > 0 ? segments : [{ text: content, bold: false }];
}

export default function ChatScreen() {
  const { user } = useUserStore();
  const { todayNutrition } = useFoodStore();
  const { messages, addMessage, getChatHistory, isLoading, setLoading, initializeChat } = useChatStore();
  const { width } = useWindowDimensions();
  const maxBubbleWidth = Math.min(width * 0.72, 320);
  const { t, language } = useTranslation();
  
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Initialize chat when user is available
  useEffect(() => {
    if (user?.id) {
      initializeChat(user.id, t('chat.welcomeMessage'));
    }
  }, [user?.id, initializeChat, t]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    // Add user message to store (will be persisted)
    addMessage({
      role: 'user',
      content: inputText.trim(),
    });

    const messageToSend = inputText.trim();
    setInputText('');
    setLoading(true);

    try {
      // Get chat history for context (excludes welcome message)
      const chatHistory = getChatHistory();

      // Get translated demo responses for demo mode
      const demoResponses: DemoResponses = {
        default: t('chat.demoResponses.default'),
        food: t('chat.demoResponses.food'),
        weight: t('chat.demoResponses.weight'),
        protein: t('chat.demoResponses.protein'),
      };

      // Call the AI service with Gemini
      const response = await sendChatMessage(
        messageToSend, 
        chatHistory, 
        {
          daily_nutrition: todayNutrition,
          daily_targets: user?.daily_targets,
          user_goal: user?.goal,
        },
        demoResponses
      );

      if (response.success && response.message) {
        addMessage({
          role: 'assistant',
          content: response.message,
        });
      } else {
        // Show error but keep conversation going
        addMessage({
          role: 'assistant',
          content: response.error ?? t('chat.errorMessage'),
        });
      }
    } catch {
      addMessage({
        role: 'assistant',
        content: t('chat.errorMessage'),
      });
    } finally {
      setLoading(false);
    }
  }, [inputText, isLoading, addMessage, getChatHistory, setLoading, todayNutrition, user?.daily_targets, user?.goal, t]);

  // Render formatted text with bold support
  const renderFormattedText = useCallback(
    (content: string, isUser: boolean) => {
      const segments = parseMarkdownText(content);
      return (
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {segments.map((segment, idx) => (
            <Text
              key={idx}
              style={segment.bold ? styles.boldText : undefined}
            >
              {segment.text}
            </Text>
          ))}
        </Text>
      );
    },
    []
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const isUser = item.role === 'user';
      const EnterAnimation = isUser ? SlideInRight : SlideInLeft;

      return (
        <Animated.View
          entering={EnterAnimation.delay(index * 50).springify()}
          layout={Layout.springify()}
          style={[styles.messageWrapper, isUser && styles.userMessageWrapper]}
        >
          {!isUser && (
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
              isUser ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            {renderFormattedText(item.content, isUser)}
            <Text
              style={[styles.messageTime, isUser && styles.userMessageTime]}
            >
              {formatTime(new Date(item.timestamp), language)}
            </Text>
          </View>
        </Animated.View>
      );
    },
    [maxBubbleWidth, renderFormattedText, language]
  );

  const suggestedQuestions = [
    t('chat.suggestions.whatToEat'),
    t('chat.suggestions.healthyWeightLoss'),
    t('chat.suggestions.highProtein'),
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isLoading ? (
            <Animated.View entering={FadeIn} style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <View style={styles.typingDots}>
                  <Animated.View
                    entering={FadeIn.delay(0)}
                    style={[styles.dot, styles.dot1]}
                  />
                  <Animated.View
                    entering={FadeIn.delay(100)}
                    style={[styles.dot, styles.dot2]}
                  />
                  <Animated.View
                    entering={FadeIn.delay(200)}
                    style={[styles.dot, styles.dot3]}
                  />
                </View>
              </View>
            </Animated.View>
          ) : null
        }
      />

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={styles.suggestionsContainer}
        >
          <Text style={styles.suggestionsTitle}>{t('chat.tryAsking')}</Text>
          <View style={styles.suggestionsRow}>
            {suggestedQuestions.map((question, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(400 + index * 100).springify()}
              >
                <TouchableOpacity
                  style={styles.suggestionChip}
                  onPress={() => setInputText(question)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={14}
                    color={COLORS.primary}
                  />
                  <Text style={styles.suggestionText}>{question}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Input Area */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('chat.inputPlaceholder')}
            placeholderTextColor={COLORS.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            {inputText.trim() && !isLoading ? (
              <LinearGradient colors={GRADIENTS.primary} style={styles.sendButtonGradient}>
                <Ionicons name="send" size={18} color={COLORS.textInverse} />
              </LinearGradient>
            ) : (
              <View style={styles.sendButtonInactive}>
                <Ionicons name="send" size={18} color={COLORS.textMuted} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatTime(date: Date, language: string): string {
  return date.toLocaleTimeString(language === 'zh-TW' ? 'zh-HK' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Messages
  messagesList: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
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

  // Loading
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
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },

  // Suggestions
  suggestionsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  suggestionsTitle: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
  },
  suggestionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Input
  inputWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  sendButton: {
    marginLeft: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.colored(COLORS.primary),
  },
  sendButtonInactive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundTertiary,
  },
  sendButtonDisabled: {
    opacity: 1,
  },
});
