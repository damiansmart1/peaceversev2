import { useState } from 'react';
import { useAdminContent, useCreateContent, useUpdateContent, useDeleteContent, useArchiveContent } from '@/hooks/useAdminContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash, Archive, ArchiveRestore, Loader2, Upload, X, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import RichTextEditor from '@/components/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminContentManager = () => {
  const { data: content, isLoading } = useAdminContent();
  const createMutation = useCreateContent();
  const updateMutation = useUpdateContent();
  const deleteMutation = useDeleteContent();
  const archiveMutation = useArchiveContent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: 'video',
    thumbnail_url: '',
    category: 'general',
    attachments: [] as any[],
  });
  
  const [webLinks, setWebLinks] = useState<string[]>([]);
  const [newWebLink, setNewWebLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mainFileUploading, setMainFileUploading] = useState(false);
  const [mainFile, setMainFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      file_url: '',
      file_type: 'video',
      thumbnail_url: '',
      category: 'general',
      attachments: [],
    });
    setWebLinks([]);
    setNewWebLink('');
    setEditingItem(null);
    setMainFile(null);
  };

  const handleMainFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMainFileUploading(true);
    
    try {
      let processedFile = file;
      
      // For images, resize and compress to 2MB max
      if (file.type.startsWith('image/')) {
        const { processUploadedImage } = await import('@/lib/imageUtils');
        processedFile = await processUploadedImage(file, 2);
        toast.success('Image optimized for upload');
      } else {
        // For videos and audio, enforce 100MB limit
        if (file.size > 100 * 1024 * 1024) {
          toast.error('Videos/audio must be smaller than 100MB');
          setMainFileUploading(false);
          return;
        }
      }

      setMainFile(processedFile);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, processedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);

      // Determine file type
      let fileType = 'video';
      if (processedFile.type.startsWith('image/')) fileType = 'image';
      else if (processedFile.type.startsWith('audio/')) fileType = 'audio';

      setFormData({
        ...formData,
        file_url: publicUrl,
        file_type: fileType,
      });
      
      toast.success('Main file uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload main file: ' + error.message);
      setMainFile(null);
    } finally {
      setMainFileUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const uploadedFiles: any[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let processedFile = file;
        
        // For images, process and compress
        if (file.type.startsWith('image/')) {
          const { processUploadedImage } = await import('@/lib/imageUtils');
          processedFile = await processUploadedImage(file, 2);
        }
        
        const fileExt = processedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(filePath, processedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('content')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          type: 'file',
          url: publicUrl,
          name: processedFile.name,
          file_type: processedFile.type,
        });
      }

      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...uploadedFiles],
      });
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
    } catch (error: any) {
      toast.error('Failed to upload files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const addWebLink = () => {
    if (newWebLink.trim()) {
      const newAttachment = {
        type: 'link',
        url: newWebLink.trim(),
        name: newWebLink.trim(),
      };
      setFormData({
        ...formData,
        attachments: [...formData.attachments, newAttachment],
      });
      setNewWebLink('');
    }
  };

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (editingItem) {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        updates: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      file_url: item.file_url,
      file_type: item.file_type,
      thumbnail_url: item.thumbnail_url || '',
      category: item.category || 'general',
      attachments: item.attachments || [],
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
        <h2 className="text-2xl font-bold">Content Stories</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Content' : 'Create New Content'}</DialogTitle>
              <DialogDescription>Use the rich text editor for formatting the content description.</DialogDescription>
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
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  content={formData.description}
                  onChange={(html) => setFormData({ ...formData, description: html })}
                  placeholder="Enter formatted description..."
                  minHeight="200px"
                />
              </div>

              <div>
                <Label>Main Content File (Image/Video/Audio) *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <input
                    id="main-file-upload"
                    type="file"
                    accept="video/*,image/*,audio/*"
                    className="hidden"
                    onChange={handleMainFileUpload}
                  />
                  <label htmlFor="main-file-upload" className="cursor-pointer">
                    {mainFile || formData.file_url ? (
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Upload className="h-5 w-5" />
                          <span className="font-medium">
                            {mainFile ? mainFile.name : 'File uploaded'}
                          </span>
                        </div>
                        {mainFile && (
                          <p className="text-sm text-muted-foreground">
                            {(mainFile.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Click to upload main content file
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Video, Image, or Audio (Max 100MB)
                        </p>
                      </div>
                    )}
                  </label>
                  {mainFileUploading && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                </div>
                {formData.file_url && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Type: {formData.file_type}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
              <div>
                <Label htmlFor="category">Content Category</Label>
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="general">General Content</option>
                  <option value="peace_stories">Peace Stories</option>
                  <option value="voice_stories">Voice Stories</option>
                  <option value="community">Community</option>
                  <option value="radio">Radio Content</option>
                </select>
              </div>

              <div className="space-y-4">
                <Label>Additional Attachments (Images/Videos/PDFs)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('attachment-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Files
                  </Button>
                  <input
                    id="attachment-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div>
                  <Label>Add Web Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newWebLink}
                      onChange={(e) => setNewWebLink(e.target.value)}
                      placeholder="https://example.com"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWebLink())}
                    />
                    <Button type="button" variant="outline" onClick={addWebLink}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Attachments:</Label>
                    <div className="border rounded p-2 space-y-2">
                      {formData.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2 truncate flex-1">
                            {attachment.type === 'link' ? (
                              <LinkIcon className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <Upload className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="text-sm truncate">{attachment.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={!formData.title || !formData.file_url || mainFileUploading || uploading}
              >
                {mainFileUploading || uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>{editingItem ? 'Update' : 'Create'} Content</>
                )}
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
              <TableHead>Type</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.file_type}</Badge>
                </TableCell>
                <TableCell>{item.view_count}</TableCell>
                <TableCell>{item.like_count}</TableCell>
                <TableCell>
                  {item.is_archived ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : (
                    <Badge variant="default">Published</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
              This action cannot be undone. This will permanently delete the content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
