import Navigation from '@/components/Navigation';
import ProposalList from '@/components/ProposalList';
import CreateProposalDialog from '@/components/CreateProposalDialog';
import { ProposalFilters } from '@/components/ProposalFilters';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, TrendingUp, Clock, Archive } from 'lucide-react';

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

          <ProposalFilters />

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all" className="gap-2">
                <FileText className="w-4 h-4" />
                All Proposals
              </TabsTrigger>
              <TabsTrigger value="trending" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="w-4 h-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="archived" className="gap-2">
                <Archive className="w-4 h-4" />
                Archived
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ProposalList />
            </TabsContent>

            <TabsContent value="trending">
              <ProposalList />
            </TabsContent>

            <TabsContent value="recent">
              <ProposalList />
            </TabsContent>

            <TabsContent value="archived">
              <ProposalList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Proposals;
