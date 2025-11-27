import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation, TranslationContextType, Language } from '@/hooks/useTranslation';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const translation = useTranslation();

  // Set the HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = translation.language;
    // Set RTL direction for Arabic
    if (translation.language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [translation.language]);

  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};

// Re-export Language type for convenience
export type { Language };