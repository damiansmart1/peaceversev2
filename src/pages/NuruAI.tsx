import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Brain, FileText, MessageSquareText, Building2, BarChart3, Shield, Search, Sparkles } from 'lucide-react';
import Navigation from '@/components/Navigation';
import NuruDocumentLibrary from '@/components/nuruai/NuruDocumentLibrary';
import NuruQuestionInterface from '@/components/nuruai/NuruQuestionInterface';
import NuruAccountabilityArchive from '@/components/nuruai/NuruAccountabilityArchive';
import NuruAnalyticsDashboard from '@/components/nuruai/NuruAnalyticsDashboard';
import NuruGovernancePortal from '@/components/nuruai/NuruGovernancePortal';
import NuruClaimReview from '@/components/nuruai/NuruClaimReview';

const tabItems = [
  { value: 'questions', label: 'AI Chat', icon: MessageSquareText },
  { value: 'documents', label: 'Documents', icon: FileText },
  { value: 'claims', label: 'Fact Check', icon: Search },
  { value: 'accountability', label: 'Accountability', icon: Building2 },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  { value: 'governance', label: 'Governance', icon: Shield },
];

const NuruAI = () => {
  const [activeTab, setActiveTab] = useState('questions');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-0">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-sm">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">NuruAI</h1>
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20">Civic Intelligence</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Transform complex policy documents into actionable civic knowledge</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mt-6 overflow-x-auto pb-px">
              {tabItems.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.value
                      ? 'bg-card text-foreground border-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/30'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
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
