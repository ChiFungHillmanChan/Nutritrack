import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
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
import { sendChatMessage } from '../../services/ai';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const { user } = useUserStore();
  const { todayNutrition } = useFoodStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        '你好！我係你嘅 AI 營養師 🥗\n\n你可以問我任何關於營養、飲食同健康嘅問題。我會根據你今日嘅攝取情況俾你個人化建議！',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      // Build chat history for context (exclude the initial welcome message)
      const chatHistory = messages.slice(1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call the AI service with Gemini
      const response = await sendChatMessage(messageToSend, chatHistory, {
        daily_nutrition: todayNutrition,
        daily_targets: user?.daily_targets,
        user_goal: user?.goal,
      });

      if (response.success && response.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Show error but keep conversation going
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.error ?? '抱歉，出咗啲問題。請再試一次。',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，出咗啲問題。請再試一次。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, todayNutrition, user?.daily_targets, user?.goal]);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
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
              isUser ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[styles.messageText, isUser && styles.userMessageText]}
            >
              {item.content}
            </Text>
            <Text
              style={[styles.messageTime, isUser && styles.userMessageTime]}
            >
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </Animated.View>
      );
    },
    []
  );

  const suggestedQuestions = [
    '今日應該食咩？',
    '點樣健康減重？',
    '邊啲食物高蛋白？',
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
          <Text style={styles.suggestionsTitle}>試下問：</Text>
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
            placeholder="輸入你嘅問題..."
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-HK', {
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
    maxWidth: width * 0.75,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
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
