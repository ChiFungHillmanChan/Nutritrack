/**
 * Privacy Policy Screen
 *
 * Displays the app's privacy policy.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING } from '../constants/typography';
import { Card } from '../components/ui';

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '私隱政策',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Text style={styles.lastUpdated}>最後更新: 2024年1月</Text>
          
          <Text style={styles.intro}>
            Nutritrack（「我們」）致力於保護你的私隱。本私隱政策說明我們如何收集、使用和保護你的個人資料。
          </Text>
        </Card>

        <PolicySection
          title="1. 資料收集"
          content={`我們收集以下類型的資料：

• 帳戶資料：電郵地址、姓名、密碼
• 健康資料：身高、體重、年齡、性別
• 飲食記錄：食物照片、營養攝取記錄
• 習慣數據：水分攝取、睡眠、運動記錄
• 設備資料：設備類型、作業系統版本

所有健康數據都儲存在你的設備本地，除非你選擇啟用雲端同步功能。`}
        />

        <PolicySection
          title="2. 資料使用"
          content={`我們使用收集的資料：

• 提供個人化的營養建議
• 分析你的飲食習慣和趨勢
• 改善應用程式功能和用戶體驗
• 發送通知和提醒（如果你選擇接收）

我們不會將你的個人健康數據出售給第三方。`}
        />

        <PolicySection
          title="3. 資料儲存"
          content={`你的數據安全是我們的首要考慮：

• 本地儲存：所有健康數據預設儲存在你的設備上
• 雲端同步：如啟用，數據會加密傳輸和儲存
• 數據刪除：你可以隨時刪除你的帳戶和所有相關數據`}
        />

        <PolicySection
          title="4. AI 分析"
          content={`我們使用 AI 技術提供食物辨識和營養分析：

• 食物照片會傳送至安全的 AI 服務進行分析
• 分析完成後，照片不會被保留
• AI 分析結果僅用於提供營養資訊`}
        />

        <PolicySection
          title="5. 你的權利"
          content={`你有權：

• 存取你的個人資料
• 更正不準確的資料
• 刪除你的帳戶和所有數據
• 匯出你的數據
• 選擇退出非必要的數據收集`}
        />

        <PolicySection
          title="6. 聯繫我們"
          content={`如有任何關於私隱的問題，請聯繫我們：

電郵：privacy@nutritrack.app

我們會在合理時間內回覆你的查詢。`}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

function PolicySection({ title, content }: { title: string; content: string }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </Card>
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
  card: {
    marginBottom: SPACING.md,
  },
  lastUpdated: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  intro: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
