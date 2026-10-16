import { ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Mail, MessageCircle, Send, Linkedin, Facebook, Twitter, Smartphone, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CANONICAL = 'https://peaceverse.sautistack.africa';

/** Public, non-expiring link. Preview/sandbox hosts are swapped for the live site. */
export const publicUrl = (path: string) => {
  const o = typeof window !== 'undefined' ? window.location.origin : CANONICAL;
  const internal = /localhost|id-preview--|lovableproject\.com|sandbox/.test(o);
  return `${internal ? CANONICAL : o}${path}`;
};

interface SharePopupProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  text?: string;
  path: string;
  kind?: 'poll' | 'proposal';
  onShared?: (platform: string) => void;
}

export const SharePopup = ({ open, onOpenChange, title, text, path, kind = 'poll', onShared }: SharePopupProps) => {
  const url = publicUrl(path);
  const [copied, setCopied] = useState(false);
  const msg = `${text || (kind === 'poll' ? 'Add your voice to this poll' : 'Read and support this proposal')}: ${title}`;
  const e = encodeURIComponent;

  const platforms: { id: string; label: string; icon: ReactNode; href: string; tone: string }[] = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="h-5 w-5" />, href: `https://wa.me/?text=${e(`${msg}\n${url}`)}`, tone: 'bg-secondary/15 text-secondary' },
    { id: 'telegram', label: 'Telegram', icon: <Send className="h-5 w-5" />, href: `https://t.me/share/url?url=${e(url)}&text=${e(msg)}`, tone: 'bg-primary/15 text-primary' },
    { id: 'x', label: 'X', icon: <Twitter className="h-5 w-5" />, href: `https://twitter.com/intent/tweet?text=${e(msg)}&url=${e(url)}`, tone: 'bg-foreground/10 text-foreground' },
    { id: 'facebook', label: 'Facebook', icon: <Facebook className="h-5 w-5" />, href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`, tone: 'bg-primary/15 text-primary' },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-5 w-5" />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`, tone: 'bg-primary/15 text-primary' },
    { id: 'sms', label: 'SMS', icon: <Smartphone className="h-5 w-5" />, href: `sms:?&body=${e(`${msg} ${url}`)}`, tone: 'bg-accent/20 text-accent-foreground' },
    { id: 'email', label: 'Email', icon: <Mail className="h-5 w-5" />, href: `mailto:?subject=${e(title)}&body=${e(`${msg}\n\n${url}`)}`, tone: 'bg-muted text-foreground' },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onShared?.('clipboard');
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Your browser blocked copying — select the link and copy it manually');
    }
  };

  const nativeShare = async () => {
    try { await navigator.share({ title, text: msg, url }); onShared?.('native'); } catch { /* cancelled */ }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" />Share this {kind}</DialogTitle>
          <DialogDescription className="line-clamp-2">{title}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 py-2">
          {platforms.map((p, i) => (
            <motion.a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onShared?.(p.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.94 }}
              className="flex flex-col items-center gap-1.5 rounded-xl p-2 hover:bg-muted/60"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${p.tone}`}>{p.icon}</span>
              <span className="text-[11px] font-medium text-foreground">{p.label}</span>
            </motion.a>
          ))}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button type="button" onClick={nativeShare} className="flex flex-col items-center gap-1.5 rounded-xl p-2 hover:bg-muted/60">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground"><Share2 className="h-5 w-5" /></span>
              <span className="text-[11px] font-medium text-foreground">More</span>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Input readOnly value={url} onFocus={(ev) => ev.currentTarget.select()} className="text-xs" />
          <Button onClick={copy} className="shrink-0 gap-1.5">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePopup;
