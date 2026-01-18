/**
 * Translation Hook
 * 
 * React hook for accessing translations with automatic re-rendering on language change.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  t as translate, 
  getCurrentLanguage, 
  setLanguage as setI18nLanguage,
  initializeI18n,
  getRawTranslation as getRawI18nTranslation,
  SupportedLanguage 
} from '../services/i18n';

// Event emitter for language changes
type LanguageChangeListener = (language: SupportedLanguage) => void;
const listeners: Set<LanguageChangeListener> = new Set();

function notifyListeners(language: SupportedLanguage) {
  listeners.forEach(listener => listener(language));
}

/**
 * Hook for using translations in components
 */
export function useTranslation() {
  const [language, setLanguageState] = useState<SupportedLanguage>(getCurrentLanguage());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on mount
  useEffect(() => {
    initializeI18n().then((initialLanguage) => {
      setLanguageState(initialLanguage);
      setIsInitialized(true);
    });
  }, []);

  // Subscribe to language changes
  useEffect(() => {
    const listener: LanguageChangeListener = (newLanguage) => {
      setLanguageState(newLanguage);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Translation function
  // Note: language is used to force re-creation when language changes,
  // ensuring components re-render with updated translations
  const t = useCallback((key: string, options?: Record<string, unknown>): string => {
    // Reference language to satisfy exhaustive-deps and ensure re-render on change
    void language;
    return translate(key, options);
  }, [language]);

  // Set language function
  const setLanguage = useCallback(async (newLanguage: SupportedLanguage) => {
    await setI18nLanguage(newLanguage);
    setLanguageState(newLanguage);
    notifyListeners(newLanguage);
  }, []);

  // Get raw translation (for arrays, objects)
  // Note: language is used to force re-creation when language changes
  const getRawTranslation = useCallback((key: string): unknown => {
    // Reference language to satisfy exhaustive-deps and ensure re-render on change
    void language;
    return getRawI18nTranslation(key);
  }, [language]);

  return {
    t,
    language,
    setLanguage,
    isInitialized,
    getRawTranslation,
  };
}

/**
 * Export the standalone translation function for use outside of React components
 */
export { translate as t };
