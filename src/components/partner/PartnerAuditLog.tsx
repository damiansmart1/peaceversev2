import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ClipboardList, 
  Download, 
  Eye, 
  FileDown,
  Filter,
  User,
  Calendar,
  Search,
  Settings,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface AuditEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  category: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Simulated audit log - in production this would come from backend
const generateAuditEntries = (userEmail: string): AuditEntry[] => {
  const actions = [
    { action: 'view_dashboard', category: 'access', details: 'Accessed Partner Dashboard' },
    { action: 'export_report', category: 'export', details: 'Exported Comprehensive Report (PDF)' },
    { action: 'view_incidents', category: 'access', details: 'Viewed incident details' },
    { action: 'apply_filter', category: 'filter', details: 'Applied filter: Kenya, Last 30 days' },
    { action: 'download_data', category: 'export', details: 'Downloaded incident data (CSV)' },
    { action: 'view_hotspots', category: 'access', details: 'Accessed predictive hotspots' },
    { action: 'save_filter', category: 'settings', details: 'Saved filter preset' },
    { action: 'view_correlations', category: 'access', details: 'Viewed incident correlations' },
  ];

  return actions.map((a, i) => ({
    id: crypto.randomUUID(),
    userId: 'current-user',
    userEmail,
    action: a.action,
    category: a.category,
    details: a.details,
    ipAddress: '192.168.1.xxx',
    timestamp: new Date(Date.now() - i * 3600000 * (Math.random() * 5)),
    metadata: {},
  })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const PartnerAuditLog = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    // Generate mock entries
    setEntries(generateAuditEntries(user?.email || 'partner@example.com'));
  }, [user]);

  const filteredEntries = categoryFilter === 'all' 
    ? entries 
    : entries.filter(e => e.category === categoryFilter);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'access': return <Eye className="w-3.5 h-3.5" />;
      case 'export': return <FileDown className="w-3.5 h-3.5" />;
      case 'filter': return <Filter className="w-3.5 h-3.5" />;
      case 'settings': return <Settings className="w-3.5 h-3.5" />;
      default: return <ClipboardList className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'access': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'export': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'filter': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'settings': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleExportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Category', 'Details', 'IP Address'].join(','),
      ...filteredEntries.map(e => [
        format(e.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        e.userEmail,
        e.action,
        e.category,
        `"${e.details}"`,
        e.ipAddress || 'N/A',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-medium">Audit Trail</CardTitle>
              <CardDescription className="text-xs">
                Track all data access and export activities
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="access">Access</SelectItem>
                <SelectItem value="export">Exports</SelectItem>
                <SelectItem value="filter">Filters</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
            
            <Button size="sm" variant="outline" className="h-8" onClick={handleExportAuditLog}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-4 pt-0 space-y-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded ${getCategoryColor(entry.category)}`}>
                      {getCategoryIcon(entry.category)}
                    </div>
                    <div>
                      <p className="text-sm">{entry.details}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{entry.userEmail}</span>
                        {entry.ipAddress && (
                          <>
                            <span>•</span>
                            <span>IP: {entry.ipAddress}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={`text-[10px] ${getCategoryColor(entry.category)}`}>
                      {entry.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(entry.timestamp, 'MMM d, HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ClipboardList className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No audit entries found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground flex items-center gap-2">
        <Shield className="w-3.5 h-3.5" />
        <span>All activities are logged for compliance with ISO 27001 and GDPR requirements</span>
      </div>
    </Card>
  );
};
