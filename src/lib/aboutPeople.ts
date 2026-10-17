import { z } from 'zod';
const webUrl = z.string().trim().refine(v => !v || /^https?:\/\//i.test(v), 'Use an http or https link');
export const personSchema = z.object({
  name: z.string().trim().min(1).max(120), role_title: z.string().trim().max(160),
  category: z.enum(['founder', 'team', 'partner']), organization: z.string().trim().max(160),
  bio: z.string().trim().max(4000), fun_intro: z.string().trim().max(500),
  website_url: webUrl, linkedin_url: webUrl,
  display_order: z.coerce.number().int().min(0), is_published: z.boolean(), image_path: z.string().nullable(),
});
export function validatePortrait(file: Pick<File, 'type' | 'size'>) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP image');
  if (file.size > 5 * 1024 * 1024) throw new Error('Portrait must be 5 MB or smaller');
  return file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
}
