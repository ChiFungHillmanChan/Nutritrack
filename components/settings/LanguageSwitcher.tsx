/**
 * Language Switcher Component
 * 
 * Allows users to switch between supported languages.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../services/i18n';
import { useTranslation } from '../../hooks/useTranslation';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === language);

  const handleLanguageSelect = async (langCode: SupportedLanguage) => {
    await setLanguage(langCode);
    setModalVisible(false);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="globe-outline" size={24} color={COLORS.primary} />
        <Text style={styles.compactText}>{currentLanguage?.nativeLabel}</Text>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <LanguageModal
            currentLanguage={language}
            onSelect={handleLanguageSelect}
            onClose={() => setModalVisible(false)}
            t={t}
          />
        </Modal>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setModalVisible(true)}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="globe-outline" size={22} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{t('settings.language')}</Text>
          <Text style={styles.value}>{currentLanguage?.nativeLabel}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <LanguageModal
          currentLanguage={language}
          onSelect={handleLanguageSelect}
          onClose={() => setModalVisible(false)}
          t={t}
        />
      </Modal>
    </TouchableOpacity>
  );
}

interface LanguageModalProps {
  currentLanguage: SupportedLanguage;
  onSelect: (lang: SupportedLanguage) => void;
  onClose: () => void;
  t: (key: string) => string;
}

function LanguageModal({ currentLanguage, onSelect, onClose, t }: LanguageModalProps) {
  return (
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('settings.languageSettings')}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsList}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.optionItem,
                currentLanguage === lang.code && styles.optionItemSelected,
              ]}
              onPress={() => onSelect(lang.code)}
              activeOpacity={0.7}
            >
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionLabel,
                  currentLanguage === lang.code && styles.optionLabelSelected,
                ]}>
                  {lang.nativeLabel}
                </Text>
                <Text style={styles.optionSubtitle}>{lang.label}</Text>
              </View>
              {currentLanguage === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  compactText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionsList: {
    paddingVertical: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  optionItemSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  optionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
});

export default LanguageSwitcher;
