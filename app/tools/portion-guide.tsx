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
  Image,
} from 'react-native';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card } from '../../components/ui';

interface PortionItem {
  food: string;
  portion: string;
  visual: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const PORTION_GUIDES: PortionItem[] = [
  {
    food: '蛋白質 (肉類、魚、雞)',
    portion: '約 100 克',
    visual: '一副啤牌大小',
    icon: 'fish',
    color: COLORS.protein,
  },
  {
    food: '碳水化合物 (飯、麵)',
    portion: '約 150 克 (熟)',
    visual: '一個拳頭大小',
    icon: 'restaurant',
    color: COLORS.carbs,
  },
  {
    food: '蔬菜',
    portion: '約 80 克',
    visual: '兩個手掌大小',
    icon: 'leaf',
    color: COLORS.fiber,
  },
  {
    food: '水果',
    portion: '約 80 克',
    visual: '一個網球大小',
    icon: 'nutrition',
    color: COLORS.success,
  },
  {
    food: '芝士',
    portion: '約 30 克',
    visual: '兩個拇指大小',
    icon: 'cube',
    color: COLORS.fat,
  },
  {
    food: '堅果',
    portion: '約 30 克',
    visual: '一小把',
    icon: 'ellipse',
    color: COLORS.calories,
  },
  {
    food: '油脂',
    portion: '約 5 克',
    visual: '一茶匙',
    icon: 'water',
    color: COLORS.warning,
  },
  {
    food: '醬汁',
    portion: '約 15 克',
    visual: '一湯匙',
    icon: 'flask',
    color: COLORS.sodium,
  },
];

export default function PortionGuideScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '份量指南',
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>份量指南</Text>
          <Text style={styles.subtitle}>
            用簡單嘅方法估算食物份量
          </Text>
        </Animated.View>

        {/* Hand Guide */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.introCard}>
            <View style={styles.introHeader}>
              <Ionicons name="hand-left" size={32} color={COLORS.primary} />
              <Text style={styles.introTitle}>用你隻手做參考</Text>
            </View>
            <Text style={styles.introText}>
              你隻手係一個方便嘅參考工具，因為佢嘅大小同你嘅身體比例相關。
            </Text>
          </Card>
        </Animated.View>

        {/* Portion Items */}
        {PORTION_GUIDES.map((item, index) => (
          <Animated.View
            key={item.food}
            entering={FadeInDown.delay(300 + index * 50)}
          >
            <Card style={styles.portionCard}>
              <View style={styles.portionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.portionInfo}>
                  <Text style={styles.portionFood}>{item.food}</Text>
                  <Text style={styles.portionAmount}>{item.portion}</Text>
                </View>
              </View>
              <View style={styles.visualContainer}>
                <Ionicons name="resize" size={16} color={COLORS.textSecondary} />
                <Text style={styles.visualText}>{item.visual}</Text>
              </View>
            </Card>
          </Animated.View>
        ))}

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(700)}>
          <Card style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>實用貼士</Text>
            <View style={styles.tipsList}>
              <TipItem text="用細啲嘅碟可以幫你控制份量" />
              <TipItem text="慢慢食，比你嘅腦有時間感覺飽" />
              <TipItem text="蔬菜應該佔碟嘅一半" />
              <TipItem text="蛋白質應該佔碟嘅四分之一" />
              <TipItem text="碳水化合物應該佔碟嘅四分之一" />
            </View>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
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
