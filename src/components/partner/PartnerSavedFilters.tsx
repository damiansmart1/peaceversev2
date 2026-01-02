import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Play,
  Clock,
  Filter,
  Calendar,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SavedFilter {
  id: string;
  name: string;
  datePreset: string;
  countryFilter: string;
  searchQuery: string;
  createdAt: Date;
  lastUsed: Date | null;
  useCount: number;
}

interface PartnerSavedFiltersProps {
  currentFilters: {
    datePreset: string;
    countryFilter: string;
    searchQuery: string;
  };
  onApplyFilter: (filter: { datePreset: string; countryFilter: string; searchQuery: string }) => void;
}

export const PartnerSavedFilters = ({ currentFilters, onApplyFilter }: PartnerSavedFiltersProps) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('partner-saved-filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedFilters(parsed.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt),
          lastUsed: f.lastUsed ? new Date(f.lastUsed) : null,
        })));
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (savedFilters.length > 0) {
      localStorage.setItem('partner-saved-filters', JSON.stringify(savedFilters));
    }
  }, [savedFilters]);

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error('Please enter a filter name');
      return;
    }

    const filter: SavedFilter = {
      id: crypto.randomUUID(),
      name: filterName.trim(),
      datePreset: currentFilters.datePreset,
      countryFilter: currentFilters.countryFilter,
      searchQuery: currentFilters.searchQuery,
      createdAt: new Date(),
      lastUsed: null,
      useCount: 0,
    };

    setSavedFilters((prev) => [...prev, filter]);
    setFilterName('');
    setIsDialogOpen(false);
    toast.success('Filter saved successfully');
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    onApplyFilter({
      datePreset: filter.datePreset,
      countryFilter: filter.countryFilter,
      searchQuery: filter.searchQuery,
    });

    // Update usage stats
    setSavedFilters((prev) =>
      prev.map((f) =>
        f.id === filter.id
          ? { ...f, lastUsed: new Date(), useCount: f.useCount + 1 }
          : f
      )
    );

    toast.success(`Applied filter: ${filter.name}`);
  };

  const handleDeleteFilter = (id: string) => {
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));
    toast.success('Filter deleted');
  };

  const getDatePresetLabel = (preset: string) => {
    const labels: Record<string, string> = {
      '7d': '7 Days',
      '30d': '30 Days',
      '90d': '90 Days',
      '6m': '6 Months',
      '1y': '1 Year',
      'all': 'All Time',
    };
    return labels[preset] || preset;
  };

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-medium">Saved Filters</CardTitle>
              <CardDescription className="text-xs">
                Quick access to frequently used filter combinations
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8">
                <Plus className="w-4 h-4 mr-1" />
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5" />
                  Save Current Filter
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Filter Name</Label>
                  <Input
                    placeholder="e.g., Kenya Critical Last Week"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </div>

                <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                  <p className="font-medium text-xs text-muted-foreground">Current Filter Settings:</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{getDatePresetLabel(currentFilters.datePreset)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{currentFilters.countryFilter === 'all' ? 'All Countries' : currentFilters.countryFilter}</span>
                  </div>
                  {currentFilters.searchQuery && (
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Search: "{currentFilters.searchQuery}"</span>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveFilter}>
                  Save Filter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[200px]">
          <div className="p-4 pt-0 space-y-2">
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{filter.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">
                        {getDatePresetLabel(filter.datePreset)}
                      </Badge>
                      {filter.countryFilter !== 'all' && (
                        <Badge variant="outline" className="text-[10px]">
                          {filter.countryFilter}
                        </Badge>
                      )}
                      {filter.searchQuery && (
                        <Badge variant="secondary" className="text-[10px]">
                          "{filter.searchQuery}"
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => handleApplyFilter(filter)}
                    >
                      <Play className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteFilter(filter.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Created {format(filter.createdAt, 'MMM d')}
                  </span>
                  {filter.lastUsed && (
                    <span>Last used {format(filter.lastUsed, 'MMM d')}</span>
                  )}
                  <span>Used {filter.useCount}×</span>
                </div>
              </div>
            ))}
            
            {savedFilters.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bookmark className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No saved filters</p>
                <p className="text-xs">Save your current filter settings for quick access</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
