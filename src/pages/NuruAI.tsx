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
        {/* Premium Hero */}
        <div className="relative overflow-hidden border-b border-border/20">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/5" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
          
          <div className="container mx-auto px-4 py-6 relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150" />
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/15 shadow-lg shadow-primary/10">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
              </motion.div>
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">NuruAI</h1>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gradient-to-r from-primary/15 to-secondary/10 text-primary border border-primary/15 backdrop-blur-sm">
                    Civic Intelligence
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Evidence-grounded policy intelligence for democratic participation</p>
              </motion.div>
            </div>

            {/* Tab Navigation - Pill Style */}
            <motion.div 
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin"
            >
              {tabItems.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                    activeTab === tab.value
                      ? 'bg-card text-foreground shadow-md shadow-primary/5 border border-border/40'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                  }`}
                >
                  {activeTab === tab.value && (
                    <motion.div
                      layoutId="activeNuruTab"
                      className="absolute inset-0 bg-card rounded-xl border border-border/40 shadow-md shadow-primary/5"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <tab.icon className={`h-3.5 w-3.5 ${activeTab === tab.value ? 'text-primary' : ''}`} />
                    {tab.label}
                  </span>
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-5">
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
