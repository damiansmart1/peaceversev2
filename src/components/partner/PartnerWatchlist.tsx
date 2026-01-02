import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  Plus, 
  Trash2, 
  Bell, 
  MapPin, 
  Tag,
  AlertTriangle,
  Settings2,
  Globe,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface WatchlistItem {
  id: string;
  type: 'region' | 'category' | 'keyword';
  value: string;
  country?: string;
  alertThreshold: number;
  severities: string[];
  notifyEmail: boolean;
  notifyPush: boolean;
  createdAt: Date;
  matchCount: number;
}

const CATEGORIES = [
  'Violence',
  'Conflict',
  'Political Unrest',
  'Natural Disaster',
  'Humanitarian',
  'Health Crisis',
  'Economic',
  'Environmental',
];

const SEVERITIES = ['critical', 'high', 'medium', 'low'];

export const PartnerWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<WatchlistItem>>({
    type: 'region',
    value: '',
    alertThreshold: 5,
    severities: ['critical', 'high'],
    notifyEmail: true,
    notifyPush: true,
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('partner-watchlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWatchlist(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })));
      } catch (e) {
        console.error('Failed to parse watchlist:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('partner-watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const handleAddItem = () => {
    if (!newItem.value) {
      toast.error('Please enter a value');
      return;
    }

    const item: WatchlistItem = {
      id: crypto.randomUUID(),
      type: newItem.type as 'region' | 'category' | 'keyword',
      value: newItem.value,
      country: newItem.country,
      alertThreshold: newItem.alertThreshold || 5,
      severities: newItem.severities || ['critical', 'high'],
      notifyEmail: newItem.notifyEmail ?? true,
      notifyPush: newItem.notifyPush ?? true,
      createdAt: new Date(),
      matchCount: 0,
    };

    setWatchlist((prev) => [...prev, item]);
    setNewItem({
      type: 'region',
      value: '',
      alertThreshold: 5,
      severities: ['critical', 'high'],
      notifyEmail: true,
      notifyPush: true,
    });
    setIsDialogOpen(false);
    toast.success('Watchlist item added');
  };

  const handleRemoveItem = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
    toast.success('Item removed from watchlist');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'region': return <MapPin className="w-4 h-4" />;
      case 'category': return <Tag className="w-4 h-4" />;
      case 'keyword': return <Target className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'region': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'category': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'keyword': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
              <CardDescription className="text-xs">
                Monitor specific regions, categories, or keywords
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Add to Watchlist
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(value) => setNewItem((prev) => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="region">Region/Country</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="keyword">Keyword</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {newItem.type === 'region' ? 'Region Name' : 
                     newItem.type === 'category' ? 'Category' : 'Keyword'}
                  </Label>
                  {newItem.type === 'category' ? (
                    <Select
                      value={newItem.value}
                      onValueChange={(value) => setNewItem((prev) => ({ ...prev, value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder={newItem.type === 'region' ? 'e.g., Nairobi' : 'e.g., election'}
                      value={newItem.value}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, value: e.target.value }))}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Alert Threshold (incidents per day)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[newItem.alertThreshold || 5]}
                      onValueChange={([value]) => setNewItem((prev) => ({ ...prev, alertThreshold: value }))}
                      min={1}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{newItem.alertThreshold}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Severity Levels</Label>
                  <div className="flex flex-wrap gap-2">
                    {SEVERITIES.map((sev) => (
                      <label key={sev} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={newItem.severities?.includes(sev)}
                          onCheckedChange={(checked) => {
                            setNewItem((prev) => ({
                              ...prev,
                              severities: checked
                                ? [...(prev.severities || []), sev]
                                : (prev.severities || []).filter((s) => s !== sev),
                            }));
                          }}
                        />
                        <span className="capitalize">{sev}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notifications</Label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={newItem.notifyPush}
                        onCheckedChange={(checked) => setNewItem((prev) => ({ ...prev, notifyPush: !!checked }))}
                      />
                      Push notifications
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={newItem.notifyEmail}
                        onCheckedChange={(checked) => setNewItem((prev) => ({ ...prev, notifyEmail: !!checked }))}
                      />
                      Email alerts
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>
                  Add to Watchlist
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-4 pt-0 space-y-2">
            {watchlist.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.value}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {item.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Alert: {item.alertThreshold}+ incidents
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 mr-2">
                      {item.notifyPush && <Bell className="w-3 h-3 text-primary" />}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {item.severities.map((sev) => (
                    <Badge
                      key={sev}
                      variant="outline"
                      className={`text-[10px] ${
                        sev === 'critical' ? 'border-red-500/30 text-red-500' :
                        sev === 'high' ? 'border-orange-500/30 text-orange-500' :
                        sev === 'medium' ? 'border-yellow-500/30 text-yellow-500' :
                        'border-green-500/30 text-green-500'
                      }`}
                    >
                      {sev}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            
            {watchlist.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Eye className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No items in watchlist</p>
                <p className="text-xs">Add regions or categories to monitor</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
