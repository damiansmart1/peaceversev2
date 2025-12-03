import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  FileJson, 
  FileText, 
  FileSpreadsheet, 
  Filter, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Bell,
  RefreshCw,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType, HeadingLevel } from 'docx';
import CountrySelector, { getCountryName } from './CountrySelector';
import { format } from 'date-fns';

interface ReportFilters {
  country: string;
  dateFrom: string;
  dateTo: string;
  severity: string;
  category: string;
  status: string;
  dataType: 'incidents' | 'alerts' | 'risks' | 'hotspots';
}

interface ReportingCenterProps {
  selectedCountry?: string;
}

const ReportingCenter = ({ selectedCountry = 'ALL' }: ReportingCenterProps) => {
  const [filters, setFilters] = useState<ReportFilters>({
    country: selectedCountry,
    dateFrom: '',
    dateTo: '',
    severity: 'all',
    category: 'all',
    status: 'all',
    dataType: 'incidents',
  });
  const [isExporting, setIsExporting] = useState(false);

  // Sync selectedCountry prop with filters state
  useEffect(() => {
    setFilters(prev => ({ ...prev, country: selectedCountry }));
  }, [selectedCountry]);

  // Fetch data based on filters
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['report-data', filters],
    queryFn: async () => {
      let data: any[] = [];
      
      switch (filters.dataType) {
        case 'incidents': {
          let query = supabase
            .from('citizen_reports')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (filters.country !== 'ALL') {
            query = query.eq('location_country', filters.country);
          }
          if (filters.severity !== 'all') {
            query = query.eq('severity_level', filters.severity);
          }
          if (filters.category !== 'all') {
            query = query.eq('category', filters.category);
          }
          if (filters.status !== 'all') {
            query = query.eq('status', filters.status);
          }
          if (filters.dateFrom) {
            query = query.gte('created_at', filters.dateFrom);
          }
          if (filters.dateTo) {
            query = query.lte('created_at', filters.dateTo);
          }
          
          const { data: incidents, error } = await query.limit(500);
          if (error) throw error;
          data = incidents || [];
          break;
        }

        case 'alerts': {
          // Alerts don't have country field, so we filter by linked incidents
          let query = supabase
            .from('alert_logs')
            .select('*')
            .order('triggered_at', { ascending: false });
          
          if (filters.severity !== 'all') {
            query = query.eq('severity', filters.severity);
          }
          if (filters.status !== 'all') {
            query = query.eq('status', filters.status);
          }
          if (filters.dateFrom) {
            query = query.gte('triggered_at', filters.dateFrom);
          }
          if (filters.dateTo) {
            query = query.lte('triggered_at', filters.dateTo);
          }
          
          const { data: alerts, error } = await query.limit(500);
          if (error) throw error;
          
          // If country filter is set, we need to filter alerts by their linked incidents
          if (filters.country !== 'ALL' && alerts) {
            // Get all incident IDs from alerts
            const incidentIds = alerts.flatMap(a => a.incident_ids || []);
            if (incidentIds.length > 0) {
              const { data: incidents } = await supabase
                .from('citizen_reports')
                .select('id, location_country')
                .in('id', incidentIds);
              
              const countryIncidentIds = new Set(
                (incidents || [])
                  .filter(i => i.location_country === filters.country)
                  .map(i => i.id)
              );
              
              data = alerts.filter(alert => 
                (alert.incident_ids || []).some((id: string) => countryIncidentIds.has(id))
              );
            } else {
              data = [];
            }
          } else {
            data = alerts || [];
          }
          break;
        }

        case 'risks': {
          let query = supabase
            .from('incident_risk_scores')
            .select('*, citizen_reports(title, location_country, location_city)')
            .order('created_at', { ascending: false });
          
          if (filters.severity !== 'all') {
            query = query.eq('threat_level', filters.severity);
          }
          if (filters.dateFrom) {
            query = query.gte('created_at', filters.dateFrom);
          }
          if (filters.dateTo) {
            query = query.lte('created_at', filters.dateTo);
          }
          
          const { data: risks, error } = await query.limit(500);
          if (error) throw error;
          
          // Filter by country through the joined citizen_reports
          if (filters.country !== 'ALL' && risks) {
            data = risks.filter(risk => 
              risk.citizen_reports?.location_country === filters.country
            );
          } else {
            data = risks || [];
          }
          break;
        }

        case 'hotspots': {
          let query = supabase
            .from('predictive_hotspots')
            .select('*')
            .order('predicted_at', { ascending: false });
          
          if (filters.country !== 'ALL') {
            query = query.eq('country', filters.country);
          }
          if (filters.severity !== 'all') {
            query = query.eq('risk_level', filters.severity);
          }
          if (filters.status !== 'all') {
            query = query.eq('status', filters.status);
          }
          
          const { data: hotspots, error } = await query.limit(500);
          if (error) throw error;
          data = hotspots || [];
          break;
        }
      }

      return data;
    },
  });

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!reportData?.length) return toast.error('No data to export');
    setIsExporting(true);
    try {
      const jsonStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      downloadBlob(blob, `peaceverse-${filters.dataType}-report-${Date.now()}.json`);
      toast.success('JSON report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export JSON');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData?.length) return toast.error('No data to export');
    setIsExporting(true);
    try {
      // Create CSV for Excel compatibility
      const headers = Object.keys(reportData[0]).join(',');
      const rows = reportData.map(row => 
        Object.values(row).map(val => 
          typeof val === 'object' ? JSON.stringify(val) : `"${String(val).replace(/"/g, '""')}"`
        ).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `peaceverse-${filters.dataType}-report-${Date.now()}.csv`);
      toast.success('Excel/CSV report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    if (!reportData?.length) return toast.error('No data to export');
    setIsExporting(true);
    try {
      const doc = new jsPDF('landscape');
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(7, 79, 152);
      doc.text('Peaceverse Early Warning Report', 14, 20);
      
      // Report info
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Report Type: ${filters.dataType.toUpperCase()}`, 14, 30);
      doc.text(`Country: ${getCountryName(filters.country)}`, 14, 36);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);
      doc.text(`Total Records: ${reportData.length}`, 14, 48);

      // Summary stats
      const severityCounts = reportData.reduce((acc: Record<string, number>, item: any) => {
        const sev = item.severity_level || item.severity || item.threat_level || item.risk_level || 'unknown';
        acc[sev] = (acc[sev] || 0) + 1;
        return acc;
      }, {});
      
      doc.text(`Severity Breakdown: Critical: ${severityCounts.critical || 0} | High: ${severityCounts.high || 0} | Medium: ${severityCounts.medium || 0} | Low: ${severityCounts.low || 0}`, 14, 54);

      // Table
      const columns = getTableColumns(filters.dataType);
      const tableData = reportData.map((row: any) => getTableRow(row, filters.dataType));

      autoTable(doc, {
        startY: 60,
        head: [columns],
        body: tableData,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [7, 79, 152], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`peaceverse-${filters.dataType}-report-${Date.now()}.pdf`);
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToWord = async () => {
    if (!reportData?.length) return toast.error('No data to export');
    setIsExporting(true);
    try {
      const columns = getTableColumns(filters.dataType);
      
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: 'Peaceverse Early Warning Report',
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Report Type: ${filters.dataType.toUpperCase()}`, break: 1 }),
                new TextRun({ text: `Country: ${getCountryName(filters.country)}`, break: 1 }),
                new TextRun({ text: `Generated: ${new Date().toLocaleString()}`, break: 1 }),
                new TextRun({ text: `Total Records: ${reportData.length}`, break: 2 }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: columns.map(col => 
                    new TableCell({ 
                      children: [new Paragraph({ text: col, alignment: AlignmentType.CENTER })],
                      shading: { fill: '074F98' },
                    })
                  ),
                }),
                ...reportData.slice(0, 100).map((row: any) => 
                  new TableRow({
                    children: getTableRow(row, filters.dataType).map(cell =>
                      new TableCell({ children: [new Paragraph(String(cell))] })
                    ),
                  })
                ),
              ],
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `peaceverse-${filters.dataType}-report-${Date.now()}.docx`);
      toast.success('Word document downloaded successfully');
    } catch (error) {
      toast.error('Failed to export Word document');
    } finally {
      setIsExporting(false);
    }
  };

  const getTableColumns = (dataType: string): string[] => {
    switch (dataType) {
      case 'incidents':
        return ['Title', 'Category', 'Severity', 'Status', 'Location', 'Country', 'Date'];
      case 'alerts':
        return ['Title', 'Type', 'Severity', 'Status', 'Message', 'Triggered At'];
      case 'risks':
        return ['Incident', 'Threat Level', 'Risk Score', 'Escalation Prob', 'Location', 'Date'];
      case 'hotspots':
        return ['Region', 'Country', 'Risk Level', 'Score', 'Confidence', 'Valid Until'];
      default:
        return [];
    }
  };

  const getTableRow = (row: any, dataType: string): string[] => {
    switch (dataType) {
      case 'incidents':
        return [
          row.title?.substring(0, 40) || '-',
          row.category || '-',
          row.severity_level || '-',
          row.status || '-',
          row.location_city || row.location_name || '-',
          row.location_country || '-',
          row.created_at ? format(new Date(row.created_at), 'MMM d, yyyy') : '-',
        ];
      case 'alerts':
        return [
          row.title?.substring(0, 40) || '-',
          row.alert_type || '-',
          row.severity || '-',
          row.status || '-',
          row.message?.substring(0, 50) || '-',
          row.triggered_at ? format(new Date(row.triggered_at), 'MMM d, yyyy HH:mm') : '-',
        ];
      case 'risks':
        return [
          row.citizen_reports?.title?.substring(0, 40) || '-',
          row.threat_level || '-',
          `${row.overall_risk_score || 0}%`,
          `${row.escalation_probability || 0}%`,
          row.citizen_reports?.location_city || '-',
          row.created_at ? format(new Date(row.created_at), 'MMM d, yyyy') : '-',
        ];
      case 'hotspots':
        return [
          row.region_name || '-',
          row.country || '-',
          row.risk_level || '-',
          `${row.hotspot_score || 0}`,
          `${row.confidence_level || 0}%`,
          row.valid_until ? format(new Date(row.valid_until), 'MMM d, yyyy') : '-',
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Reporting Center</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Country Selection - Prominent */}
      <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <Label className="text-sm font-semibold text-foreground">Select Country/Region:</Label>
          </div>
          <div className="flex-1 max-w-md">
            <CountrySelector
              value={filters.country}
              onValueChange={(v) => handleFilterChange('country', v)}
              className="h-10 bg-background"
            />
          </div>
          {filters.country !== 'ALL' && (
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Filtering: {getCountryName(filters.country)}
            </Badge>
          )}
        </div>
      </div>

      {/* Data Type Tabs */}
      <Tabs value={filters.dataType} onValueChange={(v) => handleFilterChange('dataType', v as any)} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Risk Scores
          </TabsTrigger>
          <TabsTrigger value="hotspots" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Hotspots
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">

        <div className="space-y-2">
          <Label className="text-xs font-medium">From Date</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">To Date</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Severity</Label>
          <Select value={filters.severity} onValueChange={(v) => handleFilterChange('severity', v)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Category</Label>
          <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="conflict">Conflict</SelectItem>
              <SelectItem value="violence">Violence</SelectItem>
              <SelectItem value="protest">Protest</SelectItem>
              <SelectItem value="disaster">Disaster</SelectItem>
              <SelectItem value="humanitarian">Humanitarian</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Status</Label>
          <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {reportData?.length || 0} Records Found
          </Badge>
          <span className="text-sm text-muted-foreground">
            {filters.country !== 'ALL' && `Country: ${getCountryName(filters.country)}`}
          </span>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToJSON}
            disabled={isExporting || !reportData?.length}
            className="gap-2"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            disabled={isExporting || !reportData?.length}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            disabled={isExporting || !reportData?.length}
            className="gap-2"
          >
            <FileText className="w-4 h-4 text-destructive" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToWord}
            disabled={isExporting || !reportData?.length}
            className="gap-2"
          >
            <FileText className="w-4 h-4 text-primary" />
            Word
          </Button>
        </div>
      </div>

      {/* Data Preview */}
      <ScrollArea className="h-[300px] border rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : reportData?.length ? (
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0">
              <tr>
                {getTableColumns(filters.dataType).map((col, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium text-foreground">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.slice(0, 50).map((row: any, i: number) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50">
                  {getTableRow(row, filters.dataType).map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Filter className="w-10 h-10 mb-2 opacity-50" />
            <p>No data matches the current filters</p>
          </div>
        )}
      </ScrollArea>

      {reportData && reportData.length > 50 && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Showing first 50 of {reportData.length} records. Export to view all data.
        </p>
      )}
    </Card>
  );
};

export default ReportingCenter;
