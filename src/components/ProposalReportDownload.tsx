import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ProposalReportDownloadProps {
  proposal: any;
  voteStats?: {
    supportCount: number;
    opposeCount: number;
  };
}

const ProposalReportDownload = ({ proposal, voteStats }: ProposalReportDownloadProps) => {
  const downloadTextReport = () => {
    const totalVotes = (voteStats?.supportCount || 0) + (voteStats?.opposeCount || 0);
    const supportPercentage = totalVotes > 0 ? ((voteStats?.supportCount || 0) / totalVotes * 100).toFixed(1) : 0;
    
    const report = `
PROPOSAL REPORT
================

Title: ${proposal.title}
Status: ${proposal.status}
Created: ${new Date(proposal.created_at).toLocaleDateString()}

SUMMARY
-------
${proposal.summary}

FULL DESCRIPTION
----------------
${proposal.body}

VOTING STATISTICS
-----------------
Total Votes: ${totalVotes}
Support: ${voteStats?.supportCount || 0} (${supportPercentage}%)
Oppose: ${voteStats?.opposeCount || 0} (${(100 - Number(supportPercentage)).toFixed(1)}%)

ENGAGEMENT METRICS
------------------
Views: ${proposal.view_count || 0}
Comments: ${proposal.comment_count || 0}
Contributors: ${proposal.unique_contributors || 0}
Shares: ${proposal.share_count || 0}

TAGS
----
${proposal.tags?.join(', ') || 'None'}

---
Report generated on ${new Date().toLocaleString()}
Downloaded from Public Participation Platform
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${proposal.slug}-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully');
  };

  const downloadCSVReport = () => {
    const csv = `
"Field","Value"
"Title","${proposal.title.replace(/"/g, '""')}"
"Status","${proposal.status}"
"Created","${new Date(proposal.created_at).toLocaleDateString()}"
"Summary","${proposal.summary.replace(/"/g, '""')}"
"Total Votes","${(voteStats?.supportCount || 0) + (voteStats?.opposeCount || 0)}"
"Support Votes","${voteStats?.supportCount || 0}"
"Oppose Votes","${voteStats?.opposeCount || 0}"
"Views","${proposal.view_count || 0}"
"Comments","${proposal.comment_count || 0}"
"Contributors","${proposal.unique_contributors || 0}"
"Shares","${proposal.share_count || 0}"
"Tags","${proposal.tags?.join('; ') || 'None'}"
    `.trim();

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${proposal.slug}-data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('CSV data downloaded successfully');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        onClick={downloadTextReport}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Download Full Report
      </Button>
      <Button
        variant="outline"
        onClick={downloadCSVReport}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        Download Data (CSV)
      </Button>
    </div>
  );
};

export default ProposalReportDownload;
