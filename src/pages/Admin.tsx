import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useAdminCheck();

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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Admin Portal</h1>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="safe-spaces">Safe Spaces</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card className="p-6">
            <AdminDashboard />
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <AdminUsersManager />
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card className="p-6">
            <AdminContentManager />
          </Card>
        </TabsContent>

        <TabsContent value="proposals">
          <Card className="p-6">
            <AdminProposalsManager />
          </Card>
        </TabsContent>

        <TabsContent value="safe-spaces">
          <Card className="p-6">
            <AdminSafeSpacesManager />
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <Card className="p-6">
            <AdminChallengesManager />
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card className="p-6">
            <AdminModerationManager />
          </Card>
        </TabsContent>

        <TabsContent value="gamification">
          <Card className="p-6">
            <AdminGamificationManager />
          </Card>
        </TabsContent>

        <TabsContent value="sponsors">
          <Card className="p-6">
            <AdminSponsorsManager />
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <AdminSettingsManager />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
