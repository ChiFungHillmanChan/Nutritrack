/**
 * About Screen
 *
 * Displays app information, version, and credits.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { Card } from '../components/ui';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const BUILD_NUMBER = Constants.expoConfig?.ios?.buildNumber ?? '1';

export default function AboutScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '關於 Nutritrack',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Version */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="nutrition" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>Nutritrack</Text>
          <Text style={styles.tagline}>智能營養追蹤助手</Text>
          <Text style={styles.version}>
            版本 {APP_VERSION} ({BUILD_NUMBER})
          </Text>
        </View>

        {/* Features */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>功能特色</Text>
          
          <FeatureItem
            icon="camera"
            title="AI 食物辨識"
            description="拍照即可自動辨識食物並計算營養成分"
          />
          <FeatureItem
            icon="chatbubbles"
            title="營養諮詢"
            description="AI 營養師隨時解答你的飲食問題"
          />
          <FeatureItem
            icon="fitness"
            title="習慣追蹤"
            description="記錄水分、睡眠、運動等生活習慣"
          />
          <FeatureItem
            icon="analytics"
            title="數據分析"
            description="視覺化呈現營養攝取趨勢"
          />
        </Card>

        {/* Data & Privacy */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>數據與私隱</Text>
          <Text style={styles.bodyText}>
            你的健康數據安全地儲存在你的設備上。我們重視你的私隱，絕不會在未經你同意的情況下分享你的個人資料。
          </Text>
        </Card>

        {/* Credits */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>致謝</Text>
          <Text style={styles.bodyText}>
            Nutritrack 使用先進的 AI 技術提供準確的營養分析。感謝所有貢獻者和用戶的支持。
          </Text>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © 2024 Nutritrack. All rights reserved.
          </Text>
          <Text style={styles.madeWith}>
            Made for healthy living
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  appName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  version: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  bodyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  copyright: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  madeWith: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textMuted,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
