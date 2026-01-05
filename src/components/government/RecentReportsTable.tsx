import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, ExternalLink, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Report {
  id: string;
  title: string;
  category: string;
  status: string;
  verification_status: string;
  severity_level: string;
  location_country: string | null;
  location_region: string | null;
  created_at: string;
}

interface RecentReportsTableProps {
  reports: Report[] | undefined;
  isLoading: boolean;
}

export const RecentReportsTable = ({ reports, isLoading }: RecentReportsTableProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'under_review':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Recent Reports</CardTitle>
              <CardDescription>Latest citizen submissions</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/incidents')}>
            View All
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent reports
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow 
                    key={report.id} 
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => navigate(`/incidents?id=${report.id}`)}
                  >
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {report.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {report.location_region || report.location_country || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(report.severity_level || 'medium')}>
                        {report.severity_level || 'medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(report.status || 'pending')}>
                        {(report.status || 'pending').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
