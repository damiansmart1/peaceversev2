import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useShareProposal } from '@/hooks/useProposals';
import SharePopup from '@/components/SharePopup';

interface ProposalShareButtonsProps {
  proposalId: string;
  title: string;
  summary: string;
  slug?: string;
}

const ProposalShareButtons = ({ proposalId, title }: ProposalShareButtonsProps) => {
  const shareProposal = useShareProposal();
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6 bg-card border border-border rounded-lg space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Share2 className="w-5 h-5" /> Share this proposal
      </h3>
      <p className="text-sm text-muted-foreground">Bring more voices in — share on WhatsApp, SMS, social media or email.</p>
      <Button onClick={() => setOpen(true)} className="gap-2"><Share2 className="w-4 h-4" />Share</Button>
      <SharePopup
        open={open}
        onOpenChange={setOpen}
        kind="proposal"
        title={title}
        path={`/proposals/${proposalId}`}
        onShared={(platform) => shareProposal.mutate({ proposalId, platform })}
      />
    </div>
  );
};

export default ProposalShareButtons;
