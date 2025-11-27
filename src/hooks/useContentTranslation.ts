import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslationContext } from '@/components/TranslationProvider';

interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

export const useContentTranslation = () => {
  const { language } = useTranslationContext();
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<TranslationCache>({});

  const translateText = useCallback(async (
    text: string,
    targetLang?: string
  ): Promise<string> => {
    const toLang = targetLang || language;
    
    // Return original if target is English or text is empty
    if (toLang === 'en' || !text || text.trim() === '') {
      return text;
    }

    // Create a cache key from the text
    const cacheKey = text.substring(0, 100); // Use first 100 chars as key
    
    // Check cache first
    if (cacheRef.current[cacheKey]?.[toLang]) {
      return cacheRef.current[cacheKey][toLang];
    }

    setIsTranslating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('translate-content', {
        body: {
          text,
          fromLang: 'en',
          toLang
        }
      });

      if (fnError) throw fnError;
      
      if (data?.translatedText) {
        // Cache the translation
        if (!cacheRef.current[cacheKey]) {
          cacheRef.current[cacheKey] = {};
        }
        cacheRef.current[cacheKey][toLang] = data.translatedText;
        return data.translatedText;
      }
      
      return text;
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
      return text; // Return original on error
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  const translateBatch = useCallback(async (
    texts: string[],
    targetLang?: string
  ): Promise<string[]> => {
    const toLang = targetLang || language;
    
    if (toLang === 'en') {
      return texts;
    }

    const results = await Promise.all(
      texts.map(text => translateText(text, toLang))
    );
    
    return results;
  }, [language, translateText]);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  return {
    translateText,
    translateBatch,
    isTranslating,
    error,
    clearCache,
    currentLanguage: language
  };
};

export default useContentTranslation;
