import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileJson, 
  FileSpreadsheet, 
  FileText, 
  File, 
  Download,
  Settings2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  exportProfessionalJSON, 
  exportProfessionalCSV, 
  exportProfessionalPDF, 
  exportProfessionalWord,
  ExportConfig,
  ExportColumn
} from '@/lib/professionalExportUtils';
import { toast } from 'sonner';
import type { PartnerAnalyticsData } from '@/hooks/usePartnerAnalytics';

interface PartnerReportExporterProps {
  analyticsData: PartnerAnalyticsData;
  dateRange?: { from?: string; to?: string };
  countryFilter?: string;
}

const REPORT_TYPES = [
  { value: 'comprehensive', label: 'Comprehensive Report', description: 'Full incident analysis with all metrics' },
  { value: 'incidents', label: 'Incident Details', description: 'Detailed incident records' },
  { value: 'geographic', label: 'Geographic Analysis', description: 'Regional distribution and hotspots' },
  { value: 'risk', label: 'Risk Assessment', description: 'Risk scores and recommendations' },
  { value: 'trends', label: 'Trend Analysis', description: 'Time-series data and patterns' },
];

const INCIDENT_COLUMNS: ExportColumn[] = [
  { key: 'title', header: 'Incident Title', format: 'text' },
  { key: 'category', header: 'Category', format: 'text' },
  { key: 'severity_level', header: 'Severity', format: 'text' },
  { key: 'status', header: 'Status', format: 'text' },
  { key: 'verification_status', header: 'Verification', format: 'text' },
  { key: 'location_country', header: 'Country', format: 'text' },
  { key: 'location_region', header: 'Region', format: 'text' },
  { key: 'location_city', header: 'City', format: 'text' },
  { key: 'created_at', header: 'Reported Date', format: 'datetime' },
  { key: 'verified_at', header: 'Verified Date', format: 'datetime' },
  { key: 'resolution_date', header: 'Resolution Date', format: 'datetime' },
  { key: 'casualties_reported', header: 'Casualties', format: 'number' },
  { key: 'injuries_reported', header: 'Injuries', format: 'number' },
  { key: 'estimated_people_affected', header: 'People Affected', format: 'number' },
  { key: 'description', header: 'Description', format: 'text' },
];

const GEOGRAPHIC_COLUMNS: ExportColumn[] = [
  { key: 'country', header: 'Country', format: 'text' },
  { key: 'region', header: 'Region', format: 'text' },
  { key: 'incidentCount', header: 'Total Incidents', format: 'number' },
  { key: 'verifiedCount', header: 'Verified', format: 'number' },
  { key: 'criticalCount', header: 'Critical', format: 'number' },
  { key: 'riskLevel', header: 'Risk Level', format: 'text' },
];

const HOTSPOT_COLUMNS: ExportColumn[] = [
  { key: 'region', header: 'Region', format: 'text' },
  { key: 'country', header: 'Country', format: 'text' },
  { key: 'incidentCount', header: 'Incident Count (30d)', format: 'number' },
  { key: 'riskScore', header: 'Risk Score', format: 'number' },
  { key: 'riskLevel', header: 'Risk Level', format: 'text' },
  { key: 'primaryCategory', header: 'Primary Category', format: 'text' },
  { key: 'trend', header: 'Trend', format: 'text' },
  { key: 'latitude', header: 'Latitude', format: 'number' },
  { key: 'longitude', header: 'Longitude', format: 'number' },
];

export const PartnerReportExporter = ({ 
  analyticsData, 
  dateRange, 
  countryFilter 
}: PartnerReportExporterProps) => {
  const [reportType, setReportType] = useState('comprehensive');
  const [includeRawData, setIncludeRawData] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const buildExportConfig = (): ExportConfig => {
    const { overview, categoryBreakdown, geographicDistribution, hotspots, recentIncidents } = analyticsData;

    // Select data and columns based on report type
    let data: any[] = [];
    let columns: ExportColumn[] = [];
    let title = 'Partner Analytics Report';
    let subtitle = '';

    switch (reportType) {
      case 'incidents':
        data = recentIncidents;
        columns = INCIDENT_COLUMNS;
        title = 'Incident Details Report';
        subtitle = 'Comprehensive incident records with full details';
        break;
      case 'geographic':
        data = geographicDistribution;
        columns = GEOGRAPHIC_COLUMNS;
        title = 'Geographic Distribution Report';
        subtitle = 'Regional incident analysis and risk assessment';
        break;
      case 'risk':
        data = hotspots;
        columns = HOTSPOT_COLUMNS;
        title = 'Risk Assessment Report';
        subtitle = 'Predictive hotspots and threat analysis';
        break;
      case 'trends':
        data = analyticsData.timeSeriesData;
        columns = [
          { key: 'date', header: 'Date', format: 'date' },
          { key: 'incidents', header: 'Total Incidents', format: 'number' },
          { key: 'verified', header: 'Verified', format: 'number' },
          { key: 'resolved', header: 'Resolved', format: 'number' },
          { key: 'critical', header: 'Critical', format: 'number' },
        ];
        title = 'Trend Analysis Report';
        subtitle = 'Time-series incident patterns and metrics';
        break;
      case 'comprehensive':
      default:
        data = recentIncidents;
        columns = INCIDENT_COLUMNS;
        title = 'Comprehensive Partner Analytics Report';
        subtitle = 'Full incident analysis with executive summary';
        break;
    }

    // Build category stats
    const categories: Record<string, number> = {};
    categoryBreakdown.forEach((cat) => {
      categories[cat.category] = cat.count;
    });

    // Build severity stats
    const severities: Record<string, number> = {
      critical: overview.criticalIncidents,
      high: overview.highPriorityIncidents - overview.criticalIncidents,
      medium: 0,
      low: 0,
    };
    recentIncidents.forEach((i) => {
      if (i.severity_level === 'medium') severities.medium++;
      if (i.severity_level === 'low') severities.low++;
    });

    // Build country stats
    const countries: Record<string, number> = {};
    geographicDistribution.forEach((geo) => {
      countries[geo.country] = (countries[geo.country] || 0) + geo.incidentCount;
    });

    // Build status stats
    const statuses: Record<string, number> = {
      pending: overview.pendingVerification,
      verified: overview.verifiedIncidents,
      resolved: overview.resolvedIncidents,
      escalated: overview.escalatedIncidents,
    };

    return {
      metadata: {
        title,
        subtitle,
        reportType: `partner-${reportType}`,
        generatedBy: 'Peaceverse Partner Portal',
        organization: 'Peaceverse Early Warning System',
        dateRange,
        filters: {
          ...(countryFilter && countryFilter !== 'all' && { country: countryFilter }),
          reportType,
        },
        country: countryFilter !== 'all' ? countryFilter : undefined,
      },
      columns,
      data,
      summary: {
        totalRecords: data.length,
        categories,
        severities,
        statuses,
        countries,
        customMetrics: [
          { label: 'Total Incidents', value: overview.totalIncidents, description: 'All incidents in period' },
          { label: 'Verification Rate', value: `${overview.verificationRate}%`, description: 'Percentage verified' },
          { label: 'Resolution Rate', value: `${overview.resolutionRate}%`, description: 'Percentage resolved' },
          { label: 'Avg Resolution Time', value: overview.averageResolutionDays ? `${overview.averageResolutionDays} days` : 'N/A', description: 'Average days to resolution' },
          { label: 'Active Hotspots', value: hotspots.length, description: 'Predictive high-risk areas' },
          { label: 'Risk Score', value: `${analyticsData.riskAssessment.riskScore}/100`, description: 'Overall risk assessment' },
        ],
      },
      includeRawData,
      includeAnalytics,
    };
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf' | 'word') => {
    setIsExporting(format);
    try {
      const config = buildExportConfig();

      switch (format) {
        case 'json':
          exportProfessionalJSON(config);
          break;
        case 'csv':
          exportProfessionalCSV(config);
          break;
        case 'pdf':
          exportProfessionalPDF(config);
          break;
        case 'word':
          await exportProfessionalWord(config);
          break;
      }

      toast.success(`${format.toUpperCase()} report exported successfully`, {
        description: `${config.data.length} records exported`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setIsExporting(null);
    }
  };

  const selectedReportInfo = REPORT_TYPES.find((r) => r.value === reportType);
  const recordCount = reportType === 'geographic' 
    ? analyticsData.geographicDistribution.length
    : reportType === 'risk'
    ? analyticsData.hotspots.length
    : reportType === 'trends'
    ? analyticsData.timeSeriesData.length
    : analyticsData.recentIncidents.length;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="w-5 h-5 text-primary" />
          Export Reports
        </CardTitle>
        <CardDescription>
          Generate structured reports in multiple formats for analysis and documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Report Info */}
        {selectedReportInfo && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedReportInfo.label}</span>
              <Badge variant="secondary">{recordCount} records</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{selectedReportInfo.description}</p>
          </div>
        )}

        {/* Export Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="w-4 h-4" />
            <span>Export Options</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={includeRawData}
                onCheckedChange={(checked) => setIncludeRawData(checked as boolean)}
              />
              Include raw data
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={includeAnalytics}
                onCheckedChange={(checked) => setIncludeAnalytics(checked as boolean)}
              />
              Include analytics
            </label>
          </div>
        </div>

        <Separator />

        {/* Export Format Buttons */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Download Format</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1"
              onClick={() => handleExport('json')}
              disabled={isExporting !== null}
            >
              <FileJson className={`w-5 h-5 ${isExporting === 'json' ? 'animate-pulse' : 'text-blue-500'}`} />
              <span className="text-xs font-medium">JSON</span>
              <span className="text-[10px] text-muted-foreground">Structured Data</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1"
              onClick={() => handleExport('csv')}
              disabled={isExporting !== null}
            >
              <FileSpreadsheet className={`w-5 h-5 ${isExporting === 'csv' ? 'animate-pulse' : 'text-green-500'}`} />
              <span className="text-xs font-medium">CSV/Excel</span>
              <span className="text-[10px] text-muted-foreground">Spreadsheet</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1"
              onClick={() => handleExport('pdf')}
              disabled={isExporting !== null}
            >
              <FileText className={`w-5 h-5 ${isExporting === 'pdf' ? 'animate-pulse' : 'text-red-500'}`} />
              <span className="text-xs font-medium">PDF</span>
              <span className="text-[10px] text-muted-foreground">Document</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1"
              onClick={() => handleExport('word')}
              disabled={isExporting !== null}
            >
              <File className={`w-5 h-5 ${isExporting === 'word' ? 'animate-pulse' : 'text-blue-600'}`} />
              <span className="text-xs font-medium">Word</span>
              <span className="text-[10px] text-muted-foreground">DOCX Report</span>
            </Button>
          </div>
        </div>

        {/* Export Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded bg-muted/30">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Reports follow ISO/IEC 27001 data handling standards</span>
        </div>
      </CardContent>
    </Card>
  );
};
