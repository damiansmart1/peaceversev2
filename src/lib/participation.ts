import { z } from 'zod';

export const materialSchema = z.object({
  title: z.string().trim().min(1).max(200),
  context: z.string().trim().max(2000),
  language: z.string().min(2).max(10),
  url: z.string().url().max(2048).refine(value => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  }, 'Use a secure HTTPS reference link').optional(),
});
export interface MaterialDraft { title: string; context: string; language: string; file?: File; url?: string }
export interface Material { id: string; title: string; context: string; language: string; kind: string; storage_path: string | null; url: string | null }
const mimeTypes: Record<string, string[]> = {
  jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'],
  mp4: ['video/mp4'], webm: ['video/webm'], pdf: ['application/pdf'], txt: ['text/plain'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};
export function validateMaterialFile(file: Pick<File, 'name' | 'type' | 'size'>) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!mimeTypes[extension]?.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, MP4, WebM, PDF, TXT or DOCX file');
  if (file.size <= 0 || file.size > 20 * 1024 * 1024) throw new Error('Choose a non-empty file smaller than 20 MB');
  return extension;
}
export const pollInputSchema = z.object({
  title: z.string().trim().min(1).max(200), description: z.string().trim().max(500).optional(),
  options: z.array(z.string().trim().min(1).max(100)).min(2).max(10),
  pollType: z.enum(['single_choice', 'multiple_choice', 'rating', 'yes_no']),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
});
export function validateBallot(options: number[], count: number, multiple: boolean, max: number) {
  if (!options.length || new Set(options).size !== options.length || options.some(i => !Number.isInteger(i) || i < 0 || i >= count)) throw new Error('Select valid, distinct options');
  if ((!multiple && options.length !== 1) || options.length > max) throw new Error('Too many options selected');
}