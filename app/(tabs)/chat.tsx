/**
 * ChatScreen
 *
 * Main chat interface for conversing with the AI nutrition assistant.
 * Uses extracted components for message display, input, and suggestions.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import { DemoResponses, sendChatMessage } from '../../services/ai';
import { ChatMessage, useChatStore } from '../../stores/chatStore';
import { useFoodStore } from '../../stores/foodStore';
import { useUserStore } from '../../stores/userStore';
import {
  ChatBubble,
  ChatInput,
  SuggestedQuestions,
  TypingIndicator,
} from '../../components/chat';

export default function ChatScreen() {
  const { user } = useUserStore();
  const { todayNutrition } = useFoodStore();
  const {
    messages,
    addMessage,
    getChatHistory,
    isLoading,
    setLoading,
    initializeChat,
    updateWelcomeMessage,
  } = useChatStore();
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

  // Update welcome message when language changes
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      updateWelcomeMessage(t('chat.welcomeMessage'));
    }
  }, [language, user?.id, messages.length, updateWelcomeMessage, t]);

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
      const response = await sendChatMessage(messageToSend, chatHistory, {
        daily_nutrition: todayNutrition,
        daily_targets: user?.daily_targets,
        user_goal: user?.goal,
      }, demoResponses);

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
  }, [
    inputText,
    isLoading,
    addMessage,
    getChatHistory,
    setLoading,
    todayNutrition,
    user?.daily_targets,
    user?.goal,
    t,
  ]);

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => (
      <ChatBubble
        message={item}
        messageIndex={index}
        maxBubbleWidth={maxBubbleWidth}
        language={language}
      />
    ),
    [maxBubbleWidth, language]
  );

  const suggestedQuestions = [
    t('chat.suggestions.whatToEat'),
    t('chat.suggestions.healthyWeightLoss'),
    t('chat.suggestions.highProtein'),
  ];

  const shouldShowSuggestions = messages.length <= 1;

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
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
      />

      {/* Suggested Questions */}
      {shouldShowSuggestions && (
        <SuggestedQuestions
          questions={suggestedQuestions}
          title={t('chat.tryAsking')}
          onSelectQuestion={setInputText}
          accessibilityHint={t('accessibility.tapToAskQuestion')}
        />
      )}

      {/* Input Area */}
      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        isLoading={isLoading}
        placeholder={t('chat.inputPlaceholder')}
        inputAccessibilityLabel={t('chat.inputPlaceholder')}
        inputAccessibilityHint={t('accessibility.typeMessageToAI')}
        sendAccessibilityLabel={t('accessibility.sendMessage')}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  messagesList: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
});
