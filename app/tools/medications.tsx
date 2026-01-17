/**
 * My Medications Screen
 * 
 * Allows users to view and manage their medications.
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card, Button } from '../../components/ui';
import { useUserStore } from '../../stores/userStore';
import type { Medication } from '../../types';

export default function MedicationsScreen() {
  const { user } = useUserStore();
  const medications = user?.medications || [];
  const supplements = user?.supplements || [];

  const handleAddMedication = useCallback(() => {
    Alert.alert('新增藥物', '此功能即將推出');
  }, []);

  const handleEditMedication = useCallback((med: Medication) => {
    Alert.alert('編輯藥物', `編輯 ${med.name} 的功能即將推出`);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: '我的藥物',
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>我的藥物</Text>
          <Text style={styles.subtitle}>
            管理你的藥物和營養補充品
          </Text>
        </Animated.View>

        {/* Medications */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.errorLight }]}>
                  <Ionicons name="medkit" size={20} color={COLORS.error} />
                </View>
                <Text style={styles.cardTitle}>處方藥物</Text>
              </View>
              <Button
                title="新增"
                icon="add"
                onPress={handleAddMedication}
                variant="secondary"
                size="small"
              />
            </View>

            {medications.length > 0 ? (
              <View style={styles.medicationList}>
                {medications.map((med, index) => (
                  <MedicationItem
                    key={med.id}
                    medication={med}
                    onEdit={() => handleEditMedication(med)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="medical-outline" size={40} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>未有記錄任何藥物</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Supplements */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.successLight }]}>
                  <Ionicons name="leaf" size={20} color={COLORS.success} />
                </View>
                <Text style={styles.cardTitle}>營養補充品</Text>
              </View>
              <Button
                title="新增"
                icon="add"
                onPress={() => Alert.alert('新增補充品', '此功能即將推出')}
                variant="secondary"
                size="small"
              />
            </View>

            {supplements.length > 0 ? (
              <View style={styles.medicationList}>
                {supplements.map((supp) => (
                  <SupplementItem key={supp.id} supplement={supp} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={40} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>未有記錄任何補充品</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color={COLORS.info} />
              <Text style={styles.infoTitle}>重要提示</Text>
            </View>
            <Text style={styles.infoText}>
              • 請定時服用藥物，切勿自行停藥{'\n'}
              • 如有任何不適，請諮詢醫生{'\n'}
              • 此 App 不能取代專業醫療建議{'\n'}
              • 請確保藥物存放在安全地方
            </Text>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

function MedicationItem({
  medication,
  onEdit,
}: {
  medication: Medication;
  onEdit: () => void;
}) {
  return (
    <View style={styles.medicationItem}>
      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>{medication.name}</Text>
        <Text style={styles.medicationDosage}>
          {medication.dosage} • {medication.frequency}
        </Text>
        {medication.time_of_day.length > 0 && (
          <Text style={styles.medicationTime}>
            {medication.time_of_day.join(', ')}
          </Text>
        )}
      </View>
      <Button
        title=""
        icon="pencil"
        onPress={onEdit}
        variant="ghost"
        size="small"
      />
    </View>
  );
}

function SupplementItem({ supplement }: { supplement: { id: string; name: string; dosage: string; frequency: string } }) {
  return (
    <View style={styles.medicationItem}>
      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>{supplement.name}</Text>
        <Text style={styles.medicationDosage}>
          {supplement.dosage} • {supplement.frequency}
        </Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  cardTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  medicationList: {
    gap: SPACING.sm,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    marginBottom: 2,
  },
  medicationDosage: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  medicationTime: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.primary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
  },
  infoCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.infoLight,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.info,
    marginLeft: SPACING.sm,
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
