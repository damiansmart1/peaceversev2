import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { OPTION_IMAGE_BUCKET } from './OptionImage';

const useSigned = (path?: string | null) =>
  useQuery({
    queryKey: ['poll-option-image', path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(OPTION_IMAGE_BUCKET).createSignedUrl(path!, 3600);
      if (error) throw error;
      return data.signedUrl as string;
    },
  });

/** Wide cover image shown at the top of a poll. Renders nothing when the poll has no banner. */
export default function PollBanner({ path, alt }: { path?: string | null; alt: string }) {
  const { data: url } = useSigned(path);
  if (!path) return null;
  return (
    <div className="relative -mx-5 -mt-5 mb-1 aspect-[12/5] overflow-hidden bg-muted sm:-mx-6 sm:-mt-6">
      {url && <img src={url} alt={alt} loading="lazy" width={1536} height={640} className="h-full w-full object-cover" />}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
    </div>
  );
}

const MAX = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Upload a banner into the poll's private image folder; returns the stored path. */
export async function uploadPollBanner(file: File): Promise<string> {
  if (!TYPES.includes(file.type)) throw new Error('Banner must be a JPG, PNG or WebP image');
  if (file.size > MAX) throw new Error('Banner must be under 5 MB');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in to add a banner');
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${user.id}/banner-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(OPTION_IMAGE_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Banner upload failed: ${error.message}`);
  return path;
}

/** Picker with preview. `file` is the newly chosen file; `existingPath` shows the current banner. */
export function BannerPicker({
  file, onFile, existingPath, onClearExisting,
}: { file: File | null; onFile: (f: File | null) => void; existingPath?: string | null; onClearExisting?: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { data: existingUrl } = useSigned(!file ? existingPath : null);
  const shown = preview || existingUrl;

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!TYPES.includes(f.type)) return toast.error('Banner must be a JPG, PNG or WebP image');
    if (f.size > MAX) return toast.error('Banner must be under 5 MB');
    setPreview(URL.createObjectURL(f));
    onFile(f);
  };

  return (
    <div className="space-y-2">
      <input ref={ref} type="file" accept={TYPES.join(',')} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {shown ? (
        <div className="relative aspect-[12/5] overflow-hidden rounded-lg border bg-muted">
          <img src={shown} alt="Banner preview" className="h-full w-full object-cover" />
          <Button
            type="button" size="icon" variant="secondary" className="absolute right-2 top-2 h-7 w-7"
            onClick={() => { setPreview(null); onFile(null); if (!file) onClearExisting?.(); }}
            aria-label="Remove banner"
          ><X className="h-4 w-4" /></Button>
        </div>
      ) : (
        <button
          type="button" onClick={() => ref.current?.click()}
          className="flex aspect-[12/5] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground"
        >
          <ImagePlus className="h-6 w-6" />
          Add a banner image (optional)
          <span className="text-xs">Wide photo, JPG/PNG/WebP, up to 5 MB</span>
        </button>
      )}
    </div>
  );
}
