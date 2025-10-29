import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Linkedin, Mail, Copy } from 'lucide-react';
import { useShareProposal } from '@/hooks/useProposals';
import { toast } from 'sonner';

interface ProposalShareButtonsProps {
  proposalId: string;
  title: string;
  summary: string;
  slug: string;
}

const ProposalShareButtons = ({ proposalId, title, summary, slug }: ProposalShareButtonsProps) => {
  const shareProposal = useShareProposal();
  const url = `${window.location.origin}/proposals/${slug}`;

  const handleShare = async (platform: string, shareUrl?: string) => {
    await shareProposal.mutateAsync({ proposalId, platform });
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    await shareProposal.mutateAsync({ proposalId, platform: 'clipboard' });
    toast.success('Link copied to clipboard');
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(summary + '\n\n' + url)}`,
  };

  return (
    <div className="p-6 bg-card border border-border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Share2 className="w-5 h-5" />
        Share This Proposal
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter', shareUrls.twitter)}
          className="gap-2"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook', shareUrls.facebook)}
          className="gap-2"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin', shareUrls.linkedin)}
          className="gap-2"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('email', shareUrls.email)}
          className="gap-2"
        >
          <Mail className="w-4 h-4" />
          Email
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy Link
        </Button>
      </div>
    </div>
  );
};

export default ProposalShareButtons;
