import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, FileText, Users, Radio as RadioIcon, Award, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'proposal' | 'community' | 'challenge' | 'page';
  path: string;
  icon: typeof FileText;
}

const mockResults: SearchResult[] = [
  { id: '1', title: 'Voice Stories', description: 'Share your story through voice', type: 'page', path: '/voice', icon: FileText },
  { id: '2', title: 'Community Spaces', description: 'Find safe spaces near you', type: 'page', path: '/community', icon: Users },
  { id: '3', title: 'Peace Radio', description: 'Listen to community radio', type: 'page', path: '/radio', icon: RadioIcon },
  { id: '4', title: 'Challenges', description: 'Complete challenges and earn rewards', type: 'page', path: '/challenges', icon: Award },
  { id: '5', title: 'Safety & Trust', description: 'Learn about our safety features', type: 'page', path: '/safety', icon: Shield },
];

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filteredResults = mockResults.filter(
    (result) =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <Input
            placeholder="Search for features, pages, or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        
        <ScrollArea className="max-h-96">
          {filteredResults.length > 0 ? (
            <div className="p-2">
              {filteredResults.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result.path)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>Start typing to search...</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
