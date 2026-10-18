import AccessibleMedia from '@/components/AccessibleMedia';
import { useCMSContent } from '@/hooks/useCMS';
import { Skeleton } from '@/components/ui/skeleton';

interface CMSAudioProps {
  contentKey: string;
  fallbackSrc?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}

export default function CMSAudio({ 
  contentKey, 
  fallbackSrc,
  className = '',
  controls = true,
  autoPlay = false,
  loop = false,
}: CMSAudioProps) {
  const { data, isLoading } = useCMSContent(contentKey);
  
  const src = data?.media_url || fallbackSrc;

  if (isLoading) {
    return <Skeleton className={`h-12 ${className}`} />;
  }

  if (!src) {
    return null;
  }

  return (
    <AccessibleMedia kind="audio" src={src} title={data?.title || contentKey} description={data?.content || undefined} className={className} />
  );
}
