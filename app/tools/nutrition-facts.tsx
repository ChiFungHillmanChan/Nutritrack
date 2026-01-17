/**
 * Nutrition Facts Screen
 * 
 * Educational content about nutrition and nutrients.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';

interface NutrientFact {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const NUTRIENT_FACTS: NutrientFact[] = [
  { id: 'protein', icon: 'barbell', color: COLORS.protein },
  { id: 'carbs', icon: 'flash', color: COLORS.carbs },
  { id: 'fat', icon: 'water', color: COLORS.fat },
  { id: 'fiber', icon: 'leaf', color: COLORS.fiber },
  { id: 'vitamins', icon: 'sunny', color: COLORS.warning },
  { id: 'minerals', icon: 'diamond', color: COLORS.sodium },
];

export default function NutritionFactsScreen() {
  const { t, getRawTranslation } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getBenefits = (nutrientId: string): string[] => {
    const benefits = getRawTranslation(`tools.nutritionFacts.nutrients.${nutrientId}.benefits`);
    return Array.isArray(benefits) ? benefits : [];
  };

  const getSources = (nutrientId: string): string[] => {
    const sources = getRawTranslation(`tools.nutritionFacts.nutrients.${nutrientId}.sources`);
    return Array.isArray(sources) ? sources : [];
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('tools.nutritionFacts.title'),
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>{t('tools.nutritionFacts.headerTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('tools.nutritionFacts.subtitle')}
          </Text>
        </Animated.View>

        {NUTRIENT_FACTS.map((nutrient, index) => (
          <Animated.View
            key={nutrient.id}
            entering={FadeInDown.delay(200 + index * 50)}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => toggleExpand(nutrient.id)}
            >
              <Card style={styles.nutrientCard}>
                <View style={styles.nutrientHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: nutrient.color + '20' }]}>
                    <Ionicons name={nutrient.icon} size={24} color={nutrient.color} />
                  </View>
                  <View style={styles.nutrientInfo}>
                    <Text style={styles.nutrientName}>{t(`tools.nutritionFacts.nutrients.${nutrient.id}.name`)}</Text>
                    <Text style={styles.nutrientDesc} numberOfLines={expandedId === nutrient.id ? undefined : 2}>
                      {t(`tools.nutritionFacts.nutrients.${nutrient.id}.description`)}
                    </Text>
                  </View>
                  <Ionicons
                    name={expandedId === nutrient.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textTertiary}
                  />
                </View>

                {expandedId === nutrient.id && (
                  <View style={styles.expandedContent}>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('tools.nutritionFacts.benefits')}</Text>
                      <View style={styles.tagList}>
                        {getBenefits(nutrient.id).map((benefit, i) => (
                          <View key={i} style={[styles.tag, { backgroundColor: nutrient.color + '15' }]}>
                            <Text style={[styles.tagText, { color: nutrient.color }]}>{benefit}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('tools.nutritionFacts.sources')}</Text>
                      <Text style={styles.sourcesText}>{getSources(nutrient.id).join('、')}</Text>
                    </View>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
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
  nutrientCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  nutrientHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutrientInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  nutrientName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  nutrientDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  tagText: {
    ...TYPOGRAPHY.captionMedium,
  },
  sourcesText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
