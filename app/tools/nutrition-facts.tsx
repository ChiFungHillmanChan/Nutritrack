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
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../../components/ui';

interface NutrientFact {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  sources: string[];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const NUTRIENT_FACTS: NutrientFact[] = [
  {
    id: 'protein',
    name: '蛋白質',
    description: '蛋白質是身體的基本建築材料，用於建造和修復肌肉、器官和組織。',
    benefits: ['建造肌肉', '修復組織', '增強免疫力', '產生酶和荷爾蒙'],
    sources: ['肉類', '魚類', '蛋', '豆腐', '牛奶', '堅果'],
    icon: 'barbell',
    color: COLORS.protein,
  },
  {
    id: 'carbs',
    name: '碳水化合物',
    description: '碳水化合物是身體的主要能量來源，特別是大腦和肌肉。',
    benefits: ['提供能量', '支援腦部功能', '促進消化', '調節血糖'],
    sources: ['米飯', '麵包', '薯仔', '水果', '蔬菜', '全穀物'],
    icon: 'flash',
    color: COLORS.carbs,
  },
  {
    id: 'fat',
    name: '脂肪',
    description: '脂肪是必需營養素，幫助吸收維他命和保護器官。',
    benefits: ['吸收脂溶性維他命', '保護器官', '提供長效能量', '維持細胞健康'],
    sources: ['橄欖油', '牛油果', '堅果', '三文魚', '芝士'],
    icon: 'water',
    color: COLORS.fat,
  },
  {
    id: 'fiber',
    name: '纖維',
    description: '纖維有助消化系統健康，維持腸道蠕動正常。',
    benefits: ['促進消化', '維持腸道健康', '控制血糖', '降低膽固醇'],
    sources: ['蔬菜', '水果', '全穀物', '豆類', '堅果'],
    icon: 'leaf',
    color: COLORS.fiber,
  },
  {
    id: 'vitamins',
    name: '維他命',
    description: '維他命是微量營養素，對身體各種功能至關重要。',
    benefits: ['增強免疫力', '促進新陳代謝', '維持視力', '支援骨骼健康'],
    sources: ['水果', '蔬菜', '肉類', '奶製品', '陽光 (維他命 D)'],
    icon: 'sunny',
    color: COLORS.warning,
  },
  {
    id: 'minerals',
    name: '礦物質',
    description: '礦物質參與身體的許多重要功能，包括骨骼形成和神經傳導。',
    benefits: ['強化骨骼', '調節體液平衡', '支援神經功能', '攜帶氧氣'],
    sources: ['奶製品', '綠葉蔬菜', '肉類', '海鮮', '堅果'],
    icon: 'diamond',
    color: COLORS.sodium,
  },
];

export default function NutritionFactsScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '營養知識',
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>營養知識</Text>
          <Text style={styles.subtitle}>
            了解各種營養素及其對身體的益處
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
                    <Text style={styles.nutrientName}>{nutrient.name}</Text>
                    <Text style={styles.nutrientDesc} numberOfLines={expandedId === nutrient.id ? undefined : 2}>
                      {nutrient.description}
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
                      <Text style={styles.sectionTitle}>好處</Text>
                      <View style={styles.tagList}>
                        {nutrient.benefits.map((benefit, i) => (
                          <View key={i} style={[styles.tag, { backgroundColor: nutrient.color + '15' }]}>
                            <Text style={[styles.tagText, { color: nutrient.color }]}>{benefit}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>食物來源</Text>
                      <Text style={styles.sourcesText}>{nutrient.sources.join('、')}</Text>
                    </View>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
