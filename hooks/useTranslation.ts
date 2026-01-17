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
  const t = useCallback((key: string, options?: Record<string, unknown>): string => {
    return translate(key, options);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set language function
  const setLanguage = useCallback(async (newLanguage: SupportedLanguage) => {
    await setI18nLanguage(newLanguage);
    setLanguageState(newLanguage);
    notifyListeners(newLanguage);
  }, []);

  // Get raw translation (for arrays, objects)
  const getRawTranslation = useCallback((key: string): unknown => {
    return getRawI18nTranslation(key);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

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
