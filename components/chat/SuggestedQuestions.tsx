/**
 * SuggestedQuestions Component
 *
 * Displays suggestion chips with pre-defined questions
 * that users can tap to quickly ask the AI assistant.
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/typography';

interface SuggestedQuestionsProps {
  questions: string[];
  title: string;
  onSelectQuestion: (question: string) => void;
  accessibilityHint: string;
}

export function SuggestedQuestions({
  questions,
  title,
  onSelectQuestion,
  accessibilityHint,
}: SuggestedQuestionsProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(300).springify()}
      style={styles.suggestionsContainer}
    >
      <Text style={styles.suggestionsTitle}>{title}</Text>
      <View style={styles.suggestionsRow}>
        {questions.map((question, questionIndex) => (
          <Animated.View
            key={questionIndex}
            entering={FadeInDown.delay(400 + questionIndex * 100).springify()}
          >
            <TouchableOpacity
              style={styles.suggestionChip}
              onPress={() => onSelectQuestion(question)}
              activeOpacity={0.7}
              accessibilityLabel={question}
              accessibilityRole="button"
              accessibilityHint={accessibilityHint}
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
  );
}

const styles = StyleSheet.create({
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
});
