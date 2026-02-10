import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ElectionPdfOptions {
  electionName: string;
  countryName: string;
  votingDate: string;
  generatedBy?: string;
}

const BRAND_COLOR: [number, number, number] = [30, 64, 175]; // blue-800
const ACCENT_COLOR: [number, number, number] = [239, 68, 68]; // red-500
const MUTED_COLOR: [number, number, number] = [100, 116, 139]; // slate-500

function addHeader(doc: jsPDF, options: ElectionPdfOptions, title: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top bar
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PEACEVERSE — Election Monitoring Report', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 20);
  doc.text(`CONFIDENTIAL`, pageWidth - 14, 20, { align: 'right' });

  // Election info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(options.electionName, 14, 40);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED_COLOR);
  doc.text(`${options.countryName} • Voting Date: ${format(new Date(options.votingDate), 'MMMM dd, yyyy')}`, 14, 48);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text(title, 14, 60);

  return 65;
}

function addFooter(doc: jsPDF, pageNum: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

  doc.setFontSize(7);
  doc.setTextColor(...MUTED_COLOR);
  doc.text('Peaceverse Election Monitoring Platform — International Standards Compliant', 14, pageHeight - 8);
  doc.text(`Page ${pageNum}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
}

function addSummaryBox(doc: jsPDF, y: number, stats: { label: string; value: string | number }[]) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = (pageWidth - 28 - (stats.length - 1) * 4) / stats.length;

  stats.forEach((stat, i) => {
    const x = 14 + i * (boxWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, boxWidth, 22, 2, 2, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(String(stat.value), x + boxWidth / 2, y + 10, { align: 'center' });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED_COLOR);
    doc.text(stat.label, x + boxWidth / 2, y + 18, { align: 'center' });
  });

  return y + 28;
}

export function generateIncidentsPdf(incidents: any[], options: ElectionPdfOptions) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  let y = addHeader(doc, options, 'INCIDENT REPORT');

  // Summary
  const critical = incidents.filter(i => i.severity === 'critical' || i.severity === 'emergency').length;
  const verified = incidents.filter(i => i.verification_status === 'verified').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;

  y = addSummaryBox(doc, y, [
    { label: 'Total Incidents', value: incidents.length },
    { label: 'Critical/Emergency', value: critical },
    { label: 'Verified', value: verified },
    { label: 'Resolved', value: resolved },
    { label: 'Pending', value: incidents.length - resolved },
  ]);

  // Table
  autoTable(doc, {
    startY: y + 4,
    head: [['#', 'Code', 'Title', 'Category', 'Severity', 'Region', 'Status', 'Verification', 'Date']],
    body: incidents.map((inc, i) => [
      i + 1,
      inc.incident_code || '-',
      (inc.title || '').substring(0, 35),
      inc.category || '-',
      (inc.severity || '').toUpperCase(),
      inc.region || '-',
      inc.status || '-',
      inc.verification_status || '-',
      inc.incident_datetime ? format(new Date(inc.incident_datetime), 'yyyy-MM-dd HH:mm') : '-',
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: BRAND_COLOR, fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: (data) => {
      addFooter(doc, doc.getCurrentPageInfo().pageNumber);
    },
  });

  addFooter(doc, 1);
  return doc;
}

export function generateResultsPdf(results: any[], options: ElectionPdfOptions) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  let y = addHeader(doc, options, 'RESULTS COLLATION REPORT');

  const totalVotes = results.reduce((s, r) => s + (r.total_votes_cast || 0), 0);
  const totalRegistered = results.reduce((s, r) => s + (r.total_registered || 0), 0);
  const turnout = totalRegistered > 0 ? ((totalVotes / totalRegistered) * 100).toFixed(1) + '%' : '0%';
  const verified = results.filter(r => r.fully_verified).length;

  y = addSummaryBox(doc, y, [
    { label: 'Stations Reported', value: results.length },
    { label: 'Total Votes Cast', value: totalVotes.toLocaleString() },
    { label: 'Turnout', value: turnout },
    { label: 'Verified Results', value: verified },
    { label: 'Contested', value: results.filter(r => r.contested).length },
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [['Station', 'Registered', 'Votes Cast', 'Valid', 'Rejected', 'Turnout %', 'Verified', 'Status', 'Signatures']],
    body: results.map(r => [
      r.polling_stations?.station_name || r.polling_station_id?.substring(0, 8) || '-',
      r.total_registered,
      r.total_votes_cast,
      r.valid_votes,
      r.rejected_votes,
      r.turnout_percentage ? `${Number(r.turnout_percentage).toFixed(1)}%` : '-',
      r.fully_verified ? 'YES' : 'NO',
      r.status || '-',
      r.signature_count || 0,
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: BRAND_COLOR, fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: () => addFooter(doc, doc.getCurrentPageInfo().pageNumber),
  });

  return doc;
}

export function generateObserversPdf(observers: any[], options: ElectionPdfOptions) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  let y = addHeader(doc, options, 'OBSERVER DEPLOYMENT REPORT');

  const approved = observers.filter(o => o.accreditation_status === 'approved').length;
  const deployed = observers.filter(o => o.deployment_status === 'deployed').length;

  y = addSummaryBox(doc, y, [
    { label: 'Total Observers', value: observers.length },
    { label: 'Accredited', value: approved },
    { label: 'Deployed', value: deployed },
    { label: 'ID Verified', value: observers.filter(o => o.id_verified).length },
    { label: 'Training Done', value: observers.filter(o => o.training_completed).length },
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [['Name', 'Organization', 'Role', 'Accreditation #', 'Status', 'Deployment', 'ID Verified', 'Trained', 'Oath']],
    body: observers.map(o => [
      o.full_name,
      o.organization || '-',
      (o.observer_role || '').replace('_', ' '),
      o.accreditation_number || '-',
      o.accreditation_status || 'pending',
      o.deployment_status || 'undeployed',
      o.id_verified ? '✓' : '✗',
      o.training_completed ? '✓' : '✗',
      o.oath_signed ? '✓' : '✗',
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: BRAND_COLOR, fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: () => addFooter(doc, doc.getCurrentPageInfo().pageNumber),
  });

  return doc;
}

export function generateStationsPdf(stations: any[], options: ElectionPdfOptions) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  let y = addHeader(doc, options, 'POLLING STATIONS REPORT');

  const active = stations.filter(s => s.is_active).length;
  const verified = stations.filter(s => s.setup_verified).length;
  const totalVoters = stations.reduce((s, st) => s + (st.registered_voters || 0), 0);

  y = addSummaryBox(doc, y, [
    { label: 'Total Stations', value: stations.length },
    { label: 'Active', value: active },
    { label: 'Setup Verified', value: verified },
    { label: 'Accessible', value: stations.filter(s => s.is_accessible).length },
    { label: 'Registered Voters', value: totalVoters.toLocaleString() },
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [['Code', 'Name', 'Region', 'District', 'Constituency', 'Voters', 'Active', 'Verified', 'Accessible']],
    body: stations.map(s => [
      s.station_code,
      s.station_name,
      s.region || '-',
      s.district || '-',
      s.constituency || '-',
      s.registered_voters || 0,
      s.is_active ? '✓' : '✗',
      s.setup_verified ? '✓' : '✗',
      s.is_accessible ? '✓' : '✗',
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: BRAND_COLOR, fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: () => addFooter(doc, doc.getCurrentPageInfo().pageNumber),
  });

  return doc;
}

export function generateAuditPdf(auditLogs: any[], options: ElectionPdfOptions) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  let y = addHeader(doc, options, 'AUDIT TRAIL REPORT');

  y = addSummaryBox(doc, y, [
    { label: 'Total Actions', value: auditLogs.length },
    { label: 'Unique Entities', value: new Set(auditLogs.map(l => l.entity_type)).size },
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [['Timestamp', 'Action', 'Entity', 'Details', 'Hash']],
    body: auditLogs.map(l => [
      l.performed_at ? format(new Date(l.performed_at), 'yyyy-MM-dd HH:mm:ss') : '-',
      l.action_type || '-',
      l.entity_type || '-',
      JSON.stringify(l.action_details || {}).substring(0, 60),
      (l.log_hash || '-').substring(0, 16) + '...',
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: BRAND_COLOR, fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: () => addFooter(doc, doc.getCurrentPageInfo().pageNumber),
  });

  return doc;
}

export function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}
