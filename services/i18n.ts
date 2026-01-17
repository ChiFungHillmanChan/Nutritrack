/**
 * Internationalization Service
 * 
 * Configures i18n-js with expo-localization for device language detection.
 * Supports English (en) and Traditional Chinese (zh-TW).
 */

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en';
import zhTW from '../locales/zh-TW';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = '@nutritrack_language';

// Supported languages
export type SupportedLanguage = 'en' | 'zh-TW';

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'zh-TW', label: 'Traditional Chinese', nativeLabel: '繁體中文' },
];

// Create i18n instance
const i18n = new I18n({
  en,
  'zh-TW': zhTW,
});

// Set default locale and fallback
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

/**
 * Get the device's preferred language, mapped to our supported languages
 */
function getDeviceLanguage(): SupportedLanguage {
  const deviceLocales = Localization.getLocales();
  
  if (deviceLocales && deviceLocales.length > 0) {
    const primaryLocale = deviceLocales[0];
    const languageCode = primaryLocale.languageCode;
    const regionCode = primaryLocale.regionCode;
    
    // Check for Chinese variants
    if (languageCode === 'zh') {
      // Traditional Chinese regions
      if (regionCode === 'TW' || regionCode === 'HK' || regionCode === 'MO') {
        return 'zh-TW';
      }
      // Default Chinese to Traditional for this app
      return 'zh-TW';
    }
  }
  
  // Default to English
  return 'en';
}

/**
 * Initialize i18n with stored preference or device language
 */
export async function initializeI18n(): Promise<SupportedLanguage> {
  try {
    // Try to get stored language preference
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'zh-TW')) {
      i18n.locale = storedLanguage;
      return storedLanguage;
    }
    
    // Fall back to device language
    const deviceLanguage = getDeviceLanguage();
    i18n.locale = deviceLanguage;
    return deviceLanguage;
  } catch {
    // On error, use device language
    const deviceLanguage = getDeviceLanguage();
    i18n.locale = deviceLanguage;
    return deviceLanguage;
  }
}

/**
 * Set the app language and persist to storage
 */
export async function setLanguage(language: SupportedLanguage): Promise<void> {
  i18n.locale = language;
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

/**
 * Get the current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return i18n.locale as SupportedLanguage;
}

/**
 * Translation function
 */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

/**
 * Get raw translation value (for arrays and complex objects)
 */
export function getRawTranslation(key: string): unknown {
  // Get current locale translations
  const translations = i18n.translations[i18n.locale] || i18n.translations[i18n.defaultLocale];
  
  // Navigate to the key
  const keys = key.split('.');
  let value: unknown = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if not found
    }
  }
  
  return value;
}

// Export the i18n instance for direct access if needed
export { i18n };
