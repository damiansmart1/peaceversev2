import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
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
import { Loader2 } from 'lucide-react';

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
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
