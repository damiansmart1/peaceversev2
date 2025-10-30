import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Eye, FileEdit } from 'lucide-react';
import { useCreateProposal, usePublishProposal } from '@/hooks/useProposals';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import RichTextEditor from '@/components/RichTextEditor';
import ContentPreview from '@/components/ContentPreview';

const proposalSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200),
  summary: z.string().trim().min(20, 'Summary must be at least 20 characters').max(500),
  body: z.string().trim().min(50, 'Body must be at least 50 characters').max(10000),
  tags: z.array(z.string()).min(1, 'Add at least one tag').max(10),
  billProposerName: z.string().trim().min(2, 'Bill proposer name is required').max(200),
  parliamentaryStage: z.string().min(1, 'Parliamentary stage is required'),
});

const CreateProposalDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [billProposerName, setBillProposerName] = useState('');
  const [parliamentaryStage, setParliamentaryStage] = useState('first_reading');
  const [billFile, setBillFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
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

  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const allowedTypes = ['pdf', 'doc', 'docx'];
    
    if (!fileExt || !allowedTypes.includes(fileExt.toLowerCase())) {
      toast.error('Please upload a PDF or Word document');
      return null;
    }

    setUploadingFile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload files');
      }

      // RLS policy requires user ID as first folder
      const fileName = `${user.id}/bills/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('content')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(data.path);

      toast.success('File uploaded successfully');
      setUploadingFile(false);
      return publicUrl;
    } catch (error: any) {
      console.error('File upload failed:', error);
      setUploadingFile(false);
      toast.error(`Failed to upload file: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  const handleSubmit = async (publishNow: boolean) => {
    try {
      const validated = proposalSchema.parse({ 
        title, 
        summary, 
        body, 
        tags, 
        billProposerName,
        parliamentaryStage 
      });
      setErrors({});

      // Upload file if provided
      let billFileUrl = null;
      if (billFile) {
        billFileUrl = await handleFileUpload(billFile);
        if (!billFileUrl) return; // Stop if file upload failed
      }

      const proposal = await createProposal.mutateAsync({
        title: validated.title,
        summary: validated.summary,
        body: validated.body,
        tags: validated.tags,
        billProposerName: validated.billProposerName,
        parliamentaryStage: validated.parliamentaryStage,
        billFileUrl,
      });
      
      if (publishNow && proposal) {
        await publishProposal.mutateAsync(proposal.id);
      }

      setOpen(false);
      setTitle('');
      setSummary('');
      setBody('');
      setTags([]);
      setBillProposerName('');
      setParliamentaryStage('first_reading');
      setBillFile(null);
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogDescription>Fill in the details below and preview how your proposal will appear.</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="gap-2">
              <FileEdit className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-4 pr-2">
          <div>
            <Label htmlFor="billProposer">Name of Bill Proposer *</Label>
            <Input
              id="billProposer"
              value={billProposerName}
              onChange={(e) => setBillProposerName(e.target.value)}
              placeholder="Enter the name of the bill proposer"
              className={errors.billProposerName ? 'border-destructive' : ''}
            />
            {errors.billProposerName && <p className="text-sm text-destructive mt-1">{errors.billProposerName}</p>}
          </div>

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
            <Label htmlFor="stage">Parliamentary Stage *</Label>
            <Select value={parliamentaryStage} onValueChange={setParliamentaryStage}>
              <SelectTrigger className={errors.parliamentaryStage ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select parliamentary stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_reading">First Reading</SelectItem>
                <SelectItem value="second_reading">Second Reading</SelectItem>
                <SelectItem value="committee_stage">Committee Stage</SelectItem>
                <SelectItem value="report_stage">Report Stage</SelectItem>
                <SelectItem value="third_reading">Third Reading</SelectItem>
                <SelectItem value="presidential_assent">Presidential Assent</SelectItem>
                <SelectItem value="enacted">Enacted</SelectItem>
              </SelectContent>
            </Select>
            {errors.parliamentaryStage && <p className="text-sm text-destructive mt-1">{errors.parliamentaryStage}</p>}
          </div>

              <div>
                <Label htmlFor="summary">Summary *</Label>
                <Input
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary (20-500 characters)"
                  className={errors.summary ? 'border-destructive' : ''}
                />
                {errors.summary && <p className="text-sm text-destructive mt-1">{errors.summary}</p>}
              </div>

              <div>
                <Label htmlFor="body">Full Proposal *</Label>
                <RichTextEditor
                  content={body}
                  onChange={setBody}
                  placeholder="Write the detailed description of your proposal..."
                  minHeight="300px"
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

          <div>
            <Label htmlFor="billFile">Upload Full Bill (PDF/Word)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="billFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {billFile && (
                <Badge variant="secondary" className="gap-1">
                  {billFile.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setBillFile(null)} />
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Upload the complete bill document (PDF or Word format)
            </p>
          </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleSubmit(false)} 
                  disabled={createProposal.isPending || uploadingFile}
                >
                  Save Draft
                </Button>
                <Button 
                  onClick={() => handleSubmit(true)} 
                  disabled={createProposal.isPending || publishProposal.isPending || uploadingFile}
                >
                  {uploadingFile ? 'Uploading...' : 'Publish Now'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            <ContentPreview
              title={title}
              summary={summary}
              body={body}
              tags={tags}
              additionalInfo={
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proposer:</span>
                    <span className="font-medium">{billProposerName || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stage:</span>
                    <span className="font-medium capitalize">
                      {parliamentaryStage.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {billFile && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Attached File:</span>
                      <span className="font-medium">{billFile.name}</span>
                    </div>
                  )}
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProposalDialog;
