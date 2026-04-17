import { useSponsorships } from '@/hooks/useWorldClassProposals';
import { Badge } from '@/components/ui/badge';
import { Handshake } from 'lucide-react';

interface Props { proposalId: string; }

const SponsorshipBanner = ({ proposalId }: Props) => {
  const { data: sponsors = [] } = useSponsorships(proposalId);
  if (!sponsors.length) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Handshake className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Co-hosted by</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {sponsors.map((s: any) => (
          <div key={s.id} className="flex items-center gap-2">
            {s.partner_logo_url && <img src={s.partner_logo_url} alt={s.partner_name} className="h-8 w-auto rounded" />}
            <span className="font-medium text-sm">{s.partner_name}</span>
            <Badge variant="outline" className="text-xs capitalize">{s.sponsorship_type.replace('_', ' ')}</Badge>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2 italic">
        {sponsors[0].disclosure_text}
      </p>
    </div>
  );
};

export default SponsorshipBanner;
