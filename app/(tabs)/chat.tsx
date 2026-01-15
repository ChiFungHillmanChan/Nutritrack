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
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { useFoodStore } from '../../stores/foodStore';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Mock AI chat for MVP (will be replaced with real Gemini API)
async function sendMessage(
  message: string, 
  _context: { nutrition: unknown; targets: unknown }
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock responses based on common questions
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('食咩') || lowerMessage.includes('建議')) {
    return '根據你今日嘅攝取情況，我建議你可以考慮以下選擇：\n\n1. 雞胸肉沙律 - 高蛋白低脂\n2. 三文魚配糙米 - 優質蛋白同複合碳水\n3. 希臘乳酪配水果 - 補充蛋白質同纖維\n\n你今日蛋白質攝取偏低，建議揀高蛋白嘅食物！';
  }
  
  if (lowerMessage.includes('減肥') || lowerMessage.includes('瘦')) {
    return '減重嘅關鍵係保持適度嘅熱量赤字，同時確保營養均衡。以下係一啲建議：\n\n1. 每餐都要有蛋白質，幫助維持飽足感\n2. 多食蔬菜增加纖維攝取\n3. 減少加工食品同糖分\n4. 保持足夠水分攝取\n\n記住，持續嘅習慣改變比短期節食更有效！';
  }
  
  if (lowerMessage.includes('蛋白質') || lowerMessage.includes('protein')) {
    return '蛋白質對身體好重要！以下係一啲優質蛋白質來源：\n\n動物性：雞胸肉、魚、蛋、瘦牛肉、乳製品\n植物性：豆腐、豆類、藜麥、堅果\n\n一般建議每公斤體重攝取 1.6-2.2g 蛋白質，如果你有運動習慣可以攝取較多。';
  }
  
  return '多謝你嘅問題！我係你嘅 AI 營養師，可以幫你解答關於營養、飲食同健康嘅問題。\n\n你可以問我：\n• 今日應該食咩？\n• 點樣健康減重？\n• 邊啲食物高蛋白？\n• 我嘅飲食有咩可以改善？';
}

export default function ChatScreen() {
  const { user } = useUserStore();
  const { todayNutrition } = useFoodStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我係你嘅 AI 營養師 🥗\n\n你可以問我任何關於營養、飲食同健康嘅問題。我會根據你今日嘅攝取情況俾你個人化建議！',
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

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendMessage(inputText, {
        nutrition: todayNutrition,
        targets: user?.daily_targets,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，出咗啲問題。請再試一次。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, todayNutrition, user?.daily_targets]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Ionicons name="nutrition" size={20} color={COLORS.primary} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  }, []);

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
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>思考緊...</Text>
            </View>
          ) : null
        }
      />

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>試下問：</Text>
          <View style={styles.suggestionsRow}>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => setInputText(question)}
              >
                <Text style={styles.suggestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input Area */}
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
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() && !isLoading ? COLORS.textInverse : COLORS.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  userMessageText: {
    color: COLORS.textInverse,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginLeft: 40,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  suggestionsTitle: {
    ...TYPOGRAPHY.caption,
    marginBottom: 8,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.backgroundTertiary,
  },
});
