import { motion } from 'framer-motion';
import { useMyReports } from '@/hooks/useMyReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportStatusTimeline } from './ReportStatusTimeline';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { FileText, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export const ReportTracker = () => {
  const { reports, isLoading } = useMyReports();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Reports Yet"
        description="You haven't submitted any incident reports. Once you do, you'll be able to track their progress here."
      />
    );
  }

  // Calculate statistics
  const stats = {
    total: reports.length,
    pending: reports.filter((r: any) => r.status === 'pending' || r.status === 'under_review').length,
    verified: reports.filter((r: any) => r.verification_status === 'verified').length,
    resolved: reports.filter((r: any) => r.resolution_status === 'resolved' || r.resolution_status === 'closed').length,
  };

  // Categorize reports
  const activeReports = reports.filter((r: any) => 
    r.resolution_status !== 'resolved' && r.resolution_status !== 'closed' && r.verification_status !== 'rejected'
  );
  
  const completedReports = reports.filter((r: any) => 
    r.resolution_status === 'resolved' || r.resolution_status === 'closed' || r.verification_status === 'rejected'
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold text-foreground">{stats.pending}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-foreground">{stats.verified}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-foreground">{stats.resolved}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" className="uppercase tracking-wide">
            Active Reports
            {activeReports.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeReports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="uppercase tracking-wide">
            Completed
            {completedReports.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {completedReports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeReports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Active Reports"
              description="All your reports have been completed or resolved."
            />
          ) : (
            activeReports.map((report: any, index: number) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <ReportStatusTimeline report={report} />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedReports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Completed Reports"
              description="Your completed reports will appear here."
            />
          ) : (
            completedReports.map((report: any, index: number) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="border-2 opacity-75">
                  <CardContent className="pt-6">
                    <ReportStatusTimeline report={report} />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
