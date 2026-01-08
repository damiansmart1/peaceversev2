import { useCMSContent } from '@/hooks/useCMS';
import SafeHTML from '@/components/SafeHTML';

interface CMSTextProps {
  contentKey: string;
  fallback?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  className?: string;
  html?: boolean;
}

export default function CMSText({ 
  contentKey, 
  fallback = '', 
  as: Component = 'span',
  className = '',
  html = false,
}: CMSTextProps) {
  const { data, isLoading } = useCMSContent(contentKey);
  
  const content = data?.content || fallback;

  if (isLoading) {
    return <Component className={className}>{fallback}</Component>;
  }

  if (html || data?.content_type === 'html') {
    return <SafeHTML html={content} className={className} />;
  }

  return <Component className={className}>{content}</Component>;
}
