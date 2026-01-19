import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Settings,
  Clock,
  Globe,
  FileJson,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslationContext } from '@/components/TranslationProvider';
import {
  exportProfessionalJSON,
  exportProfessionalCSV,
  exportProfessionalPDF,
  exportProfessionalWord,
} from '@/lib/professionalExportUtils';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  format: string;
  schedule?: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'situation-report',
    name: 'Situation Report (SITREP)',
    description: 'UN OCHA-aligned situation report format with executive summary, key developments, and response overview',
    dataTypes: ['incidents', 'alerts', 'risks'],
    format: 'pdf'
  },
  {
    id: 'early-warning-brief',
    name: 'Early Warning Brief',
    description: 'Concise threat assessment and predictive analysis for stakeholder briefings',
    dataTypes: ['risks', 'hotspots', 'patterns'],
    format: 'pdf'
  },
  {
    id: 'cross-border-analysis',
    name: 'Cross-Border Analysis',
    description: 'Trans-national correlation and network analysis report',
    dataTypes: ['correlations', 'networks', 'clusters'],
    format: 'pdf'
  },
  {
    id: 'accountability-matrix',
    name: 'Accountability Matrix',
    description: 'Response time tracking, resolution metrics, and governance indicators',
    dataTypes: ['accountability', 'governance'],
    format: 'excel'
  },
  {
    id: 'raw-data-export',
    name: 'Raw Data Export',
    description: 'Complete dataset export for external analysis and integration',
    dataTypes: ['all'],
    format: 'json'
  },
  {
    id: 'regional-overview',
    name: 'Regional Overview',
    description: 'Comprehensive regional analysis with comparative metrics',
    dataTypes: ['incidents', 'metrics', 'trends'],
    format: 'word'
  }
];

interface AdvancedReportingPanelProps {
  selectedCountry?: string;
  countryName?: string;
}

const AdvancedReportingPanel = ({ selectedCountry = 'all', countryName = 'All Countries' }: AdvancedReportingPanelProps) => {
  const { t } = useTranslationContext();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('situation-report');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulated report generation - in production would compile real data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);
      
      const mockConfig = {
        title: template?.name || 'Report',
        subtitle: `Generated for ${countryName}`,
        dateRange: { from: dateFrom, to: dateTo },
        columns: [
          { key: 'field', header: 'Field', format: 'text' as const },
          { key: 'value', header: 'Value', format: 'text' as const },
          { key: 'status', header: 'Status', format: 'text' as const },
          { key: 'date', header: 'Date', format: 'date' as const }
        ],
        metadata: {
          title: template?.name || 'Report',
          reportType: selectedTemplate,
          generatedAt: new Date().toISOString(),
          template: selectedTemplate,
          country: selectedCountry,
          includeCharts,
          includeRawData
        },
        summary: {
          totalRecords: Math.floor(Math.random() * 1000) + 100,
          criticalItems: Math.floor(Math.random() * 20),
          highPriority: Math.floor(Math.random() * 50),
          trends: 'Analysis pending'
        },
        sections: [],
        data: []
      };

      switch (exportFormat) {
        case 'json':
          exportProfessionalJSON(mockConfig);
          break;
        case 'csv':
          exportProfessionalCSV(mockConfig);
          break;
        case 'pdf':
          exportProfessionalPDF(mockConfig);
          break;
        case 'word':
          await exportProfessionalWord(mockConfig);
          break;
      }
      
      toast.success(`${template?.name} generated successfully`);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentTemplate = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Advanced Reporting
            </CardTitle>
            <CardDescription>
              Generate professional reports aligned with international standards
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Custom Reports
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="configure" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="grid gap-3">
                {REPORT_TEMPLATES.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 bg-muted/30'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setExportFormat(template.format);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{template.name}</h4>
                          <Badge variant="outline" className="text-xs uppercase">
                            {template.format}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.dataTypes.map(type => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4">
                        {selectedTemplate === template.id && (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="configure" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF Document
                    </div>
                  </SelectItem>
                  <SelectItem value="word">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Word Document
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV/Excel
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4" />
                      JSON Data
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Report Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                />
                <label htmlFor="charts" className="text-sm cursor-pointer">
                  Include charts and visualizations
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawdata"
                  checked={includeRawData}
                  onCheckedChange={(checked) => setIncludeRawData(!!checked)}
                />
                <label htmlFor="rawdata" className="text-sm cursor-pointer">
                  Include raw data appendix
                </label>
              </div>
            </div>

            {currentTemplate && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-semibold text-sm mb-2">Selected Template</h4>
                <p className="text-sm text-muted-foreground">{currentTemplate.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentTemplate.description}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Scheduled Reports</p>
              <p className="text-sm mt-1">
                Configure automated report generation and delivery
              </p>
              <p className="text-xs mt-4 text-primary">Coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <Globe className="w-4 h-4 inline mr-1" />
            Region: {countryName}
          </div>
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedReportingPanel;
