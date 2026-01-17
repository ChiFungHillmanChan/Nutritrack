/**
 * Portion Guide Screen
 * 
 * Visual reference guide for food portions.
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

interface PortionItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const PORTION_GUIDES: PortionItem[] = [
  { id: 'protein', icon: 'fish', color: COLORS.protein },
  { id: 'carbs', icon: 'restaurant', color: COLORS.carbs },
  { id: 'vegetables', icon: 'leaf', color: COLORS.fiber },
  { id: 'fruit', icon: 'nutrition', color: COLORS.success },
  { id: 'cheese', icon: 'cube', color: COLORS.fat },
  { id: 'nuts', icon: 'ellipse', color: COLORS.calories },
  { id: 'oil', icon: 'water', color: COLORS.warning },
  { id: 'sauce', icon: 'flask', color: COLORS.sodium },
];

export default function PortionGuideScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('tools.portionGuide.title'),
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>{t('tools.portionGuide.headerTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('tools.portionGuide.subtitle')}
          </Text>
        </Animated.View>

        {/* Hand Guide */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.introCard}>
            <View style={styles.introHeader}>
              <Ionicons name="hand-left" size={32} color={COLORS.primary} />
              <Text style={styles.introTitle}>{t('tools.portionGuide.useYourHand')}</Text>
            </View>
            <Text style={styles.introText}>
              {t('tools.portionGuide.handExplanation')}
            </Text>
          </Card>
        </Animated.View>

        {/* Portion Items */}
        {PORTION_GUIDES.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(300 + index * 50)}
          >
            <Card style={styles.portionCard}>
              <View style={styles.portionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.portionInfo}>
                  <Text style={styles.portionFood}>{t(`tools.portionGuide.portions.${item.id}.food`)}</Text>
                  <Text style={styles.portionAmount}>{t(`tools.portionGuide.portions.${item.id}.portion`)}</Text>
                </View>
              </View>
              <View style={styles.visualContainer}>
                <Ionicons name="resize" size={16} color={COLORS.textSecondary} />
                <Text style={styles.visualText}>{t(`tools.portionGuide.portions.${item.id}.visual`)}</Text>
              </View>
            </Card>
          </Animated.View>
        ))}

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(700)}>
          <Card style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>{t('tools.portionGuide.practicalTips')}</Text>
            <View style={styles.tipsList}>
              <TipItem text={t('tools.portionGuide.tip1')} />
              <TipItem text={t('tools.portionGuide.tip2')} />
              <TipItem text={t('tools.portionGuide.tip3')} />
              <TipItem text={t('tools.portionGuide.tip4')} />
              <TipItem text={t('tools.portionGuide.tip5')} />
            </View>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipItem}>
      <View style={styles.tipBullet} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
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
  introCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.primaryMuted,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  introTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primaryDark,
    marginLeft: SPACING.md,
  },
  introText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  portionCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  portionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  portionFood: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  portionAmount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  visualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundTertiary,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  visualText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  tipsCard: {
    marginTop: SPACING.md,
    padding: SPACING.lg,
  },
  tipsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
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
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  tipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
