/**
 * My Medications Screen
 * 
 * Allows users to view and manage their medications.
 */

import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { Card, Button } from '../../components/ui';
import { useUserStore } from '../../stores/userStore';
import { useTranslation } from '../../hooks/useTranslation';
import type { Medication } from '../../types';

export default function MedicationsScreen() {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const medications = user?.medications || [];
  const supplements = user?.supplements || [];

  const handleAddMedication = useCallback(() => {
    Alert.alert(t('tools.medications.addMedication'), t('tools.medications.comingSoon'));
  }, [t]);

  const handleEditMedication = useCallback((_med: Medication) => {
    Alert.alert(t('tools.medications.editMedication'), t('tools.medications.comingSoon'));
  }, [t]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('tools.medications.title'),
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>{t('tools.medications.headerTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('tools.medications.subtitle')}
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
                <Text style={styles.cardTitle}>{t('tools.medications.prescriptionMeds')}</Text>
              </View>
              <Button
                title={t('tools.medications.add')}
                icon="add"
                onPress={handleAddMedication}
                variant="secondary"
                size="sm"
              />
            </View>

            {medications.length > 0 ? (
              <View style={styles.medicationList}>
                {medications.map((med) => (
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
                <Text style={styles.emptyText}>{t('tools.medications.noMedications')}</Text>
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
                <Text style={styles.cardTitle}>{t('tools.medications.supplements')}</Text>
              </View>
              <Button
                title={t('tools.medications.add')}
                icon="add"
                onPress={() => Alert.alert(t('tools.medications.addSupplement'), t('tools.medications.comingSoon'))}
                variant="secondary"
                size="sm"
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
                <Text style={styles.emptyText}>{t('tools.medications.noSupplements')}</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color={COLORS.info} />
              <Text style={styles.infoTitle}>{t('tools.medications.importantTips')}</Text>
            </View>
            <Text style={styles.infoText}>
              • {t('tools.medications.tip1')}{'\n'}
              • {t('tools.medications.tip2')}{'\n'}
              • {t('tools.medications.tip3')}{'\n'}
              • {t('tools.medications.tip4')}
            </Text>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
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
        size="sm"
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
