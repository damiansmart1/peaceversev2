import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { cn } from '@/lib/utils';

export const OPTION_IMAGE_BUCKET = 'poll-option-images';

/** Signed thumbnail for a poll option image stored in the private bucket. */
export default function OptionImage({ path, alt, className }: { path?: string | null; alt: string; className?: string }) {
  const { data: url } = useQuery({
    queryKey: ['poll-option-image', path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(OPTION_IMAGE_BUCKET).createSignedUrl(path!, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
  if (!path) return null;
  return (
    <span className={cn('block shrink-0 overflow-hidden rounded-lg bg-muted', className)}>
      {url && <img src={url} alt={alt} loading="lazy" className="h-full w-full object-contain" />}
    </span>
  );
}
