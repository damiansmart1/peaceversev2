import { useProposals } from '@/hooks/useProposals';
import ProposalCard from './ProposalCard';
import { ListSkeleton } from './skeletons/FeedSkeleton';
import EmptyState, { FileText } from './EmptyState';
import { Reveal } from './motion/Reveal';

const ProposalList = () => {
  const { data: proposals, isLoading, error } = useProposals();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListSkeleton count={4} />
        <ListSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        variant="alerts"
        title="We couldn't load proposals"
        description="There was a problem reaching the server. Please try refreshing the page."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <EmptyState
        variant="default"
        icon={FileText}
        title="No proposals yet"
        description="Proposals shape the future of our communities. Start the conversation by drafting the first one."
        actionLabel="Create a proposal"
        onAction={() => {
          const btn = document.querySelector<HTMLButtonElement>('[data-create-proposal]');
          btn?.click();
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {proposals.map((proposal, i) => (
        <Reveal key={proposal.id} delay={i * 60} from="bottom">
          <ProposalCard proposal={proposal} />
        </Reveal>
      ))}
    </div>
  );
};

export default ProposalList;
