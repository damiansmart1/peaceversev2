import { useCMSContent } from '@/hooks/useCMS';
import { Skeleton } from '@/components/ui/skeleton';

interface CMSImageProps {
  contentKey: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function CMSImage({ 
  contentKey, 
  fallbackSrc = '/placeholder.svg',
  alt = '',
  className = '',
  width,
  height,
}: CMSImageProps) {
  const { data, isLoading } = useCMSContent(contentKey);
  
  const src = data?.media_url || fallbackSrc;
  const altText = data?.media_alt || alt;

  if (isLoading) {
    return (
      <Skeleton 
        className={className} 
        style={{ width: width || '100%', height: height || '200px' }} 
      />
    );
  }

  return (
    <img
      src={src}
      alt={altText}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}
