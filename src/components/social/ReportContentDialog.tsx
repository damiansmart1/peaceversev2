import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ReportContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  contentTitle: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'violence', label: 'Violence or dangerous content' },
  { value: 'misinformation', label: 'False information' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'other', label: 'Other' },
];

export const ReportContentDialog = ({ open, onOpenChange, contentId, contentTitle }: ReportContentDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('content_reports')
        .insert({
          content_id: contentId,
          reporter_id: user.id,
          reason,
          details: details || null,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-reports'] });
      toast.success('Report submitted. Our team will review it within 24 hours.');
      onOpenChange(false);
      setReason('');
      setDetails('');
    },
    onError: () => toast.error('Failed to submit report. Please try again.'),
  });

  const handleSubmit = () => {
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Report "{contentTitle}" for violating community guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Why are you reporting this?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Additional details (optional)</Label>
            <Textarea
              placeholder="Provide more context about why you're reporting this content..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!reason || reportMutation.isPending}
              variant="destructive"
              className="flex-1"
            >
              {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
