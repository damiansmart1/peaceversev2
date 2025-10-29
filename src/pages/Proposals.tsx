import Navigation from '@/components/Navigation';
import ProposalList from '@/components/ProposalList';
import CreateProposalDialog from '@/components/CreateProposalDialog';
import { useTranslationContext } from '@/components/TranslationProvider';

const Proposals = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Public Participation
              </h1>
              <p className="text-muted-foreground text-lg">
                Propose bills, discuss policies, and make your voice heard
              </p>
            </div>
            <CreateProposalDialog />
          </div>
          
          <ProposalList />
        </div>
      </div>
    </div>
  );
};

export default Proposals;
