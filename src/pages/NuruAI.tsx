import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Brain, FileText, MessageSquareText, Building2, BarChart3, Shield, Search, BookOpen } from 'lucide-react';
import Navigation from '@/components/Navigation';
import DashboardHeroBanner from '@/components/DashboardHeroBanner';
import NuruDocumentLibrary from '@/components/nuruai/NuruDocumentLibrary';
import NuruQuestionInterface from '@/components/nuruai/NuruQuestionInterface';
import NuruAccountabilityArchive from '@/components/nuruai/NuruAccountabilityArchive';
import NuruAnalyticsDashboard from '@/components/nuruai/NuruAnalyticsDashboard';
import NuruGovernancePortal from '@/components/nuruai/NuruGovernancePortal';
import NuruClaimReview from '@/components/nuruai/NuruClaimReview';
import nuruHeroBg from '@/assets/nuruai-hero-bg.jpg';

const tabItems = [
  { value: 'documents', label: 'Document Library', icon: FileText },
  { value: 'questions', label: 'Civic Q&A', icon: MessageSquareText },
  { value: 'accountability', label: 'Accountability Archive', icon: Building2 },
  { value: 'claims', label: 'Claim Review', icon: Search },
  { value: 'analytics', label: 'Civic Analytics', icon: BarChart3 },
  { value: 'governance', label: 'AI Governance', icon: Shield },
];

const NuruAI = () => {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-6">
        <DashboardHeroBanner
          icon={<Brain className="h-8 w-8 text-primary" />}
          title="NuruAI — Civic Intelligence"
          subtitle="Transforming public documents into understandable civic knowledge for democratic participation"
          backgroundImage={nuruHeroBg}
          accentColor="primary"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-12 items-center gap-1 bg-card/80 backdrop-blur-sm border border-border/50 p-1 rounded-xl w-auto min-w-full">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 px-4 py-2.5 whitespace-nowrap text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              <TabsContent value="documents" className="mt-0"><NuruDocumentLibrary /></TabsContent>
              <TabsContent value="questions" className="mt-0"><NuruQuestionInterface /></TabsContent>
              <TabsContent value="accountability" className="mt-0"><NuruAccountabilityArchive /></TabsContent>
              <TabsContent value="claims" className="mt-0"><NuruClaimReview /></TabsContent>
              <TabsContent value="analytics" className="mt-0"><NuruAnalyticsDashboard /></TabsContent>
              <TabsContent value="governance" className="mt-0"><NuruGovernancePortal /></TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
};

export default NuruAI;
