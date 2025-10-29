import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AdminContentManager } from '@/components/admin/AdminContentManager';
import { AdminProposalsManager } from '@/components/admin/AdminProposalsManager';
import { AdminSafeSpacesManager } from '@/components/admin/AdminSafeSpacesManager';
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
      
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="content">Content Stories</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="safe-spaces">Safe Spaces</TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
};

export default Admin;
