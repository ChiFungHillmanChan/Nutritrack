/**
 * Lifestyle Tips Screen
 * 
 * Health and lifestyle tips for better nutrition and wellness.
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';

interface TipCategory {
  id: string;
  titleKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const TIP_CATEGORIES: TipCategory[] = [
  {
    id: 'eating',
    titleKey: 'tools.lifestyleTips.categories.eating.title',
    icon: 'restaurant',
    color: COLORS.primary,
  },
  {
    id: 'hydration',
    titleKey: 'tools.lifestyleTips.categories.hydration.title',
    icon: 'water',
    color: COLORS.info,
  },
  {
    id: 'sleep',
    titleKey: 'tools.lifestyleTips.categories.sleep.title',
    icon: 'moon',
    color: COLORS.protein,
  },
  {
    id: 'activity',
    titleKey: 'tools.lifestyleTips.categories.activity.title',
    icon: 'fitness',
    color: COLORS.calories,
  },
  {
    id: 'mental',
    titleKey: 'tools.lifestyleTips.categories.mental.title',
    icon: 'heart',
    color: COLORS.fat,
  },
];

export default function LifestyleTipsScreen() {
  const { t, getRawTranslation } = useTranslation();

  const getTips = (categoryId: string): string[] => {
    // Get the tips array for this category from translations
    const tips = getRawTranslation(`tools.lifestyleTips.categories.${categoryId}.tips`);
    return Array.isArray(tips) ? tips : [];
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('tools.lifestyleTips.title'),
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>{t('tools.lifestyleTips.headerTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('tools.lifestyleTips.subtitle')}
          </Text>
        </Animated.View>

        {TIP_CATEGORIES.map((category, index) => (
          <Animated.View
            key={category.id}
            entering={FadeInDown.delay(200 + index * 100)}
          >
            <Card style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                  <Ionicons name={category.icon} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryTitle}>{t(category.titleKey)}</Text>
              </View>
              <View style={styles.tipsList}>
                {getTips(category.id).map((tip, tipIndex) => (
                  <View key={tipIndex} style={styles.tipItem}>
                    <View style={[styles.tipBullet, { backgroundColor: category.color }]} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  categoryCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  tipsList: {
    gap: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  tipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
