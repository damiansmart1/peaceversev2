import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card } from '@/components/ui/card';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminContentManager } from '@/components/admin/AdminContentManager';
import { AdminProposalsManager } from '@/components/admin/AdminProposalsManager';
import { AdminSafeSpacesManager } from '@/components/admin/AdminSafeSpacesManager';
import { AdminUsersManager } from '@/components/admin/AdminUsersManager';
import { AdminChallengesManager } from '@/components/admin/AdminChallengesManager';
import { AdminModerationManager } from '@/components/admin/AdminModerationManager';
import { AdminGamificationManager } from '@/components/admin/AdminGamificationManager';
import { AdminSettingsManager } from '@/components/admin/AdminSettingsManager';
import { AdminSponsorsManager } from '@/components/admin/AdminSponsorsManager';
import { AdminIncidentsManager } from '@/components/admin/AdminIncidentsManager';
import { AdminIncidentTimelineTracker } from '@/components/admin/AdminIncidentTimelineTracker';
import { AdminAIAnalytics } from '@/components/admin/AdminAIAnalytics';
import { AdminAPIUsageAnalytics } from '@/components/admin/AdminAPIUsageAnalytics';
import { AdminIntegrationsManager } from '@/components/admin/AdminIntegrationsManager';
import { AdminCommunicationManager } from '@/components/admin/AdminCommunicationManager';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { RoleManagement } from '@/components/admin/RoleManagement';
import AdminPeaceMetricsManager from '@/components/admin/AdminPeaceMetricsManager';
import { AdminRoleFeatureManager } from '@/components/admin/AdminRoleFeatureManager';
import AdminCMSManager from '@/components/admin/AdminCMSManager';
import AdminElectionsManager from '@/components/admin/AdminElectionsManager';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import adminHeroBg from '@/assets/admin-hero-bg.jpg';

const Admin = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useAdminCheck();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground text-sm">Loading admin portal...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const sectionTitle = activeSection === 'dashboard' 
    ? 'Dashboard' 
    : activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace(/-/g, ' ');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboard />;
      case 'users': return <AdminUsersManager />;
      case 'roles': return <RoleManagement />;
      case 'feature-access': return <AdminRoleFeatureManager />;
      case 'content': return <AdminContentManager />;
      case 'cms': return <AdminCMSManager />;
      case 'proposals': return <AdminProposalsManager />;
      case 'incidents': return <AdminIncidentsManager />;
      case 'incident-timeline': return <AdminIncidentTimelineTracker />;
      case 'safe-spaces': return <AdminSafeSpacesManager />;
      case 'challenges': return <AdminChallengesManager />;
      case 'moderation': return <AdminModerationManager />;
      case 'gamification': return <AdminGamificationManager />;
      case 'sponsors': return <AdminSponsorsManager />;
      case 'ai-analytics': return <AdminAIAnalytics />;
      case 'api-analytics': return <AdminAPIUsageAnalytics />;
      case 'integrations': return <AdminIntegrationsManager />;
      case 'comm-hub':
      case 'broadcasts':
      case 'ocha-docs':
      case 'field-reports': return <AdminCommunicationManager />;
      case 'peace-metrics': return <AdminPeaceMetricsManager />;
      case 'elections': return <AdminElectionsManager />;
      case 'nuru-ai': return <AdminNuruAIManager />;
      case 'settings': return <AdminSettingsManager />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <main className="flex-1 overflow-auto">
          {/* Admin Header with Hero Image */}
          <header className="sticky top-0 z-20 border-b border-border/50 overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0">
                <img src={adminHeroBg} alt="" className="w-full h-full object-cover opacity-15" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90" />
              </div>
              <div className="relative flex h-16 items-center gap-4 px-6">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 bg-gold/15 rounded-lg border border-gold/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Shield className="h-5 w-5 text-gold" />
                  </motion.div>
                  <div>
                    <h1 className="text-lg font-bold text-foreground tracking-tight">
                      {sectionTitle}
                    </h1>
                    <p className="text-xs text-muted-foreground">Admin Portal</p>
                  </div>
                </div>
                {/* Gold accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              </div>
            </div>
          </header>
          
          <motion.div 
            className="p-6"
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
              {renderContent()}
            </Card>
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
