import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FileText, MessageSquareText, Building2, BarChart3, Shield, Search, Sparkles } from 'lucide-react';
import Navigation from '@/components/Navigation';
import NuruDocumentLibrary from '@/components/nuruai/NuruDocumentLibrary';
import NuruQuestionInterface from '@/components/nuruai/NuruQuestionInterface';
import NuruAccountabilityArchive from '@/components/nuruai/NuruAccountabilityArchive';
import NuruAnalyticsDashboard from '@/components/nuruai/NuruAnalyticsDashboard';
import NuruGovernancePortal from '@/components/nuruai/NuruGovernancePortal';
import NuruClaimReview from '@/components/nuruai/NuruClaimReview';

const tabItems = [
  { value: 'questions', label: 'AI Chat', icon: MessageSquareText, desc: 'Ask policy questions' },
  { value: 'documents', label: 'Documents', icon: FileText, desc: 'Policy library' },
  { value: 'claims', label: 'Fact Check', icon: Search, desc: 'Verify claims' },
  { value: 'accountability', label: 'Accountability', icon: Building2, desc: 'Track responses' },
  { value: 'analytics', label: 'Analytics', icon: BarChart3, desc: 'Usage insights' },
  { value: 'governance', label: 'Governance', icon: Shield, desc: 'AI transparency' },
];

const NuruAI = () => {
  const [activeTab, setActiveTab] = useState('questions');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-0">
        {/* Compact Hero */}
        <div className="relative overflow-hidden border-b border-border/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="container mx-auto px-4 py-5 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/15 blur-xl rounded-full" />
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">NuruAI</h1>
                  <span className="px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20">Civic Intelligence</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Evidence-grounded policy intelligence for democratic participation</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-0.5 overflow-x-auto pb-px -mb-px">
              {tabItems.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.value
                      ? 'bg-card text-foreground border-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/20'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.12 }}
            >
              {activeTab === 'questions' && <NuruQuestionInterface />}
              {activeTab === 'documents' && <NuruDocumentLibrary />}
              {activeTab === 'claims' && <NuruClaimReview />}
              {activeTab === 'accountability' && <NuruAccountabilityArchive />}
              {activeTab === 'analytics' && <NuruAnalyticsDashboard />}
              {activeTab === 'governance' && <NuruGovernancePortal />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default NuruAI;
