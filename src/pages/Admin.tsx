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
import { AdminAIAnalytics } from '@/components/admin/AdminAIAnalytics';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { RoleManagement } from '@/components/admin/RoleManagement';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Shield } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsersManager />;
      case 'roles':
        return <RoleManagement />;
      case 'content':
        return <AdminContentManager />;
      case 'proposals':
        return <AdminProposalsManager />;
      case 'incidents':
        return <AdminIncidentsManager />;
      case 'safe-spaces':
        return <AdminSafeSpacesManager />;
      case 'challenges':
        return <AdminChallengesManager />;
      case 'moderation':
        return <AdminModerationManager />;
      case 'gamification':
        return <AdminGamificationManager />;
      case 'sponsors':
        return <AdminSponsorsManager />;
      case 'ai-analytics':
        return <AdminAIAnalytics />;
      case 'settings':
        return <AdminSettingsManager />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-background">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-5">
            <Shield className="w-full h-full animate-spin-slow text-gold" style={{ animationDuration: '40s' }} />
          </div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-5">
            <Shield className="w-full h-full animate-spin-slow text-gold" style={{ animationDuration: '50s', animationDirection: 'reverse' }} />
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>

        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <main className="flex-1 overflow-auto relative z-10">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-primary-foreground/20 bg-background/80 backdrop-blur-lg px-6">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-gold animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace(/-/g, ' ')}
              </h1>
            </div>
          </header>
          
          <div className="p-6 animate-fade-in">
            <Card className="p-6 bg-background/95 backdrop-blur-sm border-primary-foreground/20 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              {renderContent()}
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
