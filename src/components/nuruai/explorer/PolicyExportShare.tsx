import { Button } from '@/components/ui/button';
import { Download, FileText, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface SectionExplanation {
  explanation: string;
  impact: string;
}

interface PolicyExportShareProps {
  documentTitle: string;
  sections: { title: string; content: string }[];
  explanations: Record<number, SectionExplanation>;
}

const PolicyExportShare = ({ documentTitle, sections, explanations }: PolicyExportShareProps) => {

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(documentTitle, margin, y);
    y += 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported on ${new Date().toLocaleDateString()} — PeaceVerse Policy Explorer`, margin, y);
    y += 12;

    sections.forEach((section, i) => {
      if (y > 260) { doc.addPage(); y = 20; }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`§${i + 1} ${section.title}`, margin, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const contentLines = doc.splitTextToSize(section.content.substring(0, 500), maxWidth);
      doc.text(contentLines, margin, y);
      y += contentLines.length * 4 + 4;

      if (explanations[i]) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bolditalic');
        doc.text('AI Explanation:', margin, y);
        y += 5;
        doc.setFont('helvetica', 'italic');
        const explainLines = doc.splitTextToSize(explanations[i].explanation.substring(0, 400), maxWidth);
        doc.text(explainLines, margin, y);
        y += explainLines.length * 4 + 6;
      }

      y += 4;
    });

    doc.save(`${documentTitle.replace(/\s+/g, '_')}_explained.pdf`);
    toast.success('PDF exported successfully');
  };

  const exportMarkdown = () => {
    let md = `# ${documentTitle}\n\n_Exported from PeaceVerse Policy Explorer — ${new Date().toLocaleDateString()}_\n\n---\n\n`;

    sections.forEach((section, i) => {
      md += `## §${i + 1} ${section.title}\n\n${section.content}\n\n`;
      if (explanations[i]) {
        md += `> **AI Explanation:** ${explanations[i].explanation}\n\n`;
        if (explanations[i].impact) {
          md += `> **Citizen Impact:** ${explanations[i].impact}\n\n`;
        }
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, '_')}_explained.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown exported');
  };

  const shareDocument = async () => {
    const shareData = {
      title: documentTitle,
      text: `Check out this policy document: ${documentTitle} — explored with AI explanations on PeaceVerse`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportPDF}>
        <Download className="h-3 w-3" /> PDF
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportMarkdown}>
        <FileText className="h-3 w-3" /> Markdown
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={shareDocument}>
        <Share2 className="h-3 w-3" /> Share
      </Button>
    </div>
  );
};

export default PolicyExportShare;
