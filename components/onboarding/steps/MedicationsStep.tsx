/**
 * MedicationsStep - Collects medications and supplements
 */

import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { Card } from '../../ui';
import { styles } from '../styles';
import type { Medication, Supplement, TranslationFunction } from '../types';

interface MedicationsStepProps {
  medications: Medication[];
  supplements: Supplement[];
  newMedName: string;
  setNewMedName: (value: string) => void;
  newSuppName: string;
  setNewSuppName: (value: string) => void;
  addMedication: () => void;
  removeMedication: (id: string) => void;
  addSupplement: () => void;
  removeSupplement: (id: string) => void;
  t: TranslationFunction;
}

export function MedicationsStep({
  medications,
  supplements,
  newMedName,
  setNewMedName,
  newSuppName,
  setNewSuppName,
  addMedication,
  removeMedication,
  addSupplement,
  removeSupplement,
  t,
}: MedicationsStepProps) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.fiber, COLORS.fiberBg]} style={styles.stepIconGradient}>
            <Ionicons name="medkit" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.medications.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.medications.description')}</Text>
      </View>

      {/* Medications */}
      <Card style={styles.formCard}>
        <Text style={styles.cardTitle}>{t('onboarding.medications.currentMeds')}</Text>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, styles.addItemInput]}
            placeholder={t('onboarding.medications.medNamePlaceholder')}
            placeholderTextColor={COLORS.textTertiary}
            value={newMedName}
            onChangeText={setNewMedName}
            onSubmitEditing={addMedication}
          />
          <TouchableOpacity style={styles.addButton} onPress={addMedication}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        {medications.length > 0 && (
          <View style={styles.itemsList}>
            {medications.map((med) => (
              <View key={med.id} style={styles.listItem}>
                <Ionicons name="medical" size={16} color={COLORS.primary} />
                <Text style={styles.listItemText}>{med.name}</Text>
                <TouchableOpacity onPress={() => removeMedication(med.id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Supplements */}
      <Card style={[styles.formCard, styles.marginTopMd]}>
        <Text style={styles.cardTitle}>{t('onboarding.medications.supplements')}</Text>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, styles.addItemInput]}
            placeholder={t('onboarding.medications.suppNamePlaceholder')}
            placeholderTextColor={COLORS.textTertiary}
            value={newSuppName}
            onChangeText={setNewSuppName}
            onSubmitEditing={addSupplement}
          />
          <TouchableOpacity style={styles.addButton} onPress={addSupplement}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        {supplements.length > 0 && (
          <View style={styles.itemsList}>
            {supplements.map((supp) => (
              <View key={supp.id} style={styles.listItem}>
                <Ionicons name="leaf" size={16} color={COLORS.fiber} />
                <Text style={styles.listItemText}>{supp.name}</Text>
                <TouchableOpacity onPress={() => removeSupplement(supp.id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Animated.View>
  );
}
