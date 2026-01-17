/**
 * Carb Counting Tool
 * 
 * Helps users calculate carbohydrate content of meals.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card, Button } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';

interface FoodItem {
  nameKey: string;
  carbsPer100g: number;
  commonServing: number;
}

const COMMON_FOODS: FoodItem[] = [
  { nameKey: 'rice', carbsPer100g: 28, commonServing: 150 },
  { nameKey: 'noodles', carbsPer100g: 25, commonServing: 200 },
  { nameKey: 'bread', carbsPer100g: 49, commonServing: 30 },
  { nameKey: 'apple', carbsPer100g: 14, commonServing: 180 },
  { nameKey: 'banana', carbsPer100g: 23, commonServing: 120 },
  { nameKey: 'potato', carbsPer100g: 17, commonServing: 150 },
  { nameKey: 'corn', carbsPer100g: 19, commonServing: 100 },
  { nameKey: 'milk', carbsPer100g: 5, commonServing: 250 },
];

export default function CarbCountingScreen() {
  const { t } = useTranslation();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portion, setPortion] = useState('');
  const [totalCarbs, setTotalCarbs] = useState(0);

  const getFoodName = (nameKey: string) => t(`tools.carbCounting.foods.${nameKey}`);

  const calculateCarbs = (food: FoodItem, grams: number) => {
    return Math.round((food.carbsPer100g * grams) / 100);
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setPortion(food.commonServing.toString());
    setTotalCarbs(calculateCarbs(food, food.commonServing));
  };

  const handlePortionChange = (value: string) => {
    setPortion(value);
    if (selectedFood && value) {
      const grams = parseFloat(value);
      if (!isNaN(grams)) {
        setTotalCarbs(calculateCarbs(selectedFood, grams));
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('tools.carbCounting.title'),
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>{t('tools.carbCounting.headerTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('tools.carbCounting.subtitle')}
          </Text>
        </Animated.View>

        {/* Food Selection */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{t('tools.carbCounting.commonFoods')}</Text>
            <View style={styles.foodGrid}>
              {COMMON_FOODS.map((food) => (
                <Button
                  key={food.nameKey}
                  title={getFoodName(food.nameKey)}
                  onPress={() => handleFoodSelect(food)}
                  style={selectedFood?.nameKey === food.nameKey 
                    ? { ...styles.foodButton, ...styles.foodButtonActive } 
                    : styles.foodButton}
                  variant={selectedFood?.nameKey === food.nameKey ? 'primary' : 'secondary'}
                />
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Portion Input */}
        {selectedFood && (
          <Animated.View entering={FadeInDown.delay(300)}>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>{t('tools.carbCounting.portionGrams')}</Text>
              <TextInput
                style={styles.input}
                value={portion}
                onChangeText={handlePortionChange}
                keyboardType="numeric"
                placeholder={t('tools.carbCounting.enterGrams')}
                placeholderTextColor={COLORS.textTertiary}
              />
              <Text style={styles.hint}>
                {t('tools.carbCounting.commonPortion')}: {selectedFood.commonServing}{t('units.g')}
              </Text>
            </Card>
          </Animated.View>
        )}

        {/* Result */}
        {selectedFood && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <Card style={styles.resultCard}>
              <Text style={styles.resultLabel}>{t('tools.carbCounting.carbContent')}</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultValue}>{totalCarbs}</Text>
                <Text style={styles.resultUnit}>{t('units.g')}</Text>
              </View>
              <Text style={styles.resultNote}>
                {t('tools.carbCounting.resultNote', {
                  food: getFoodName(selectedFood.nameKey),
                  portion,
                  carbs: totalCarbs,
                })}
              </Text>
            </Card>
          </Animated.View>
        )}

        {/* Info */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('tools.carbCounting.tips')}</Text>
            <Text style={styles.infoText}>
              • {t('tools.carbCounting.tip1')}{'\n'}
              • {t('tools.carbCounting.tip2')}{'\n'}
              • {t('tools.carbCounting.tip3')}{'\n'}
              • {t('tools.carbCounting.tip4')}
            </Text>
          </Card>
        </Animated.View>

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
  card: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  foodButton: {
    minWidth: 70,
  },
  foodButtonActive: {
    ...SHADOWS.colored(COLORS.primary),
  },
  input: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  hint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  resultCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.xl,
    backgroundColor: COLORS.primaryMuted,
  },
  resultLabel: {
    ...TYPOGRAPHY.overline,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
  },
  resultUnit: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primaryDark,
    marginLeft: SPACING.xs,
  },
  resultNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  infoCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  infoTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
