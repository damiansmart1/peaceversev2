import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import RichTextEditor from '@/components/RichTextEditor';
import {
  useAllCMSContent,
  useCreateCMSContent,
  useUpdateCMSContent,
  useDeleteCMSContent,
  uploadCMSMedia,
  CMSContent,
  CMS_SECTIONS,
  CONTENT_TYPES,
} from '@/hooks/useCMS';
import {
  Plus,
  Pencil,
  Trash2,
  Image,
  Type,
  FileText,
  Music,
  Video,
  File,
  Upload,
  X,
  Search,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

const getContentIcon = (type: string) => {
  switch (type) {
    case 'text': return <Type className="w-4 h-4" />;
    case 'html': return <FileText className="w-4 h-4" />;
    case 'image': return <Image className="w-4 h-4" />;
    case 'audio': return <Music className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'document': return <File className="w-4 h-4" />;
    default: return <File className="w-4 h-4" />;
  }
};

export default function AdminCMSManager() {
  const { data: allContent, isLoading } = useAllCMSContent();
  const createContent = useCreateCMSContent();
  const updateContent = useUpdateCMSContent();
  const deleteContent = useDeleteCMSContent();

  const [activeSection, setActiveSection] = useState('homepage');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CMSContent | null>(null);
  const [deleteItem, setDeleteItem] = useState<CMSContent | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    content_key: '',
    content_type: 'text' as CMSContent['content_type'],
    section: 'homepage',
    title: '',
    content: '',
    media_url: '',
    media_alt: '',
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      content_key: '',
      content_type: 'text',
      section: 'homepage',
      title: '',
      content: '',
      media_url: '',
      media_alt: '',
      is_active: true,
      display_order: 0,
    });
  };

  const filteredContent = allContent?.filter(item => {
    const matchesSection = item.section === activeSection;
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  }) || [];

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadCMSMedia(file, formData.section);
      setFormData(prev => ({ ...prev, media_url: url }));
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.content_key) {
      toast.error('Content key is required');
      return;
    }

    if (editingItem) {
      await updateContent.mutateAsync({
        id: editingItem.id,
        ...formData,
      });
      setEditingItem(null);
    } else {
      await createContent.mutateAsync(formData);
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleEdit = (item: CMSContent) => {
    setEditingItem(item);
    setFormData({
      content_key: item.content_key,
      content_type: item.content_type,
      section: item.section,
      title: item.title || '',
      content: item.content || '',
      media_url: item.media_url || '',
      media_alt: item.media_alt || '',
      is_active: item.is_active,
      display_order: item.display_order,
    });
  };

  const handleDelete = async () => {
    if (deleteItem) {
      await deleteContent.mutateAsync(deleteItem.id);
      setDeleteItem(null);
    }
  };

  const handleToggleActive = async (item: CMSContent) => {
    await updateContent.mutateAsync({
      id: item.id,
      is_active: !item.is_active,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const ContentForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="content_key">Content Key *</Label>
          <Input
            id="content_key"
            value={formData.content_key}
            onChange={(e) => setFormData(prev => ({ ...prev, content_key: e.target.value }))}
            placeholder="e.g., hero_title"
            disabled={isEdit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Select
            value={formData.section}
            onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CMS_SECTIONS.map(section => (
                <SelectItem key={section.id} value={section.id}>
                  {section.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="content_type">Content Type</Label>
          <Select
            value={formData.content_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value as CMSContent['content_type'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  <span className="flex items-center gap-2">
                    {getContentIcon(type.id)}
                    {type.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Descriptive title"
          />
        </div>
      </div>

      {(formData.content_type === 'text') && (
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter text content..."
            rows={4}
          />
        </div>
      )}

      {formData.content_type === 'html' && (
        <div className="space-y-2">
          <Label>Rich Text Content</Label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          />
        </div>
      )}

      {['image', 'audio', 'video', 'document'].includes(formData.content_type) && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Media File</Label>
            <div className="flex items-center gap-2">
              <Input
                value={formData.media_url}
                onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                placeholder="Media URL or upload a file"
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={
                  formData.content_type === 'image' ? 'image/*' :
                  formData.content_type === 'audio' ? 'audio/*' :
                  formData.content_type === 'video' ? 'video/*' :
                  '*/*'
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          {formData.content_type === 'image' && formData.media_url && (
            <div className="relative w-48 h-32 rounded-lg overflow-hidden border">
              <img
                src={formData.media_url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-6 h-6"
                onClick={() => setFormData(prev => ({ ...prev, media_url: '' }))}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="media_alt">Alt Text / Description</Label>
            <Input
              id="media_alt"
              value={formData.media_alt}
              onChange={(e) => setFormData(prev => ({ ...prev, media_alt: e.target.value }))}
              placeholder="Describe the media for accessibility"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label>Active</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Manage all website content, images, and media</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
            </DialogHeader>
            <ContentForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createContent.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="flex-wrap h-auto p-1">
          {CMS_SECTIONS.map(section => (
            <TabsTrigger key={section.id} value={section.id} className="gap-2">
              {section.label}
              <Badge variant="secondary" className="ml-1">
                {allContent?.filter(c => c.section === section.id).length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {CMS_SECTIONS.map(section => (
          <TabsContent key={section.id} value={section.id} className="space-y-4">
            {filteredContent.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No content in this section yet.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    resetForm();
                    setFormData(prev => ({ ...prev, section: section.id }));
                    setIsCreateOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Content
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredContent.map(item => (
                  <Card key={item.id} className={!item.is_active ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-muted">
                            {getContentIcon(item.content_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{item.title || item.content_key}</h3>
                              <Badge variant="outline" className="text-xs">
                                {item.content_type}
                              </Badge>
                              {!item.is_active && (
                                <Badge variant="secondary" className="text-xs">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Hidden
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">
                              {item.content_key}
                            </p>
                            {item.content && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                              </p>
                            )}
                            {item.media_url && item.content_type === 'image' && (
                              <img
                                src={item.media_url}
                                alt={item.media_alt || ''}
                                className="mt-2 w-24 h-16 object-cover rounded"
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(item)}
                            title={item.is_active ? 'Hide' : 'Show'}
                          >
                            {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteItem(item)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          <ContentForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={updateContent.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.title || deleteItem?.content_key}"? This action cannot be undone.
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
}
