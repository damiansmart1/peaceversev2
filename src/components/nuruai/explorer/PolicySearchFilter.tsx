import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

interface PolicySearchFilterProps {
  topics: string[];
  activeTopics: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleTopic: (topic: string) => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
}

const PolicySearchFilter = ({
  topics, activeTopics, searchQuery, onSearchChange, onToggleTopic, onClearFilters, resultCount, totalCount,
}: PolicySearchFilterProps) => {
  const hasFilters = searchQuery || activeTopics.length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search within sections..."
          className="pl-9 pr-9 h-9 text-xs"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
          {topics.slice(0, 10).map(topic => (
            <Badge
              key={topic}
              variant={activeTopics.includes(topic) ? 'default' : 'outline'}
              className="text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onToggleTopic(topic)}
            >
              {topic}
            </Badge>
          ))}
        </div>
      )}

      {hasFilters && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            Showing {resultCount} of {totalCount} sections
          </span>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default PolicySearchFilter;
