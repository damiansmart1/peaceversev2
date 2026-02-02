import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  File,
  Calendar,
  Filter,
  BarChart3
} from 'lucide-react';
import { type Election } from '@/hooks/useElections';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ElectionReportsExportProps {
  elections: Election[];
}

type ReportType = 'incidents' | 'results' | 'observers' | 'stations' | 'audit';

export default function ElectionReportsExport({ elections }: ElectionReportsExportProps) {
  const { toast } = useToast();
  const [selectedElection, setSelectedElection] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReports, setSelectedReports] = useState<ReportType[]>(['incidents']);
  const [isExporting, setIsExporting] = useState(false);

  const reportTypes: { value: ReportType; label: string; description: string; icon: React.ReactNode }[] = [
    { 
      value: 'incidents', 
      label: 'Election Incidents', 
      description: 'All reported election incidents with verification status',
      icon: <FileText className="h-5 w-5 text-orange-500" />
    },
    { 
      value: 'results', 
      label: 'Election Results', 
      description: 'Polling station results with signature verification',
      icon: <BarChart3 className="h-5 w-5 text-green-500" />
    },
    { 
      value: 'observers', 
      label: 'Observers Report', 
      description: 'Registered observers and deployment status',
      icon: <FileSpreadsheet className="h-5 w-5 text-blue-500" />
    },
    { 
      value: 'stations', 
      label: 'Polling Stations', 
      description: 'All polling stations with setup verification status',
      icon: <File className="h-5 w-5 text-purple-500" />
    },
    { 
      value: 'audit', 
      label: 'Audit Trail', 
      description: 'Complete immutable audit log of all actions',
      icon: <FileText className="h-5 w-5 text-red-500" />
    },
  ];

  const toggleReport = (reportType: ReportType) => {
    setSelectedReports(prev => 
      prev.includes(reportType) 
        ? prev.filter(r => r !== reportType)
        : [...prev, reportType]
    );
  };

  const handleExport = async (exportFormat: 'csv' | 'json' | 'pdf') => {
    if (selectedReports.length === 0) {
      toast({ title: 'Select at least one report type', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    try {
      const exportData: Record<string, any> = {};

      for (const reportType of selectedReports) {
        const tableName = getTableName(reportType);
        let query = supabase.from(tableName as any).select('*');
        
        if (selectedElection !== 'all') {
          query = query.eq('election_id', selectedElection);
        }
        
        if (startDate) {
          query = query.gte('created_at', startDate);
        }
        if (endDate) {
          query = query.lte('created_at', endDate + 'T23:59:59');
        }

        const { data, error } = await query;
        if (error) throw error;
        
        exportData[reportType] = data;
      }

      // Generate export file
      const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
      const electionName = selectedElection === 'all' 
        ? 'all-elections' 
        : elections.find(e => e.id === selectedElection)?.name.replace(/\s+/g, '-') || 'election';
      
      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        downloadFile(blob, `election-report_${electionName}_${timestamp}.json`);
      } else if (exportFormat === 'csv') {
        // Export each report type as separate CSV
        for (const [reportType, data] of Object.entries(exportData)) {
          if (Array.isArray(data) && data.length > 0) {
            const csv = convertToCSV(data);
            const blob = new Blob([csv], { type: 'text/csv' });
            downloadFile(blob, `${reportType}_${electionName}_${timestamp}.csv`);
          }
        }
      }

      toast({ 
        title: 'Export Complete', 
        description: `Exported ${selectedReports.length} report(s) successfully` 
      });
    } catch (error: any) {
      toast({ title: 'Export Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const getTableName = (reportType: ReportType): string => {
    const tables: Record<ReportType, string> = {
      incidents: 'election_incidents',
      results: 'election_results',
      observers: 'election_observers',
      stations: 'polling_stations',
      audit: 'election_audit_log',
    };
    return tables[reportType];
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value).includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Export Filters
          </CardTitle>
          <CardDescription>
            Configure the data range and election to export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Election</Label>
              <Select value={selectedElection} onValueChange={setSelectedElection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select election" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Elections</SelectItem>
                  {elections.map(election => (
                    <SelectItem key={election.id} value={election.id}>
                      {election.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <Card>
        <CardHeader>
          <CardTitle>Select Reports to Export</CardTitle>
          <CardDescription>
            Choose which data sets to include in your export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map(report => (
              <div
                key={report.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedReports.includes(report.value)
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => toggleReport(report.value)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedReports.includes(report.value)}
                    onCheckedChange={() => toggleReport(report.value)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {report.icon}
                      <span className="font-medium">{report.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Format</CardTitle>
          <CardDescription>
            Choose your preferred export format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => handleExport('csv')}
              disabled={isExporting || selectedReports.length === 0}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export as CSV
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleExport('json')}
              disabled={isExporting || selectedReports.length === 0}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Export as JSON
            </Button>
            <Button 
              variant="outline"
              onClick={() => toast({ title: 'PDF Export', description: 'PDF export coming soon' })}
              disabled={true}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export as PDF (Coming Soon)
            </Button>
          </div>
          
          {selectedReports.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Select at least one report type to enable export
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
