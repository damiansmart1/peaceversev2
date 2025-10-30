import { useState } from 'react';
import { useAdminProposals, useCreateProposal, useUpdateProposal, useDeleteProposal, useArchiveProposal } from '@/hooks/useAdminProposals';
import { useApproveProposal, useRejectProposal } from '@/hooks/useApproveContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash, Archive, ArchiveRestore, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proposals</h2>
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
            {proposals?.map((item) => (
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
            ))}
          </TableBody>
        </Table>
      </div>

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
              <Input
                id="reason"
                placeholder="Explain why this proposal cannot be approved..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
