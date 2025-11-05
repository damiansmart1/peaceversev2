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
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Menu } from 'lucide-react';

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
      case 'settings':
        return <AdminSettingsManager />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-xl font-semibold">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace(/-/g, ' ')}
            </h1>
          </header>
          
          <div className="p-6">
            <Card className="p-6">
              {renderContent()}
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
