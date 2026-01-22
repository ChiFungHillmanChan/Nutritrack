/**
 * ExtraIngredientForm - Form for adding extra ingredients to food analysis
 *
 * Allows users to add additional ingredients one at a time with name, grams, and size.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import type { ExtraIngredient, IngredientSize } from './types';

interface ExtraIngredientFormProps {
  ingredients: ExtraIngredient[];
  onAddIngredient: (ingredient: ExtraIngredient) => void;
  onRemoveIngredient: (id: string) => void;
}

const SIZE_OPTIONS: { value: IngredientSize; labelKey: string }[] = [
  { value: 'small', labelKey: 'camera.size.small' },
  { value: 'medium', labelKey: 'camera.size.medium' },
  { value: 'large', labelKey: 'camera.size.large' },
];

export function ExtraIngredientForm({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
}: ExtraIngredientFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [grams, setGrams] = useState('');
  const [size, setSize] = useState<IngredientSize>('medium');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;

    const gramsNum = parseFloat(grams) || 0;
    const newIngredient: ExtraIngredient = {
      id: `ing-${Date.now()}`,
      name: name.trim(),
      grams: gramsNum,
      size,
    };

    onAddIngredient(newIngredient);
    setName('');
    setGrams('');
    setSize('medium');
    setShowForm(false);
  };

  const getSizeLabel = (sizeValue: IngredientSize): string => {
    const option = SIZE_OPTIONS.find((o) => o.value === sizeValue);
    return option ? t(option.labelKey) : sizeValue;
  };

  const renderIngredient = ({ item }: { item: ExtraIngredient }) => (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
      style={styles.ingredientItem}
    >
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{item.name}</Text>
        <View style={styles.ingredientMeta}>
          {item.grams > 0 && (
            <Text style={styles.ingredientGrams}>{item.grams}g</Text>
          )}
          {item.size && (
            <Text style={styles.ingredientSize}>{getSizeLabel(item.size)}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onRemoveIngredient(item.id)}
        style={styles.removeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('camera.extraIngredients')}</Text>
        <Text style={styles.subtitle}>{t('camera.extraIngredientsHint')}</Text>
      </View>

      {/* List of added ingredients */}
      {ingredients.length > 0 && (
        <View style={styles.ingredientsList}>
          <FlatList
            data={ingredients}
            renderItem={renderIngredient}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Add form */}
      {showForm ? (
        <Animated.View entering={FadeIn} style={styles.form}>
          {/* Name input */}
          <View style={styles.inputRow}>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('camera.ingredientName')}
                placeholderTextColor={COLORS.textTertiary}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
            <View style={styles.gramsInputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('units.g')}
                placeholderTextColor={COLORS.textTertiary}
                value={grams}
                onChangeText={setGrams}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Size selector */}
          <View style={styles.sizeSection}>
            <Text style={styles.sizeLabel}>{t('camera.size.label')}</Text>
            <View style={styles.sizeRow}>
              {SIZE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sizeButton,
                    size === option.value && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSize(option.value)}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      size === option.value && styles.sizeButtonTextActive,
                    ]}
                  >
                    {t(option.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowForm(false);
                setName('');
                setGrams('');
                setSize('medium');
              }}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, !name.trim() && styles.buttonDisabled]}
              onPress={handleAdd}
              disabled={!name.trim()}
            >
              <Ionicons name="add" size={18} color={COLORS.textInverse} />
              <Text style={styles.confirmButtonText}>{t('common.add')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addButtonText}>{t('camera.addIngredient')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ingredientsList: {
    marginBottom: SPACING.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  ingredientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  ingredientGrams: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  ingredientSize: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  form: {
    gap: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  nameInputContainer: {
    flex: 2,
  },
  gramsInputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  sizeSection: {
    marginTop: SPACING.xs,
  },
  sizeLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sizeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  sizeButtonText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
  sizeButtonTextActive: {
    color: COLORS.primary,
  },
  formButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  confirmButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textInverse,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  addButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.primary,
  },
});
