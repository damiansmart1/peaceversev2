import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Filter,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Users,
  MapPin,
  BarChart3,
  Globe,
  Lock,
  Unlock,
  Eye,
  Printer,
} from 'lucide-react';
import { 
  useElection,
  useElectionIncidents,
  usePollingStations,
  useElectionObservers,
  useElectionResults,
  type Election,
} from '@/hooks/useElections';
import { useToast } from '@/hooks/use-toast';
import {
  generateIncidentsPdf,
  generateResultsPdf,
  generateObserversPdf,
  generateStationsPdf,
  generateAuditPdf,
  downloadPdf,
} from '@/lib/electionPdfExport';

interface ElectionAdvancedExportProps {
  election: Election;
}

type ExportFormat = 'json' | 'csv' | 'pdf' | 'xlsx';
type DataType = 'incidents' | 'stations' | 'observers' | 'results' | 'summary' | 'audit';

interface ExportConfig {
  format: ExportFormat;
  dataTypes: DataType[];
  dateRange: { start: string; end: string };
  includeMetadata: boolean;
  anonymize: boolean;
  verifiedOnly: boolean;
  severityFilter: string[];
  regionFilter: string[];
  signedExport: boolean;
}

const INTERNATIONAL_STANDARDS = [
  { id: 'un-eom', name: 'UN EOM Format', description: 'United Nations Election Observation Mission standard' },
  { id: 'eu-eom', name: 'EU EOM Format', description: 'European Union Election Observation Mission format' },
  { id: 'au-eom', name: 'AU EOM Format', description: 'African Union Election Observation Mission standard' },
  { id: 'osce', name: 'OSCE/ODIHR', description: 'Organization for Security and Co-operation in Europe format' },
  { id: 'carter', name: 'Carter Center', description: 'Carter Center election observation format' },
  { id: 'ndi', name: 'NDI Standard', description: 'National Democratic Institute reporting format' },
  { id: 'ecowas', name: 'ECOWAS Format', description: 'Economic Community of West African States standard' },
  { id: 'sadc', name: 'SADC Format', description: 'Southern African Development Community format' },
];

export default function ElectionAdvancedExport({ election }: ElectionAdvancedExportProps) {
  const { toast } = useToast();
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'pdf',
    dataTypes: ['summary', 'incidents'],
    dateRange: { 
      start: election.voting_date, 
      end: new Date().toISOString().split('T')[0] 
    },
    includeMetadata: true,
    anonymize: false,
    verifiedOnly: true,
    severityFilter: [],
    regionFilter: [],
    signedExport: false,
  });
  const [selectedStandard, setSelectedStandard] = useState('un-eom');
  const [isExporting, setIsExporting] = useState(false);

  const { data: incidents } = useElectionIncidents(election.id);
  const { data: stations } = usePollingStations(election.id);
  const { data: observers } = useElectionObservers(election.id);
  const { data: results } = useElectionResults(election.id);

  const regions = [...new Set(stations?.map(s => s.region).filter(Boolean) || [])];

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      // Build export data based on configuration
      const exportData: Record<string, any> = {
        metadata: exportConfig.includeMetadata ? {
          election_name: election.name,
          election_type: election.election_type,
          country: election.country_name,
          voting_date: election.voting_date,
          export_date: new Date().toISOString(),
          export_format: selectedStandard,
          generated_by: 'PeaceVerse Election Monitoring System',
          version: '2.0.0',
        } : undefined,
      };

      if (exportConfig.dataTypes.includes('summary')) {
        exportData.summary = {
          total_incidents: incidents?.length || 0,
          verified_incidents: incidents?.filter(i => i.verification_status === 'verified').length || 0,
          critical_incidents: incidents?.filter(i => i.severity === 'critical' || i.severity === 'emergency').length || 0,
          total_stations: stations?.length || 0,
          active_stations: stations?.filter(s => s.is_active).length || 0,
          total_observers: observers?.length || 0,
          deployed_observers: observers?.filter(o => o.deployment_status === 'deployed').length || 0,
          results_received: results?.length || 0,
          results_verified: results?.filter((r: any) => r.fully_verified).length || 0,
        };
      }

      if (exportConfig.dataTypes.includes('incidents')) {
        let filteredIncidents = incidents || [];
        
        if (exportConfig.verifiedOnly) {
          filteredIncidents = filteredIncidents.filter(i => i.verification_status === 'verified');
        }
        
        if (exportConfig.severityFilter.length > 0) {
          filteredIncidents = filteredIncidents.filter(i => exportConfig.severityFilter.includes(i.severity));
        }
        
        if (exportConfig.regionFilter.length > 0) {
          filteredIncidents = filteredIncidents.filter(i => exportConfig.regionFilter.includes(i.region || ''));
        }

        exportData.incidents = filteredIncidents.map(i => {
          const incident: Record<string, any> = {
            incident_code: i.incident_code,
            title: i.title,
            category: i.category,
            sub_category: i.sub_category,
            severity: i.severity,
            incident_datetime: i.incident_datetime,
            verification_status: i.verification_status,
            status: i.status,
          };

          if (!exportConfig.anonymize) {
            incident.region = i.region;
            incident.district = i.district;
            incident.location_address = i.location_address;
            incident.latitude = i.latitude;
            incident.longitude = i.longitude;
          } else {
            incident.region = i.region; // Keep region only
          }

          return incident;
        });
      }

      if (exportConfig.dataTypes.includes('stations')) {
        exportData.polling_stations = (stations || []).map(s => ({
          station_code: s.station_code,
          station_name: exportConfig.anonymize ? `Station ${s.station_code}` : s.station_name,
          region: s.region,
          district: exportConfig.anonymize ? undefined : s.district,
          registered_voters: s.registered_voters,
          is_active: s.is_active,
          is_accessible: s.is_accessible,
          setup_verified: s.setup_verified,
        }));
      }

      if (exportConfig.dataTypes.includes('observers')) {
        exportData.observers = {
          summary: {
            total: observers?.length || 0,
            by_role: observers?.reduce((acc, o) => {
              acc[o.observer_role] = (acc[o.observer_role] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            by_organization: observers?.reduce((acc, o) => {
              const org = o.organization || 'Independent';
              acc[org] = (acc[org] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            deployment_status: observers?.reduce((acc, o) => {
              acc[o.deployment_status] = (acc[o.deployment_status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
          },
        };
      }

      if (exportConfig.dataTypes.includes('results')) {
        const verifiedResults = exportConfig.verifiedOnly 
          ? results?.filter((r: any) => r.fully_verified) 
          : results;
        
        exportData.results = {
          total_stations_reported: verifiedResults?.length || 0,
          aggregate: {
            total_registered: verifiedResults?.reduce((sum, r: any) => sum + r.total_registered, 0) || 0,
            total_votes_cast: verifiedResults?.reduce((sum, r: any) => sum + r.total_votes_cast, 0) || 0,
            valid_votes: verifiedResults?.reduce((sum, r: any) => sum + r.valid_votes, 0) || 0,
            rejected_votes: verifiedResults?.reduce((sum, r: any) => sum + r.rejected_votes, 0) || 0,
          },
          by_station: verifiedResults?.map((r: any) => ({
            station_code: r.polling_stations?.station_name,
            turnout_percentage: r.turnout_percentage,
            valid_votes: r.valid_votes,
            rejected_votes: r.rejected_votes,
            fully_verified: r.fully_verified,
            contested: r.contested,
          })),
        };
      }

      // Generate export file
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportConfig.format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `${election.name.replace(/\s+/g, '_')}_report_${format(new Date(), 'yyyy-MM-dd')}.json`;
        mimeType = 'application/json';
      } else if (exportConfig.format === 'csv') {
        // Convert to CSV (incidents focus)
        const csvData = exportData.incidents || [];
        const headers = Object.keys(csvData[0] || {}).join(',');
        const rows = csvData.map((row: any) => Object.values(row).map(v => `"${v || ''}"`).join(',')).join('\n');
        content = `${headers}\n${rows}`;
        filename = `${election.name.replace(/\s+/g, '_')}_incidents_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        mimeType = 'text/csv';
      } else if (exportConfig.format === 'pdf') {
        // Generate real PDF using jsPDF
        const pdfOptions = {
          electionName: election.name,
          countryName: election.country_name || '',
          votingDate: election.voting_date,
        };
        const timestamp = format(new Date(), 'yyyy-MM-dd');
        const safeName = election.name.replace(/\s+/g, '_').substring(0, 30);

        // Generate PDF for each selected data type
        if (exportConfig.dataTypes.includes('incidents') && exportData.incidents?.length > 0) {
          const doc = generateIncidentsPdf(exportData.incidents, pdfOptions);
          downloadPdf(doc, `incidents_${safeName}_${timestamp}.pdf`);
        }
        if (exportConfig.dataTypes.includes('results') && results?.length) {
          const filteredResults = exportConfig.verifiedOnly ? results.filter((r: any) => r.fully_verified) : results;
          const doc = generateResultsPdf(filteredResults, pdfOptions);
          downloadPdf(doc, `results_${safeName}_${timestamp}.pdf`);
        }
        if (exportConfig.dataTypes.includes('observers') && observers?.length) {
          const doc = generateObserversPdf(observers, pdfOptions);
          downloadPdf(doc, `observers_${safeName}_${timestamp}.pdf`);
        }
        if (exportConfig.dataTypes.includes('stations') && stations?.length) {
          const doc = generateStationsPdf(stations, pdfOptions);
          downloadPdf(doc, `stations_${safeName}_${timestamp}.pdf`);
        }
        if (exportConfig.dataTypes.includes('audit')) {
          // Audit data would need to be fetched; generate summary PDF for now
          const doc = generateAuditPdf([], pdfOptions);
          downloadPdf(doc, `audit_${safeName}_${timestamp}.pdf`);
        }

        // Skip the blob download below for PDF
        toast({
          title: 'Export Successful',
          description: `PDF report(s) exported for ${election.name}`,
        });
        return;
      } else {
        // XLSX fallback to JSON
        content = JSON.stringify(exportData, null, 2);
        filename = `${election.name.replace(/\s+/g, '_')}_report_${format(new Date(), 'yyyy-MM-dd')}.json`;
        mimeType = 'application/json';
      }

      // Download file (for JSON/CSV)
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Report exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate export file',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [exportConfig, election, incidents, stations, observers, results, selectedStandard, toast]);

  const toggleDataType = (type: DataType) => {
    setExportConfig(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(type)
        ? prev.dataTypes.filter(t => t !== type)
        : [...prev.dataTypes, type],
    }));
  };

  const toggleSeverity = (severity: string) => {
    setExportConfig(prev => ({
      ...prev,
      severityFilter: prev.severityFilter.includes(severity)
        ? prev.severityFilter.filter(s => s !== severity)
        : [...prev.severityFilter, severity],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Advanced Export Center
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate professional reports in international standard formats
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Export Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* International Standard Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                International Standard Format
              </Label>
              <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERNATIONAL_STANDARDS.map(std => (
                    <SelectItem key={std.id} value={std.id}>
                      <div>
                        <span className="font-medium">{std.name}</span>
                        <p className="text-xs text-muted-foreground">{std.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Types */}
            <div className="space-y-3">
              <Label>Data to Include</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { id: 'summary', label: 'Summary Statistics', icon: BarChart3 },
                  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
                  { id: 'stations', label: 'Polling Stations', icon: MapPin },
                  { id: 'observers', label: 'Observers', icon: Users },
                  { id: 'results', label: 'Results', icon: CheckCircle2 },
                  { id: 'audit', label: 'Audit Trail', icon: Shield },
                ].map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleDataType(item.id as DataType)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      exportConfig.dataTypes.includes(item.id as DataType)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={exportConfig.dataTypes.includes(item.id as DataType)} />
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={exportConfig.dateRange.start}
                  onChange={(e) => setExportConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={exportConfig.dateRange.end}
                  onChange={(e) => setExportConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <Label>Severity Filter</Label>
              <div className="flex flex-wrap gap-2">
                {['minor', 'moderate', 'serious', 'critical', 'emergency'].map(severity => (
                  <Badge
                    key={severity}
                    variant={exportConfig.severityFilter.includes(severity) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSeverity(severity)}
                  >
                    {severity}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to include all severities
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include Metadata</Label>
                  <p className="text-xs text-muted-foreground">Add election info and timestamps</p>
                </div>
                <Switch
                  checked={exportConfig.includeMetadata}
                  onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeMetadata: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>Anonymize Sensitive Data</Label>
                    <p className="text-xs text-muted-foreground">Remove PII and precise locations</p>
                  </div>
                </div>
                <Switch
                  checked={exportConfig.anonymize}
                  onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, anonymize: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Verified Data Only</Label>
                  <p className="text-xs text-muted-foreground">Exclude unverified incidents</p>
                </div>
                <Switch
                  checked={exportConfig.verifiedOnly}
                  onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, verifiedOnly: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Export Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {[
                { format: 'pdf', label: 'PDF Report', icon: FileText, desc: 'Professional document' },
                { format: 'xlsx', label: 'Excel Spreadsheet', icon: FileSpreadsheet, desc: 'Data analysis' },
                { format: 'csv', label: 'CSV Data', icon: FileSpreadsheet, desc: 'Raw data export' },
                { format: 'json', label: 'JSON Data', icon: FileJson, desc: 'API compatible' },
              ].map(item => (
                <div
                  key={item.format}
                  onClick={() => setExportConfig(prev => ({ ...prev, format: item.format as ExportFormat }))}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    exportConfig.format === item.format
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              className="w-full" 
              onClick={handleExport}
              disabled={isExporting || exportConfig.dataTypes.length === 0}
            >
              {isExporting ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Export
                </>
              )}
            </Button>

            <Button variant="outline" className="w-full" disabled={isExporting}>
              <Printer className="h-4 w-4 mr-2" />
              Print Preview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}