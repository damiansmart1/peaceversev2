import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType } from 'docx';
import { HeatmapIncident } from '@/hooks/useIncidentHeatmapData';

export const exportToJSON = (data: HeatmapIncident[], filename: string = 'heatmap-data') => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
};

export const exportToCSV = (data: HeatmapIncident[], filename: string = 'heatmap-data') => {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Type',
    'Severity',
    'Status',
    'Location',
    'Latitude',
    'Longitude',
    'Country',
    'Region',
    'Affected Population',
    'Created At',
    'Updated At',
  ];

  const rows = data.map(incident => [
    incident.id,
    incident.title,
    incident.description,
    incident.incident_type,
    incident.severity,
    incident.status,
    incident.geo_location?.location_name || 'Unknown',
    incident.geo_location?.latitude || '',
    incident.geo_location?.longitude || '',
    incident.country_code || '',
    incident.region || '',
    incident.affected_population || 0,
    new Date(incident.created_at).toLocaleString(),
    new Date(incident.updated_at).toLocaleString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
};

export const exportToPDF = (data: HeatmapIncident[], filename: string = 'heatmap-data') => {
  const doc = new jsPDF('landscape');
  
  // Add title
  doc.setFontSize(18);
  doc.text('Peace Pulse Heatmap Report', 14, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total Incidents: ${data.length}`, 14, 34);
  
  // Severity summary
  const severityCounts = data.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  doc.text(`Critical: ${severityCounts.critical || 0} | High: ${severityCounts.high || 0} | Medium: ${severityCounts.medium || 0} | Low: ${severityCounts.low || 0}`, 14, 40);
  
  // Add table
  const tableData = data.map(incident => [
    incident.title.substring(0, 30) + (incident.title.length > 30 ? '...' : ''),
    incident.incident_type,
    incident.severity,
    incident.status,
    incident.geo_location?.location_name || 'Unknown',
    incident.country_code || 'N/A',
    incident.affected_population?.toString() || '0',
    new Date(incident.created_at).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Title', 'Type', 'Severity', 'Status', 'Location', 'Country', 'Affected Pop.', 'Date']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`${filename}.pdf`);
};

export const exportToWord = async (data: HeatmapIncident[], filename: string = 'heatmap-data') => {
  const severityCounts = data.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Peace Pulse Heatmap Report',
            heading: 'Heading1',
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated: ${new Date().toLocaleString()}`,
                break: 1,
              }),
              new TextRun({
                text: `Total Incidents: ${data.length}`,
                break: 1,
              }),
              new TextRun({
                text: `Critical: ${severityCounts.critical || 0} | High: ${severityCounts.high || 0} | Medium: ${severityCounts.medium || 0} | Low: ${severityCounts.low || 0}`,
                break: 2,
              }),
            ],
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Title')] }),
                  new TableCell({ children: [new Paragraph('Type')] }),
                  new TableCell({ children: [new Paragraph('Severity')] }),
                  new TableCell({ children: [new Paragraph('Status')] }),
                  new TableCell({ children: [new Paragraph('Location')] }),
                  new TableCell({ children: [new Paragraph('Country')] }),
                  new TableCell({ children: [new Paragraph('Affected')] }),
                  new TableCell({ children: [new Paragraph('Date')] }),
                ],
              }),
              ...data.map(
                incident =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(incident.title)] }),
                      new TableCell({ children: [new Paragraph(incident.incident_type)] }),
                      new TableCell({ children: [new Paragraph(incident.severity.toUpperCase())] }),
                      new TableCell({ children: [new Paragraph(incident.status)] }),
                      new TableCell({ children: [new Paragraph(incident.geo_location?.location_name || 'Unknown')] }),
                      new TableCell({ children: [new Paragraph(incident.country_code || 'N/A')] }),
                      new TableCell({ children: [new Paragraph(incident.affected_population?.toString() || '0')] }),
                      new TableCell({ children: [new Paragraph(new Date(incident.created_at).toLocaleDateString())] }),
                    ],
                  })
              ),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
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
