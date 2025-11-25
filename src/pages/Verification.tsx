import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useVerificationTasks } from '@/hooks/useVerificationTasks';
import { VerificationQueue } from '@/components/VerificationQueue';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function Verification() {
  const [activeTab, setActiveTab] = useState('pending');
  const { tasks, isLoading } = useVerificationTasks();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const pendingTasks = tasks?.filter((t: any) => t.status === 'pending') || [];
  const assignedTasks = tasks?.filter((t: any) => t.status === 'in_progress') || [];
  const completedTasks = tasks?.filter((t: any) => t.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Verification Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review and verify citizen reports to ensure accuracy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-foreground">{pendingTasks.length}</p>
              </div>
              <Clock className="w-12 h-12 text-amber-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                <p className="text-3xl font-bold text-foreground">{assignedTasks.length}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-foreground">{completedTasks.length}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="pending">
              Pending
              {pendingTasks.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned
              {assignedTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {assignedTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <VerificationQueue />
          </TabsContent>

          <TabsContent value="assigned" className="mt-6">
            <VerificationQueue />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <VerificationQueue />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


