import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { useCreateProposal, usePublishProposal } from '@/hooks/useProposals';
import { z } from 'zod';

const proposalSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200),
  summary: z.string().trim().min(20, 'Summary must be at least 20 characters').max(500),
  body: z.string().trim().min(50, 'Body must be at least 50 characters').max(10000),
  tags: z.array(z.string()).min(1, 'Add at least one tag').max(10),
});

const CreateProposalDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProposal = useCreateProposal();
  const publishProposal = usePublishProposal();

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (publishNow: boolean) => {
    try {
      const validated = proposalSchema.parse({ title, summary, body, tags });
      setErrors({});

      const proposal = await createProposal.mutateAsync({
        title: validated.title,
        summary: validated.summary,
        body: validated.body,
        tags: validated.tags,
      });
      
      if (publishNow && proposal) {
        await publishProposal.mutateAsync(proposal.id);
      }

      setOpen(false);
      setTitle('');
      setSummary('');
      setBody('');
      setTags([]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your proposal a clear title"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary (20-500 characters)"
              rows={3}
              className={errors.summary ? 'border-destructive' : ''}
            />
            {errors.summary && <p className="text-sm text-destructive mt-1">{errors.summary}</p>}
          </div>

          <div>
            <Label htmlFor="body">Full Proposal *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detailed description of your proposal..."
              rows={10}
              className={errors.body ? 'border-destructive' : ''}
            />
            {errors.body && <p className="text-sm text-destructive mt-1">{errors.body}</p>}
          </div>

          <div>
            <Label htmlFor="tags">Tags *</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags (press Enter)"
                className={errors.tags ? 'border-destructive' : ''}
              />
              <Button type="button" onClick={addTag} variant="secondary">
                Add
              </Button>
            </div>
            {errors.tags && <p className="text-sm text-destructive mt-1">{errors.tags}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => handleSubmit(false)} disabled={createProposal.isPending}>
              Save Draft
            </Button>
            <Button onClick={() => handleSubmit(true)} disabled={createProposal.isPending || publishProposal.isPending}>
              Publish Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProposalDialog;
