import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  FileText, 
  Video, 
  Headphones,
  Search 
} from 'lucide-react';
import { useState } from 'react';

const resources = [
  {
    id: '1',
    title: 'Digital Safety Guide for Youth',
    description: 'Complete guide on staying safe online and protecting your privacy',
    type: 'PDF',
    icon: FileText,
    category: 'Safety',
    downloads: 1234,
    language: 'English',
  },
  {
    id: '2',
    title: 'Conflict Resolution Workshop',
    description: 'Video series on peaceful conflict resolution techniques',
    type: 'Video',
    icon: Video,
    category: 'Training',
    downloads: 856,
    language: 'Multi',
  },
  {
    id: '3',
    title: 'Mental Health Support Podcast',
    description: 'Weekly podcast discussing mental health and wellbeing',
    type: 'Audio',
    icon: Headphones,
    category: 'Wellness',
    downloads: 2341,
    language: 'Swahili',
  },
  {
    id: '4',
    title: 'Community Guidelines Handbook',
    description: 'Detailed handbook on platform rules and community standards',
    type: 'PDF',
    icon: FileText,
    category: 'Guidelines',
    downloads: 3421,
    language: 'English',
  },
];

const typeColors: Record<string, string> = {
  PDF: 'bg-red-500/10 text-red-500',
  Video: 'bg-blue-500/10 text-blue-500',
  Audio: 'bg-purple-500/10 text-purple-500',
};

export const SafetyResourceLibrary = () => {
  const [search, setSearch] = useState('');

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Resource Library</h2>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card key={resource.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-lg ${typeColors[resource.type]} shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {resource.title}
                      </h3>
                      <Badge variant="outline" className="shrink-0">{resource.type}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{resource.category}</Badge>
                        <span>•</span>
                        <span>{resource.downloads} downloads</span>
                        <span>•</span>
                        <span>{resource.language}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
