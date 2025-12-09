import { Button } from '@/components/ui/button';
import { Download, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
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
  ShadingType,
  PageBreak
} from 'docx';

interface ProposalReportDownloadProps {
  proposal: any;
  voteStats?: {
    supportCount: number;
    opposeCount: number;
  };
  comments?: any[];
  polls?: any[];
}

const ProposalReportDownload = ({ proposal, voteStats, comments = [], polls = [] }: ProposalReportDownloadProps) => {
  const getTimestamp = () => format(new Date(), 'yyyy-MM-dd_HHmmss');
  
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getProposalMetrics = () => {
    const totalVotes = (voteStats?.supportCount || 0) + (voteStats?.opposeCount || 0);
    const supportPercentage = totalVotes > 0 ? ((voteStats?.supportCount || 0) / totalVotes * 100).toFixed(1) : '0';
    const opposePercentage = totalVotes > 0 ? ((voteStats?.opposeCount || 0) / totalVotes * 100).toFixed(1) : '0';
    
    return {
      totalVotes,
      supportCount: voteStats?.supportCount || 0,
      opposeCount: voteStats?.opposeCount || 0,
      supportPercentage,
      opposePercentage,
      viewCount: proposal.view_count || 0,
      commentCount: proposal.comment_count || comments.length || 0,
      shareCount: proposal.share_count || 0,
      contributors: proposal.unique_contributors || 0,
    };
  };

  const downloadJSONReport = () => {
    const metrics = getProposalMetrics();
    
    const report = {
      _metadata: {
        reportTitle: 'Proposal Analysis Report',
        reportType: 'proposal-analysis',
        generatedAt: new Date().toISOString(),
        generatedBy: 'Peaceverse Democratic Participation Platform',
        version: '1.0',
        dataFormat: 'Peaceverse Scientific Report Format v1',
      },
      proposal: {
        id: proposal.id,
        slug: proposal.slug,
        title: proposal.title,
        status: proposal.status,
        stage: proposal.stage,
        category: proposal.category,
        createdAt: proposal.created_at,
        updatedAt: proposal.updated_at,
        summary: proposal.summary,
        fullBody: proposal.body,
        tags: proposal.tags || [],
      },
      votingAnalysis: {
        totalVotes: metrics.totalVotes,
        supportVotes: {
          count: metrics.supportCount,
          percentage: parseFloat(metrics.supportPercentage),
        },
        opposeVotes: {
          count: metrics.opposeCount,
          percentage: parseFloat(metrics.opposePercentage),
        },
        approvalThreshold: 50,
        meetsApprovalThreshold: parseFloat(metrics.supportPercentage) >= 50,
      },
      engagementMetrics: {
        views: metrics.viewCount,
        comments: metrics.commentCount,
        shares: metrics.shareCount,
        uniqueContributors: metrics.contributors,
        engagementRate: metrics.viewCount > 0 
          ? ((metrics.totalVotes + metrics.commentCount) / metrics.viewCount * 100).toFixed(2)
          : '0',
      },
      comments: comments.slice(0, 50).map((c: any) => ({
        id: c.id,
        body: c.body,
        createdAt: c.created_at,
        likeCount: c.like_count,
        isPinned: c.is_pinned,
      })),
      polls: polls.map((p: any) => ({
        id: p.id,
        question: p.question,
        pollType: p.poll_type,
        totalVotes: p.total_votes,
        options: p.options,
      })),
      _analytics: {
        voteDistribution: {
          support: metrics.supportCount,
          oppose: metrics.opposeCount,
        },
        participationRate: metrics.viewCount > 0 
          ? (metrics.totalVotes / metrics.viewCount * 100).toFixed(2)
          : '0',
        commentEngagement: metrics.viewCount > 0
          ? (metrics.commentCount / metrics.viewCount * 100).toFixed(2)
          : '0',
      },
    };

    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, `proposal-${proposal.slug}-${getTimestamp()}.json`);
    toast.success('JSON report downloaded successfully');
  };

  const downloadCSVReport = () => {
    const metrics = getProposalMetrics();
    
    const lines: string[] = [
      '# PEACEVERSE DEMOCRATIC PARTICIPATION PLATFORM - PROPOSAL REPORT',
      `# Proposal: ${proposal.title}`,
      `# Generated: ${new Date().toISOString()}`,
      '#',
      '# === PROPOSAL DETAILS ===',
      'Field,Value',
      `"ID","${proposal.id}"`,
      `"Slug","${proposal.slug}"`,
      `"Title","${proposal.title.replace(/"/g, '""')}"`,
      `"Status","${proposal.status}"`,
      `"Stage","${proposal.stage || 'draft'}"`,
      `"Category","${proposal.category || 'general'}"`,
      `"Created","${format(new Date(proposal.created_at), 'yyyy-MM-dd HH:mm:ss')}"`,
      `"Summary","${(proposal.summary || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      '#',
      '# === VOTING STATISTICS ===',
      'Metric,Value,Percentage',
      `"Total Votes","${metrics.totalVotes}","100%"`,
      `"Support Votes","${metrics.supportCount}","${metrics.supportPercentage}%"`,
      `"Oppose Votes","${metrics.opposeCount}","${metrics.opposePercentage}%"`,
      '#',
      '# === ENGAGEMENT METRICS ===',
      'Metric,Value',
      `"Views","${metrics.viewCount}"`,
      `"Comments","${metrics.commentCount}"`,
      `"Shares","${metrics.shareCount}"`,
      `"Contributors","${metrics.contributors}"`,
      '#',
      '# === TAGS ===',
      `"Tags","${(proposal.tags || []).join('; ')}"`,
    ];

    if (comments.length > 0) {
      lines.push('#');
      lines.push('# === COMMENTS ===');
      lines.push('Comment_ID,Body,Created_At,Likes');
      comments.slice(0, 50).forEach((c: any) => {
        lines.push(`"${c.id}","${(c.body || '').replace(/"/g, '""').substring(0, 200)}","${c.created_at}","${c.like_count || 0}"`);
      });
    }

    const csvContent = lines.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `proposal-${proposal.slug}-${getTimestamp()}.csv`);
    toast.success('CSV report downloaded successfully');
  };

  const downloadPDFReport = () => {
    const metrics = getProposalMetrics();
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFillColor(7, 79, 152);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('PEACEVERSE DEMOCRATIC PARTICIPATION PLATFORM', pageWidth / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Proposal Analysis Report', pageWidth / 2, 19, { align: 'center' });
    yPos = 35;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(7, 79, 152);
    doc.text(proposal.title, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 30 });
    yPos += 15;

    // Status badge
    doc.setFillColor(proposal.status === 'passed' ? 34 : proposal.status === 'rejected' ? 220 : 100, 
                     proposal.status === 'passed' ? 197 : proposal.status === 'rejected' ? 38 : 116, 
                     proposal.status === 'passed' ? 94 : proposal.status === 'rejected' ? 38 : 139);
    doc.roundedRect(pageWidth / 2 - 15, yPos, 30, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(proposal.status.toUpperCase(), pageWidth / 2, yPos + 5.5, { align: 'center' });
    yPos += 15;

    // Report info
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Executive Summary Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(7, 79, 152);
    doc.text('EXECUTIVE SUMMARY', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const summaryText = proposal.summary || 'No summary provided.';
    const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 45);
    doc.text(splitSummary.slice(0, 3), 20, yPos);
    yPos += 30;

    // Voting Statistics Section
    doc.setFontSize(12);
    doc.setTextColor(7, 79, 152);
    doc.text('VOTING STATISTICS', 15, yPos);
    yPos += 8;

    // Voting cards
    const cardWidth = (pageWidth - 45) / 3;
    
    // Total Votes
    doc.setFillColor(7, 79, 152);
    doc.roundedRect(15, yPos, cardWidth, 22, 2, 2, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(String(metrics.totalVotes), 15 + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Total Votes', 15 + cardWidth / 2, yPos + 17, { align: 'center' });

    // Support Votes
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(20 + cardWidth, yPos, cardWidth, 22, 2, 2, 'F');
    doc.setFontSize(16);
    doc.text(`${metrics.supportPercentage}%`, 20 + cardWidth + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Support (${metrics.supportCount})`, 20 + cardWidth + cardWidth / 2, yPos + 17, { align: 'center' });

    // Oppose Votes
    doc.setFillColor(220, 38, 38);
    doc.roundedRect(25 + cardWidth * 2, yPos, cardWidth, 22, 2, 2, 'F');
    doc.setFontSize(16);
    doc.text(`${metrics.opposePercentage}%`, 25 + cardWidth * 2 + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Oppose (${metrics.opposeCount})`, 25 + cardWidth * 2 + cardWidth / 2, yPos + 17, { align: 'center' });

    yPos += 30;

    // Vote distribution bar
    if (metrics.totalVotes > 0) {
      const barWidth = pageWidth - 30;
      const supportWidth = (metrics.supportCount / metrics.totalVotes) * barWidth;
      
      doc.setFillColor(34, 197, 94);
      doc.rect(15, yPos, supportWidth, 6, 'F');
      doc.setFillColor(220, 38, 38);
      doc.rect(15 + supportWidth, yPos, barWidth - supportWidth, 6, 'F');
      yPos += 12;
    }

    // Engagement Metrics
    doc.setFontSize(12);
    doc.setTextColor(7, 79, 152);
    doc.text('ENGAGEMENT METRICS', 15, yPos);
    yPos += 8;

    const engagementData = [
      ['Metric', 'Value'],
      ['Views', String(metrics.viewCount)],
      ['Comments', String(metrics.commentCount)],
      ['Shares', String(metrics.shareCount)],
      ['Unique Contributors', String(metrics.contributors)],
      ['Participation Rate', metrics.viewCount > 0 ? `${((metrics.totalVotes / metrics.viewCount) * 100).toFixed(1)}%` : 'N/A'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [engagementData[0]],
      body: engagementData.slice(1),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [7, 79, 152], textColor: 255 },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Tags
    if (proposal.tags?.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(7, 79, 152);
      doc.text('TAGS', 15, yPos);
      yPos += 6;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(proposal.tags.join(', '), 15, yPos);
      yPos += 10;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount} | Generated by Peaceverse | Confidential`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`proposal-${proposal.slug}-${getTimestamp()}.pdf`);
    toast.success('PDF report downloaded successfully');
  };

  const downloadWordReport = async () => {
    const metrics = getProposalMetrics();

    const doc = new Document({
      sections: [
        {
          children: [
            // Title Page
            new Paragraph({ text: '' }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'PEACEVERSE',
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: 'DEMOCRATIC PARTICIPATION PLATFORM',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'PROPOSAL ANALYSIS REPORT',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: proposal.title,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Status: ', bold: true }),
                new TextRun({ text: proposal.status.toUpperCase() }),
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
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'CONFIDENTIAL - AUTHORIZED USE ONLY',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ children: [new PageBreak()] }),

            // Executive Summary
            new Paragraph({
              text: 'EXECUTIVE SUMMARY',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: proposal.summary || 'No summary provided.',
            }),
            new Paragraph({ text: '' }),

            // Voting Statistics
            new Paragraph({
              text: 'VOTING STATISTICS',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: '' }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: ['Metric', 'Value', 'Percentage'].map(text =>
                    new TableCell({
                      children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
                      shading: { fill: '074F98', type: ShadingType.SOLID, color: '074F98' },
                    })
                  ),
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Total Votes')] }),
                    new TableCell({ children: [new Paragraph({ text: String(metrics.totalVotes), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: '100%', alignment: AlignmentType.CENTER })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Support Votes')] }),
                    new TableCell({ children: [new Paragraph({ text: String(metrics.supportCount), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: `${metrics.supportPercentage}%`, alignment: AlignmentType.CENTER })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Oppose Votes')] }),
                    new TableCell({ children: [new Paragraph({ text: String(metrics.opposeCount), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: `${metrics.opposePercentage}%`, alignment: AlignmentType.CENTER })] }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: '' }),

            // Engagement Metrics
            new Paragraph({
              text: 'ENGAGEMENT METRICS',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: '' }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: ['Metric', 'Value'].map(text =>
                    new TableCell({
                      children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
                      shading: { fill: '074F98', type: ShadingType.SOLID, color: '074F98' },
                    })
                  ),
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Views')] }),
                    new TableCell({ children: [new Paragraph({ text: String(metrics.viewCount), alignment: AlignmentType.CENTER })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Comments')] }),
                    new TableCell({ children: [new Paragraph({ text: String(metrics.commentCount), alignment: AlignmentType.CENTER })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Shares')] }),
                    new TableCell({ children: [new Paragraph({ text: String(metrics.shareCount), alignment: AlignmentType.CENTER })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Unique Contributors')] }),
                    new TableCell({ children: [new Paragraph({ text: String(metrics.contributors), alignment: AlignmentType.CENTER })] }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: '' }),

            // Tags
            ...(proposal.tags?.length > 0 ? [
              new Paragraph({
                text: 'TAGS',
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({ text: '' }),
              new Paragraph({
                text: proposal.tags.join(', '),
              }),
            ] : []),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, `proposal-${proposal.slug}-${getTimestamp()}.docx`);
    toast.success('Word document downloaded successfully');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        onClick={downloadPDFReport}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Download PDF Report
      </Button>
      <Button
        variant="outline"
        onClick={downloadWordReport}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        Download Word
      </Button>
      <Button
        variant="outline"
        onClick={downloadCSVReport}
        className="gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Download CSV
      </Button>
      <Button
        variant="outline"
        onClick={downloadJSONReport}
        className="gap-2"
      >
        <FileJson className="w-4 h-4" />
        Download JSON
      </Button>
    </div>
  );
};

export default ProposalReportDownload;
