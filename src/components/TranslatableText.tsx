import React, { useState, useEffect } from 'react';
import { useContentTranslation } from '@/hooks/useContentTranslation';
import { useTranslationContext } from './TranslationProvider';
import { Skeleton } from '@/components/ui/skeleton';

interface TranslatableTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  showLoading?: boolean;
}

export const TranslatableText: React.FC<TranslatableTextProps> = ({
  text,
  className = '',
  as: Component = 'span',
  showLoading = false
}) => {
  const { language } = useTranslationContext();
  const { translateText, isTranslating } = useContentTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const doTranslation = async () => {
      if (language === 'en') {
        setTranslatedText(text);
        return;
      }

      setLoading(true);
      try {
        const result = await translateText(text, language);
        if (mounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (mounted) {
          setTranslatedText(text);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    doTranslation();

    return () => {
      mounted = false;
    };
  }, [text, language, translateText]);

  if (showLoading && (loading || isTranslating)) {
    return <Skeleton className={`h-4 w-24 ${className}`} />;
  }

  return React.createElement(Component, { className }, translatedText);
};

export default TranslatableText;
