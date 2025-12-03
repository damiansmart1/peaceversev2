import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Cloud, CloudOff, RefreshCw, Trash2, Clock, 
  CheckCircle, AlertCircle, Upload, FileText
} from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface QueuedReport {
  id: string;
  title: string;
  category: string;
  description: string;
  queuedAt: string;
  retryCount?: number;
}

const OfflineReportQueue = () => {
  const [queuedReports, setQueuedReports] = useState<QueuedReport[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline, syncOfflineReports } = useOfflineStatus();

  const loadQueuedReports = () => {
    const queueKey = 'peaceverse_offline_reports';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    setQueuedReports(queue);
  };

  useEffect(() => {
    loadQueuedReports();
    
    // Listen for storage changes
    const handleStorageChange = () => loadQueuedReports();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSyncAll = async () => {
    if (!isOnline) {
      toast.error('No internet connection');
      return;
    }
    
    setIsSyncing(true);
    try {
      const result = await syncOfflineReports();
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} reports successfully`);
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} reports failed to sync`);
      }
      loadQueuedReports();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveReport = (reportId: string) => {
    const queueKey = 'peaceverse_offline_reports';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    const updatedQueue = queue.filter((r: QueuedReport) => r.id !== reportId);
    localStorage.setItem(queueKey, JSON.stringify(updatedQueue));
    setQueuedReports(updatedQueue);
    toast.success('Report removed from queue');
  };

  const handleClearAll = () => {
    const queueKey = 'peaceverse_offline_reports';
    localStorage.setItem(queueKey, JSON.stringify([]));
    setQueuedReports([]);
    toast.success('Queue cleared');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isOnline ? (
                <Cloud className="w-5 h-5 text-green-500" />
              ) : (
                <CloudOff className="w-5 h-5 text-yellow-500" />
              )}
              Offline Report Queue
            </CardTitle>
            <CardDescription>
              {queuedReports.length} report{queuedReports.length !== 1 ? 's' : ''} waiting to sync
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {queuedReports.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSyncAll}
                  disabled={!isOnline || isSyncing}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync All
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {queuedReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No pending reports</p>
            <p className="text-sm">All reports have been synced</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {queuedReports.map((report) => (
                <div 
                  key={report.id} 
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{report.title || 'Untitled Report'}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {report.description?.substring(0, 50)}...
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {report.category || 'general'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {report.queuedAt ? format(new Date(report.queuedAt), 'MMM d, HH:mm') : 'Unknown'}
                        </span>
                        {report.retryCount && report.retryCount > 0 && (
                          <Badge variant="outline" className="text-xs text-yellow-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {report.retryCount} retries
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveReport(report.id)}
                    className="shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {!isOnline && queuedReports.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <p className="text-sm text-yellow-600">
              You're offline. Reports will sync automatically when connected.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfflineReportQueue;
