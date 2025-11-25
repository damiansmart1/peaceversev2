import { useState, useMemo } from 'react';
import { useAdminProposals, useCreateProposal, useUpdateProposal, useDeleteProposal, useArchiveProposal } from '@/hooks/useAdminProposals';
import { useApproveProposal, useRejectProposal } from '@/hooks/useApproveContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash, Archive, ArchiveRestore, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/RichTextEditor';

export const AdminProposalsManager = () => {
  const { data: proposals, isLoading } = useAdminProposals();
  const createMutation = useCreateProposal();
  const updateMutation = useUpdateProposal();
  const deleteMutation = useDeleteProposal();
  const archiveMutation = useArchiveProposal();
  const approveMutation = useApproveProposal();
  const rejectMutation = useRejectProposal();

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingProposal, setReviewingProposal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    body: '',
    status: 'published',
    tags: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      body: '',
      status: 'published',
      tags: '',
    });
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    
    if (editingItem) {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        updates: {
          ...formData,
          tags,
        },
      });
    } else {
      await createMutation.mutateAsync({
        ...formData,
        tags,
      });
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      summary: item.summary,
      body: item.body,
      status: item.status,
      tags: item.tags?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  // Enhanced analytics
  const proposalStats = useMemo(() => {
    if (!proposals) return null;
    
    const totalViews = proposals.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const totalSignatures = proposals.reduce((sum, p) => sum + (p.signature_count || 0), 0);
    const avgViewsPerProposal = proposals.length > 0 ? Math.round(totalViews / proposals.length) : 0;
    const avgSignaturesPerProposal = proposals.length > 0 ? Math.round(totalSignatures / proposals.length) : 0;
    
    return {
      totalViews,
      totalSignatures,
      avgViewsPerProposal,
      avgSignaturesPerProposal,
      conversionRate: totalViews > 0 ? ((totalSignatures / totalViews) * 100).toFixed(2) : '0'
    };
  }, [proposals]);

  // Filter proposals by status
  const filteredProposals = useMemo(() => {
    if (!proposals) return { all: [], pending: [], published: [], rejected: [], draft: [] };
    return {
      all: proposals,
      pending: proposals.filter(p => p.status === 'pending_approval'),
      published: proposals.filter(p => p.status === 'published'),
      rejected: proposals.filter(p => p.status === 'rejected'),
      draft: proposals.filter(p => p.status === 'draft'),
    };
  }, [proposals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const renderProposalsTable = (items: any[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Signatures</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Archive Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No proposals found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      item.status === 'published' ? 'default' : 
                      item.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {item.status === 'pending_approval' && 'Pending Review'}
                    {item.status === 'published' && 'Published'}
                    {item.status === 'rejected' && 'Rejected'}
                    {item.status === 'draft' && 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{item.signature_count}</TableCell>
                <TableCell>{item.view_count}</TableCell>
                <TableCell>
                  {item.is_archived ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {item.status === 'pending_approval' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => approveMutation.mutate(item.id)} title="Approve & Publish">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReviewingProposal(item.id);
                            setReviewDialogOpen(true);
                          }}
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => archiveMutation.mutate({ id: item.id, archived: !item.is_archived })}
                    >
                      {item.is_archived ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Analytics Overview */}
      {proposalStats && (
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposalStats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {proposalStats.avgViewsPerProposal} per proposal
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{proposalStats.totalSignatures.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {proposalStats.avgSignaturesPerProposal} per proposal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{proposalStats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Views to signatures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredProposals.published.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Live proposals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {filteredProposals.all.length > 0 
                  ? Math.round((proposalStats.totalSignatures / filteredProposals.all.length)) 
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Signatures per item
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Proposals</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProposals.pending.length} pending approval
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Proposal' : 'Create New Proposal'}</DialogTitle>
              <DialogDescription>Use the rich text editor for formatting the proposal content.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Input
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary"
                />
              </div>
              <div>
                <Label htmlFor="body">Body</Label>
                <RichTextEditor
                  content={formData.body}
                  onChange={(html) => setFormData({ ...formData, body: html })}
                  placeholder="Full proposal content with formatting..."
                  minHeight="250px"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="education, youth, community"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingItem ? 'Update' : 'Create'} Proposal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval ({filteredProposals.pending.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({filteredProposals.published.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({filteredProposals.rejected.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft ({filteredProposals.draft.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({filteredProposals.all.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {renderProposalsTable(filteredProposals.pending)}
        </TabsContent>

        <TabsContent value="published">
          {renderProposalsTable(filteredProposals.published)}
        </TabsContent>

        <TabsContent value="rejected">
          {renderProposalsTable(filteredProposals.rejected)}
        </TabsContent>

        <TabsContent value="draft">
          {renderProposalsTable(filteredProposals.draft)}
        </TabsContent>

        <TabsContent value="all">
          {renderProposalsTable(filteredProposals.all)}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the proposal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Proposal</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this proposal. The author will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this proposal cannot be approved..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (reviewingProposal && rejectionReason.trim()) {
                  rejectMutation.mutate({ 
                    id: reviewingProposal, 
                    reason: rejectionReason 
                  });
                  setReviewDialogOpen(false);
                  setRejectionReason("");
                  setReviewingProposal(null);
                }
              }}
              disabled={!rejectionReason.trim()}
            >
              Reject Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
