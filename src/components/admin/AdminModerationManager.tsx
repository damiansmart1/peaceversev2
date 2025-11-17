import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export const AdminModerationManager = () => {
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: flags, isLoading } = useQuery({
    queryKey: ['admin-moderation-flags'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('moderation_flags')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from('moderation_flags')
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: resolutionNotes,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderation-flags'] });
      toast.success('Flag resolved');
      setSelectedFlag(null);
      setResolutionNotes('');
    },
    onError: (error: any) => toast.error(`Failed: ${error.message}`),
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Content Moderation</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Flagged By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flags?.map((flag) => (
            <TableRow key={flag.id}>
              <TableCell>
                <Badge variant="outline">
                  {flag.proposal_id ? 'Proposal' : flag.comment_id ? 'Comment' : 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>{flag.flag_reason}</TableCell>
              <TableCell>
                User {flag.flagged_by?.substring(0, 8)}
              </TableCell>
              <TableCell className="text-sm">
                {format(new Date(flag.created_at), 'MMM d, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    flag.status === 'pending' ? 'default' :
                    flag.status === 'approved' ? 'destructive' : 'secondary'
                  }
                >
                  {flag.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFlag(flag)}
                  disabled={flag.status !== 'pending'}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedFlag} onOpenChange={() => setSelectedFlag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Flag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Reason:</p>
              <p className="text-sm text-muted-foreground">{selectedFlag?.flag_reason}</p>
            </div>
            {selectedFlag?.flag_description && (
              <div>
                <p className="text-sm font-medium">Description:</p>
                <p className="text-sm text-muted-foreground">{selectedFlag.flag_description}</p>
              </div>
            )}
            <Textarea
              placeholder="Resolution notes..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => resolveMutation.mutate({ id: selectedFlag?.id, status: 'approved' })}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve (Remove Content)
              </Button>
              <Button
                variant="outline"
                onClick={() => resolveMutation.mutate({ id: selectedFlag?.id, status: 'rejected' })}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject (Keep Content)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
