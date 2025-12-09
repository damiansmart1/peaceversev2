import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  TextRun, 
  AlignmentType, 
  WidthType, 
  HeadingLevel,
  BorderStyle,
  ShadingType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} from 'docx';
import { format } from 'date-fns';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ReportMetadata {
  title: string;
  subtitle?: string;
  reportType: string;
  generatedBy?: string;
  organization?: string;
  dateRange?: { from?: string; to?: string };
  filters?: Record<string, string>;
  country?: string;
  region?: string;
}

export interface DataSummary {
  totalRecords: number;
  categories?: Record<string, number>;
  severities?: Record<string, number>;
  statuses?: Record<string, number>;
  countries?: Record<string, number>;
  timeDistribution?: Record<string, number>;
  customMetrics?: Array<{ label: string; value: string | number; description?: string }>;
}

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: 'text' | 'number' | 'date' | 'datetime' | 'percentage' | 'currency' | 'json';
}

export interface ExportConfig {
  metadata: ReportMetadata;
  columns: ExportColumn[];
  data: any[];
  summary?: DataSummary;
  includeRawData?: boolean;
  includeAnalytics?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatValue = (value: any, format?: string): string => {
  if (value === null || value === undefined) return '-';
  
  switch (format) {
    case 'date':
      return value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
    case 'datetime':
      return value ? new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    case 'percentage':
      return typeof value === 'number' ? `${value.toFixed(1)}%` : String(value);
    case 'currency':
      return typeof value === 'number' ? `$${value.toLocaleString()}` : String(value);
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'json':
      return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    default:
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
};

const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '-';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

const getTimestamp = () => format(new Date(), 'yyyy-MM-dd_HHmmss');

// ============================================================================
// JSON EXPORT - Structured Scientific Format
// ============================================================================

export const exportProfessionalJSON = (config: ExportConfig): void => {
  const { metadata, columns, data, summary } = config;
  
  const structuredReport = {
    _metadata: {
      reportTitle: metadata.title,
      reportSubtitle: metadata.subtitle,
      reportType: metadata.reportType,
      generatedAt: new Date().toISOString(),
      generatedBy: metadata.generatedBy || 'Peaceverse Early Warning System',
      organization: metadata.organization || 'Peaceverse',
      version: '1.0',
      dataFormat: 'Peaceverse Scientific Report Format v1',
      license: 'Restricted - Authorized Use Only',
    },
    _parameters: {
      dateRange: metadata.dateRange,
      filters: metadata.filters,
      country: metadata.country,
      region: metadata.region,
    },
    _summary: {
      totalRecords: summary?.totalRecords || data.length,
      categoryCounts: summary?.categories || {},
      severityCounts: summary?.severities || {},
      statusCounts: summary?.statuses || {},
      countryCounts: summary?.countries || {},
      timeDistribution: summary?.timeDistribution || {},
      customMetrics: summary?.customMetrics || [],
    },
    _schema: {
      columns: columns.map(col => ({
        field: col.key,
        label: col.header,
        dataType: col.format || 'text',
      })),
    },
    _analytics: config.includeAnalytics ? generateAnalytics(data, columns) : null,
    data: data.map((row, index) => ({
      _index: index + 1,
      ...columns.reduce((acc, col) => {
        acc[col.key] = {
          value: row[col.key],
          formatted: formatValue(row[col.key], col.format),
        };
        return acc;
      }, {} as Record<string, any>),
      _raw: config.includeRawData ? row : undefined,
    })),
  };

  const jsonStr = JSON.stringify(structuredReport, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, `peaceverse-${metadata.reportType}-${getTimestamp()}.json`);
};

// ============================================================================
// CSV EXPORT - Analysis-Ready Format
// ============================================================================

export const exportProfessionalCSV = (config: ExportConfig): void => {
  const { metadata, columns, data, summary } = config;
  
  const lines: string[] = [];
  
  // Metadata header section
  lines.push('# PEACEVERSE EARLY WARNING SYSTEM - DATA EXPORT');
  lines.push(`# Report: ${metadata.title}`);
  lines.push(`# Type: ${metadata.reportType}`);
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Total Records: ${data.length}`);
  if (metadata.country) lines.push(`# Country: ${metadata.country}`);
  if (metadata.dateRange?.from) lines.push(`# Date From: ${metadata.dateRange.from}`);
  if (metadata.dateRange?.to) lines.push(`# Date To: ${metadata.dateRange.to}`);
  lines.push('#');
  
  // Summary statistics section
  if (summary) {
    lines.push('# === SUMMARY STATISTICS ===');
    if (summary.severities) {
      lines.push(`# Severity Distribution: ${Object.entries(summary.severities).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }
    if (summary.categories) {
      lines.push(`# Category Distribution: ${Object.entries(summary.categories).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }
    if (summary.statuses) {
      lines.push(`# Status Distribution: ${Object.entries(summary.statuses).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }
    lines.push('#');
  }
  
  // Column headers
  const headers = ['Record_Number', ...columns.map(col => col.header.replace(/\s+/g, '_'))];
  lines.push(headers.join(','));
  
  // Data rows
  data.forEach((row, index) => {
    const values = [
      index + 1,
      ...columns.map(col => {
        const value = formatValue(row[col.key], col.format);
        // Escape CSV special characters
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') 
          ? `"${escaped}"` 
          : escaped;
      })
    ];
    lines.push(values.join(','));
  });
  
  const csvContent = lines.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  downloadBlob(blob, `peaceverse-${metadata.reportType}-${getTimestamp()}.csv`);
};

// ============================================================================
// PDF EXPORT - Professional Scientific Report
// ============================================================================

export const exportProfessionalPDF = (config: ExportConfig): void => {
  const { metadata, columns, data, summary } = config;
  
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;
  
  // Helper for new page
  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      addHeader();
    }
  };
  
  // Header
  const addHeader = () => {
    doc.setFillColor(7, 79, 152);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('PEACEVERSE EARLY WARNING SYSTEM', 14, 10);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 30, 10);
    yPos = 25;
  };
  
  // Footer
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated: ${new Date().toLocaleString()} | Confidential - Authorized Use Only`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  };
  
  addHeader();
  
  // Title Section
  doc.setFontSize(22);
  doc.setTextColor(7, 79, 152);
  doc.text(metadata.title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  if (metadata.subtitle) {
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(metadata.subtitle, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }
  
  // Report Info Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, yPos, pageWidth - 28, 25, 3, 3, 'F');
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const infoLeft = [
    `Report Type: ${metadata.reportType}`,
    `Generated: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`,
    metadata.country ? `Country/Region: ${metadata.country}` : null,
  ].filter(Boolean);
  
  const infoRight = [
    `Total Records: ${data.length.toLocaleString()}`,
    metadata.dateRange?.from ? `Date Range: ${metadata.dateRange.from} to ${metadata.dateRange.to || 'Present'}` : null,
    `Format Version: 1.0`,
  ].filter(Boolean);
  
  infoLeft.forEach((line, i) => {
    if (line) doc.text(line, 20, yPos + (i * 5));
  });
  
  infoRight.forEach((line, i) => {
    if (line) doc.text(line!, pageWidth / 2 + 10, yPos + (i * 5));
  });
  
  yPos += 25;
  
  // Executive Summary Section
  if (summary) {
    addNewPageIfNeeded(50);
    
    doc.setFontSize(14);
    doc.setTextColor(7, 79, 152);
    doc.text('EXECUTIVE SUMMARY', 14, yPos);
    yPos += 8;
    
    // Summary metrics cards
    const metricsData: Array<{ label: string; value: string; color: [number, number, number] }> = [];
    
    if (summary.severities) {
      metricsData.push(
        { label: 'Critical', value: String(summary.severities.critical || 0), color: [220, 38, 38] },
        { label: 'High', value: String(summary.severities.high || 0), color: [234, 88, 12] },
        { label: 'Medium', value: String(summary.severities.medium || 0), color: [202, 138, 4] },
        { label: 'Low', value: String(summary.severities.low || 0), color: [22, 163, 74] }
      );
    }
    
    const cardWidth = (pageWidth - 28 - (metricsData.length - 1) * 5) / metricsData.length;
    metricsData.forEach((metric, i) => {
      const x = 14 + i * (cardWidth + 5);
      doc.setFillColor(...metric.color);
      doc.roundedRect(x, yPos, cardWidth, 18, 2, 2, 'F');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(metric.value, x + cardWidth / 2, yPos + 8, { align: 'center' });
      doc.setFontSize(9);
      doc.text(metric.label, x + cardWidth / 2, yPos + 14, { align: 'center' });
    });
    yPos += 25;
    
    // Distribution breakdown
    if (summary.categories && Object.keys(summary.categories).length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Category Distribution:', 14, yPos);
      yPos += 5;
      
      const catEntries = Object.entries(summary.categories).sort((a, b) => b[1] - a[1]);
      const totalCat = catEntries.reduce((sum, [, count]) => sum + count, 0);
      
      catEntries.slice(0, 6).forEach(([cat, count]) => {
        const percentage = ((count / totalCat) * 100).toFixed(1);
        const barWidth = (count / totalCat) * 150;
        
        doc.setFillColor(7, 79, 152);
        doc.rect(14, yPos, barWidth, 4, 'F');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text(`${cat}: ${count} (${percentage}%)`, 170, yPos + 3);
        yPos += 6;
      });
      yPos += 5;
    }
  }
  
  // Data Table Section
  addNewPageIfNeeded(40);
  
  doc.setFontSize(14);
  doc.setTextColor(7, 79, 152);
  doc.text('DETAILED DATA', 14, yPos);
  yPos += 8;
  
  const tableData = data.map((row, index) => [
    index + 1,
    ...columns.map(col => truncateText(formatValue(row[col.key], col.format), 50))
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['#', ...columns.map(col => col.header)]],
    body: tableData,
    styles: { 
      fontSize: 7, 
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: { 
      fillColor: [7, 79, 152], 
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
    },
    didDrawPage: () => {
      addHeader();
    },
  });
  
  addFooter();
  doc.save(`peaceverse-${metadata.reportType}-${getTimestamp()}.pdf`);
};

// ============================================================================
// WORD EXPORT - Professional Document Format
// ============================================================================

export const exportProfessionalWord = async (config: ExportConfig): Promise<void> => {
  const { metadata, columns, data, summary } = config;
  
  const createSummaryTable = () => {
    if (!summary?.severities) return null;
    
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['Severity Level', 'Count', 'Percentage'].map(text =>
            new TableCell({
              children: [new Paragraph({ 
                text, 
                alignment: AlignmentType.CENTER,
              })],
              shading: { fill: '074F98', type: ShadingType.SOLID, color: '074F98' },
            })
          ),
        }),
        ...Object.entries(summary.severities).map(([level, count]) => {
          const total = Object.values(summary.severities!).reduce((a, b) => a + b, 0);
          const percentage = ((count / total) * 100).toFixed(1);
          return new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: level.toUpperCase(), alignment: AlignmentType.LEFT })] }),
              new TableCell({ children: [new Paragraph({ text: String(count), alignment: AlignmentType.CENTER })] }),
              new TableCell({ children: [new Paragraph({ text: `${percentage}%`, alignment: AlignmentType.CENTER })] }),
            ],
          });
        }),
      ],
    });
  };
  
  const createDataTable = () => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Header row
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: '#', alignment: AlignmentType.CENTER })],
              shading: { fill: '074F98', type: ShadingType.SOLID, color: '074F98' },
            }),
            ...columns.map(col =>
              new TableCell({
                children: [new Paragraph({ 
                  text: col.header, 
                  alignment: AlignmentType.CENTER,
                })],
                shading: { fill: '074F98', type: ShadingType.SOLID, color: '074F98' },
              })
            ),
          ],
        }),
        // Data rows
        ...data.slice(0, 200).map((row, index) =>
          new TableRow({
            children: [
              new TableCell({ 
                children: [new Paragraph({ text: String(index + 1), alignment: AlignmentType.CENTER })] 
              }),
              ...columns.map(col =>
                new TableCell({
                  children: [new Paragraph({ 
                    text: truncateText(formatValue(row[col.key], col.format), 60),
                  })],
                })
              ),
            ],
          })
        ),
      ],
    });
  };
  
  const sections = [
    // Cover Page
    {
      children: [
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'PEACEVERSE',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: 'EARLY WARNING SYSTEM',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: metadata.title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        metadata.subtitle ? new Paragraph({
          text: metadata.subtitle,
          alignment: AlignmentType.CENTER,
        }) : new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Report Type: ', bold: true }),
            new TextRun({ text: metadata.reportType }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Generated: ', bold: true }),
            new TextRun({ text: format(new Date(), 'MMMM d, yyyy HH:mm:ss') }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Total Records: ', bold: true }),
            new TextRun({ text: data.length.toLocaleString() }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        metadata.country ? new Paragraph({
          children: [
            new TextRun({ text: 'Country/Region: ', bold: true }),
            new TextRun({ text: metadata.country }),
          ],
          alignment: AlignmentType.CENTER,
        }) : new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'CONFIDENTIAL - AUTHORIZED USE ONLY',
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new PageBreak()],
        }),
      ],
    },
    // Executive Summary
    {
      children: [
        new Paragraph({
          text: 'EXECUTIVE SUMMARY',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: `This report contains ${data.length.toLocaleString()} records from the Peaceverse Early Warning System. The data has been compiled and analyzed to provide actionable insights for stakeholders.`,
        }),
        new Paragraph({ text: '' }),
        ...(summary?.severities ? [
          new Paragraph({
            text: 'Severity Distribution',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: '' }),
          createSummaryTable()!,
          new Paragraph({ text: '' }),
        ] : []),
        ...(summary?.categories && Object.keys(summary.categories).length > 0 ? [
          new Paragraph({
            text: 'Category Breakdown',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: '' }),
          ...Object.entries(summary.categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([cat, count]) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${cat}: `, bold: true }),
                  new TextRun({ text: `${count} records` }),
                ],
              })
            ),
          new Paragraph({ text: '' }),
        ] : []),
        ...(summary?.customMetrics && summary.customMetrics.length > 0 ? [
          new Paragraph({
            text: 'Key Metrics',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: '' }),
          ...summary.customMetrics.map(metric =>
            new Paragraph({
              children: [
                new TextRun({ text: `${metric.label}: `, bold: true }),
                new TextRun({ text: String(metric.value) }),
                metric.description ? new TextRun({ text: ` (${metric.description})`, italics: true }) : new TextRun({ text: '' }),
              ],
            })
          ),
          new Paragraph({ text: '' }),
        ] : []),
        new Paragraph({
          children: [new PageBreak()],
        }),
      ].filter(Boolean) as any[],
    },
    // Data Section
    {
      children: [
        new Paragraph({
          text: 'DETAILED DATA',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: `The following table contains the ${Math.min(data.length, 200)} most recent records. For complete data, please refer to the JSON or CSV export.`,
        }),
        new Paragraph({ text: '' }),
        createDataTable(),
        new Paragraph({ text: '' }),
        data.length > 200 ? new Paragraph({
          text: `Note: Displaying first 200 of ${data.length} records. Full dataset available in CSV/JSON format.`,
          alignment: AlignmentType.CENTER,
        }) : new Paragraph({ text: '' }),
      ],
    },
  ];
  
  const doc = new Document({
    sections: sections,
  });
  
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `peaceverse-${metadata.reportType}-${getTimestamp()}.docx`);
};

// ============================================================================
// ANALYTICS GENERATION
// ============================================================================

const generateAnalytics = (data: any[], columns: ExportColumn[]): Record<string, any> => {
  const analytics: Record<string, any> = {
    recordCount: data.length,
    dateRange: {
      earliest: null as string | null,
      latest: null as string | null,
    },
    fieldAnalysis: {} as Record<string, any>,
  };
  
  // Find date columns and calculate range
  const dateColumns = columns.filter(col => col.format === 'date' || col.format === 'datetime');
  dateColumns.forEach(col => {
    const dates = data
      .map(row => row[col.key])
      .filter(Boolean)
      .map(d => new Date(d).getTime())
      .sort((a, b) => a - b);
    
    if (dates.length > 0) {
      analytics.dateRange.earliest = new Date(dates[0]).toISOString();
      analytics.dateRange.latest = new Date(dates[dates.length - 1]).toISOString();
    }
  });
  
  // Analyze each column
  columns.forEach(col => {
    const values = data.map(row => row[col.key]).filter(v => v !== null && v !== undefined);
    const uniqueValues = [...new Set(values.map(v => String(v)))];
    
    analytics.fieldAnalysis[col.key] = {
      totalValues: values.length,
      uniqueValues: uniqueValues.length,
      nullCount: data.length - values.length,
      nullPercentage: (((data.length - values.length) / data.length) * 100).toFixed(1),
    };
    
    // For categorical data, add distribution
    if (uniqueValues.length <= 20) {
      analytics.fieldAnalysis[col.key].distribution = values.reduce((acc: Record<string, number>, val) => {
        const key = String(val);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
    }
    
    // For numeric data, add statistics
    if (col.format === 'number' || col.format === 'percentage' || col.format === 'currency') {
      const numValues = values.filter(v => typeof v === 'number') as number[];
      if (numValues.length > 0) {
        analytics.fieldAnalysis[col.key].statistics = {
          min: Math.min(...numValues),
          max: Math.max(...numValues),
          avg: (numValues.reduce((a, b) => a + b, 0) / numValues.length).toFixed(2),
          sum: numValues.reduce((a, b) => a + b, 0),
        };
      }
    }
  });
  
  return analytics;
};

// ============================================================================
// CONVENIENCE EXPORT FUNCTIONS
// ============================================================================

export const createIncidentExportConfig = (
  data: any[],
  filters?: Record<string, string>,
  country?: string
): ExportConfig => {
  const severities = data.reduce((acc, item) => {
    const sev = item.severity_level || item.severity || 'unknown';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categories = data.reduce((acc, item) => {
    const cat = item.category || 'uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const statuses = data.reduce((acc, item) => {
    const status = item.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const countries = data.reduce((acc, item) => {
    const c = item.location_country || 'Unknown';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    metadata: {
      title: 'Incident Report',
      subtitle: 'Comprehensive Analysis of Reported Incidents',
      reportType: 'incidents',
      organization: 'Peaceverse Early Warning System',
      filters,
      country,
    },
    columns: [
      { key: 'title', header: 'Title', format: 'text' },
      { key: 'category', header: 'Category', format: 'text' },
      { key: 'sub_category', header: 'Sub-Category', format: 'text' },
      { key: 'severity_level', header: 'Severity', format: 'text' },
      { key: 'status', header: 'Status', format: 'text' },
      { key: 'location_city', header: 'City', format: 'text' },
      { key: 'location_region', header: 'Region', format: 'text' },
      { key: 'location_country', header: 'Country', format: 'text' },
      { key: 'estimated_people_affected', header: 'People Affected', format: 'number' },
      { key: 'casualties_reported', header: 'Casualties', format: 'number' },
      { key: 'injuries_reported', header: 'Injuries', format: 'number' },
      { key: 'verification_status', header: 'Verification', format: 'text' },
      { key: 'ai_threat_level', header: 'AI Threat Level', format: 'text' },
      { key: 'created_at', header: 'Reported Date', format: 'datetime' },
    ],
    data,
    summary: {
      totalRecords: data.length,
      severities,
      categories,
      statuses,
      countries,
      customMetrics: [
        { label: 'Total People Affected', value: data.reduce((sum, i) => sum + (i.estimated_people_affected || 0), 0) },
        { label: 'Total Casualties', value: data.reduce((sum, i) => sum + (i.casualties_reported || 0), 0) },
        { label: 'Verified Incidents', value: data.filter(i => i.verification_status === 'verified').length },
        { label: 'Pending Verification', value: data.filter(i => i.verification_status === 'pending' || !i.verification_status).length },
      ],
    },
    includeRawData: true,
    includeAnalytics: true,
  };
};

export const createAlertExportConfig = (data: any[], country?: string): ExportConfig => {
  const severities = data.reduce((acc, item) => {
    acc[item.severity || 'unknown'] = (acc[item.severity || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const types = data.reduce((acc, item) => {
    acc[item.alert_type || 'unknown'] = (acc[item.alert_type || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    metadata: {
      title: 'Alert Report',
      subtitle: 'System Alert Analysis',
      reportType: 'alerts',
      country,
    },
    columns: [
      { key: 'title', header: 'Alert Title', format: 'text' },
      { key: 'alert_type', header: 'Type', format: 'text' },
      { key: 'severity', header: 'Severity', format: 'text' },
      { key: 'status', header: 'Status', format: 'text' },
      { key: 'message', header: 'Message', format: 'text' },
      { key: 'triggered_at', header: 'Triggered At', format: 'datetime' },
      { key: 'acknowledged_at', header: 'Acknowledged At', format: 'datetime' },
    ],
    data,
    summary: {
      totalRecords: data.length,
      severities,
      categories: types,
      customMetrics: [
        { label: 'Acknowledged Alerts', value: data.filter(a => a.acknowledged_at).length },
        { label: 'Pending Alerts', value: data.filter(a => a.status === 'pending' || !a.acknowledged_at).length },
      ],
    },
    includeAnalytics: true,
  };
};

export const createHotspotExportConfig = (data: any[], country?: string): ExportConfig => {
  const riskLevels = data.reduce((acc, item) => {
    acc[item.risk_level || 'unknown'] = (acc[item.risk_level || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    metadata: {
      title: 'Predictive Hotspot Report',
      subtitle: 'AI-Generated Risk Hotspot Analysis',
      reportType: 'hotspots',
      country,
    },
    columns: [
      { key: 'region_name', header: 'Region', format: 'text' },
      { key: 'country', header: 'Country', format: 'text' },
      { key: 'risk_level', header: 'Risk Level', format: 'text' },
      { key: 'hotspot_score', header: 'Hotspot Score', format: 'number' },
      { key: 'confidence_level', header: 'Confidence', format: 'percentage' },
      { key: 'incident_count_30d', header: 'Incidents (30d)', format: 'number' },
      { key: 'prediction_window', header: 'Prediction Window', format: 'text' },
      { key: 'monitoring_priority', header: 'Priority', format: 'text' },
      { key: 'predicted_at', header: 'Predicted At', format: 'datetime' },
      { key: 'valid_until', header: 'Valid Until', format: 'date' },
    ],
    data,
    summary: {
      totalRecords: data.length,
      severities: riskLevels,
      customMetrics: [
        { label: 'Active Hotspots', value: data.filter(h => h.status === 'active').length },
        { label: 'Average Confidence', value: `${(data.reduce((sum, h) => sum + (h.confidence_level || 0), 0) / data.length).toFixed(1)}%` },
        { label: 'High Priority Areas', value: data.filter(h => h.monitoring_priority === 'high').length },
      ],
    },
    includeAnalytics: true,
  };
};

export const createRiskScoreExportConfig = (data: any[], country?: string): ExportConfig => {
  const threatLevels = data.reduce((acc, item) => {
    acc[item.threat_level || 'unknown'] = (acc[item.threat_level || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    metadata: {
      title: 'Risk Score Analysis Report',
      subtitle: 'AI-Generated Risk Assessment',
      reportType: 'risk-scores',
      country,
    },
    columns: [
      { key: 'citizen_reports.title', header: 'Incident', format: 'text' },
      { key: 'threat_level', header: 'Threat Level', format: 'text' },
      { key: 'overall_risk_score', header: 'Risk Score', format: 'percentage' },
      { key: 'severity_score', header: 'Severity', format: 'percentage' },
      { key: 'urgency_score', header: 'Urgency', format: 'percentage' },
      { key: 'impact_score', header: 'Impact', format: 'percentage' },
      { key: 'escalation_probability', header: 'Escalation Prob.', format: 'percentage' },
      { key: 'contagion_risk', header: 'Contagion Risk', format: 'percentage' },
      { key: 'escalation_timeline', header: 'Timeline', format: 'text' },
      { key: 'created_at', header: 'Assessed At', format: 'datetime' },
    ],
    data: data.map(item => ({
      ...item,
      'citizen_reports.title': item.citizen_reports?.title || '-',
    })),
    summary: {
      totalRecords: data.length,
      severities: threatLevels,
      customMetrics: [
        { label: 'Average Risk Score', value: `${(data.reduce((sum, r) => sum + (r.overall_risk_score || 0), 0) / data.length).toFixed(1)}%` },
        { label: 'Critical Threats', value: data.filter(r => r.threat_level === 'critical').length },
        { label: 'High Escalation Risk', value: data.filter(r => (r.escalation_probability || 0) > 70).length },
      ],
    },
    includeAnalytics: true,
  };
};
