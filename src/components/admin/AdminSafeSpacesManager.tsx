import { useState } from 'react';
import { useAdminSafeSpaces, useCreateSafeSpace, useUpdateSafeSpace, useDeleteSafeSpace, useArchiveSafeSpace } from '@/hooks/useAdminSafeSpaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash, Archive, ArchiveRestore, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';

export const AdminSafeSpacesManager = () => {
  const { data: safeSpaces, isLoading } = useAdminSafeSpaces();
  const createMutation = useCreateSafeSpace();
  const updateMutation = useUpdateSafeSpace();
  const deleteMutation = useDeleteSafeSpace();
  const archiveMutation = useArchiveSafeSpace();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location_name: '',
    space_type: 'community_center',
    latitude: '',
    longitude: '',
    verified: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location_name: '',
      space_type: 'community_center',
      latitude: '',
      longitude: '',
      verified: false,
    });
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };
    
    if (editingItem) {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        updates: payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      location_name: item.location_name,
      space_type: item.space_type,
      latitude: item.latitude?.toString() || '',
      longitude: item.longitude?.toString() || '',
      verified: item.verified,
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
        <h2 className="text-2xl font-bold">Safe Spaces</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Safe Space
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Safe Space' : 'Create New Safe Space'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="location_name">Location Name</Label>
                <Input
                  id="location_name"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="space_type">Space Type</Label>
                <select
                  id="space_type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.space_type}
                  onChange={(e) => setFormData({ ...formData, space_type: e.target.value })}
                >
                  <option value="community_center">Community Center</option>
                  <option value="school">School</option>
                  <option value="library">Library</option>
                  <option value="park">Park</option>
                  <option value="youth_center">Youth Center</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude (optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude (optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                />
                <Label htmlFor="verified">Verified</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingItem ? 'Update' : 'Create'} Safe Space
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeSpaces?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.location_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.space_type}</Badge>
                </TableCell>
                <TableCell>
                  {item.verified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {item.is_archived ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
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
              This action cannot be undone. This will permanently delete the safe space.
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
