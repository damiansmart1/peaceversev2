import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Settings,
  Tag,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useIncidentCategories, type IncidentCategory } from '@/hooks/useElections';
import { useUpdateIncidentCategory, useCreateIncidentCategory } from '@/hooks/useElectionAuditLog';

export default function ElectionCategoriesManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IncidentCategory | null>(null);
  const [newSubCategory, setNewSubCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity_default: 'moderate',
    sub_categories: [] as string[],
    display_order: 0,
  });

  const { data: categories, isLoading, refetch } = useIncidentCategories();
  const updateCategory = useUpdateIncidentCategory();
  const createCategory = useCreateIncidentCategory();

  const resetForm = () => {
    setFormData({ name: '', description: '', severity_default: 'moderate', sub_categories: [], display_order: 0 });
    setNewSubCategory('');
  };

  const handleCreate = async () => {
    await createCategory.mutateAsync(formData as any);
    setShowCreateDialog(false);
    resetForm();
    refetch();
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    await updateCategory.mutateAsync({ id: editingCategory.id, ...formData } as any);
    setEditingCategory(null);
    resetForm();
    refetch();
  };

  const handleToggleActive = async (category: IncidentCategory) => {
    await updateCategory.mutateAsync({ id: category.id, is_active: !category.is_active });
    refetch();
  };

  const startEdit = (category: IncidentCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      severity_default: category.severity_default,
      sub_categories: category.sub_categories || [],
      display_order: category.display_order,
    });
    setEditingCategory(category);
  };

  const addSubCategory = () => {
    if (newSubCategory.trim() && !formData.sub_categories.includes(newSubCategory.trim())) {
      setFormData(prev => ({ ...prev, sub_categories: [...prev.sub_categories, newSubCategory.trim()] }));
      setNewSubCategory('');
    }
  };

  const removeSubCategory = (sub: string) => {
    setFormData(prev => ({ ...prev, sub_categories: prev.sub_categories.filter(s => s !== sub) }));
  };

  const SEVERITY_COLORS: Record<string, string> = {
    minor: 'bg-slate-100 text-slate-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    serious: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
    emergency: 'bg-red-200 text-red-800',
  };

  const CategoryForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Category Name *</Label>
        <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Ballot Irregularities" />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Brief description of this category" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Default Severity</Label>
          <Select value={formData.severity_default} onValueChange={(v) => setFormData(prev => ({ ...prev, severity_default: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Display Order</Label>
          <Input type="number" value={formData.display_order} onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Sub-Categories</Label>
        <div className="flex gap-2">
          <Input value={newSubCategory} onChange={(e) => setNewSubCategory(e.target.value)} placeholder="Add sub-category" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubCategory())} />
          <Button type="button" variant="outline" size="sm" onClick={addSubCategory}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {formData.sub_categories.map((sub) => (
            <Badge key={sub} variant="secondary" className="cursor-pointer" onClick={() => removeSubCategory(sub)}>
              {sub} ✕
            </Badge>
          ))}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => { setShowCreateDialog(false); setEditingCategory(null); resetForm(); }}>Cancel</Button>
        <Button onClick={onSubmit} disabled={!formData.name || createCategory.isPending || updateCategory.isPending}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Incident Categories
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage election incident classification taxonomy — {categories?.length || 0} categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Incident Category</DialogTitle>
                <DialogDescription>Define a new election incident classification</DialogDescription>
              </DialogHeader>
              <CategoryForm onSubmit={handleCreate} submitLabel="Create Category" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Default Severity</TableHead>
                    <TableHead>Sub-Categories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories?.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="text-center font-mono text-sm">{category.display_order}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{category.description || '—'}</TableCell>
                      <TableCell>
                        <Badge className={SEVERITY_COLORS[category.severity_default] || ''}>
                          {category.severity_default}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {category.sub_categories?.slice(0, 3).map((sub: string) => (
                            <Badge key={sub} variant="outline" className="text-xs">{sub}</Badge>
                          ))}
                          {(category.sub_categories?.length || 0) > 3 && (
                            <Badge variant="secondary" className="text-xs">+{(category.sub_categories?.length || 0) - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch checked={category.is_active} onCheckedChange={() => handleToggleActive(category)} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => startEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => { setEditingCategory(null); resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category: {editingCategory?.name}</DialogTitle>
            <DialogDescription>Update incident category configuration</DialogDescription>
          </DialogHeader>
          <CategoryForm onSubmit={handleUpdate} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
