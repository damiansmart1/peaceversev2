import { useState } from 'react';
import { useAdminSponsors, useCreateSponsor, useUpdateSponsor, useDeleteSponsor } from '@/hooks/useAdminSponsors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash, Loader2, Upload, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'community', label: 'Community' },
  { value: 'incidents', label: 'Incidents' },
  { value: 'proposals', label: 'Proposals' },
  { value: 'challenges', label: 'Challenges' },
  { value: 'radio', label: 'Radio' },
  { value: 'safety', label: 'Safety' },
];

export const AdminSponsorsManager = () => {
  const { data: sponsors, isLoading } = useAdminSponsors();
  const createMutation = useCreateSponsor();
  const updateMutation = useUpdateSponsor();
  const deleteMutation = useDeleteSponsor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    display_order: 0,
    is_active: true,
    pages: ['home'] as string[],
    rotation_duration: 3000,
    display_frequency: 'always' as 'always' | 'high' | 'medium' | 'low',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      website_url: '',
      display_order: sponsors?.length || 0,
      is_active: true,
      pages: ['home'],
      rotation_duration: 3000,
      display_frequency: 'always',
    });
    setEditingItem(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or JPEG image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `sponsor-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `sponsors/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

      setFormData({ ...formData, logo_url: publicUrl });
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload logo: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.logo_url) {
      toast.error('Name and logo are required');
      return;
    }

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
      name: item.name,
      logo_url: item.logo_url,
      website_url: item.website_url || '',
      display_order: item.display_order,
      is_active: item.is_active,
      pages: item.pages || ['home'],
      rotation_duration: item.rotation_duration || 3000,
      display_frequency: item.display_frequency || 'always',
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
        <h2 className="text-2xl font-bold">Sponsors & Partners</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Sponsor' : 'Add New Sponsor'}</DialogTitle>
              <DialogDescription>Upload sponsor logos and manage partnership information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Sponsor Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter sponsor name"
                />
              </div>

              <div>
                <Label htmlFor="logo">Logo *</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png or upload below"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Accepts PNG, JPG, JPEG (max 5MB). Images maintain quality without distortion.
                  </p>
                  {formData.logo_url && (
                    <div className="border rounded p-4 bg-muted/20">
                      <img 
                        src={formData.logo_url} 
                        alt="Logo preview" 
                        className="max-h-24 w-auto mx-auto object-contain"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="website_url">Website URL (optional)</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Display on Pages</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 p-3 border rounded-md">
                  {PAGE_OPTIONS.map((page) => (
                    <div key={page.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={page.value}
                        checked={formData.pages.includes(page.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, pages: [...formData.pages, page.value] });
                          } else {
                            setFormData({ ...formData, pages: formData.pages.filter(p => p !== page.value) });
                          }
                        }}
                      />
                      <Label htmlFor={page.value} className="font-normal cursor-pointer">
                        {page.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="rotation_duration">Rotation Duration (ms)</Label>
                <Input
                  id="rotation_duration"
                  type="number"
                  value={formData.rotation_duration}
                  onChange={(e) => setFormData({ ...formData, rotation_duration: parseInt(e.target.value) || 3000 })}
                  placeholder="3000"
                  min="1000"
                  step="500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How long each sponsor appears in the carousel (milliseconds)
                </p>
              </div>

              <div>
                <Label htmlFor="display_frequency">Display Frequency</Label>
                <Select
                  value={formData.display_frequency}
                  onValueChange={(value: any) => setFormData({ ...formData, display_frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always (100%)</SelectItem>
                    <SelectItem value="high">High (75%)</SelectItem>
                    <SelectItem value="medium">Medium (50%)</SelectItem>
                    <SelectItem value="low">Low (25%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  How often this sponsor appears in rotation
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active (visible on website)</Label>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingItem ? 'Update' : 'Add'} Sponsor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsors?.map((sponsor: any) => (
              <TableRow key={sponsor.id}>
                <TableCell>
                  <div className="flex items-center justify-center h-12 w-24 bg-muted/20 rounded">
                    <img 
                      src={sponsor.logo_url} 
                      alt={sponsor.name}
                      className="max-h-10 max-w-full object-contain"
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {sponsor.name}
                    {sponsor.website_url && (
                      <a 
                        href={sponsor.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {sponsor.pages?.map((page: string) => (
                      <Badge key={page} variant="outline" className="text-xs">
                        {page}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {sponsor.display_frequency || 'always'}
                  </Badge>
                </TableCell>
                <TableCell>{sponsor.display_order}</TableCell>
                <TableCell>
                  {sponsor.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(sponsor)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(sponsor.id)}>
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
              This action cannot be undone. This will permanently delete the sponsor.
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