import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Podcast, Play, Pause, Clock, Calendar, Download, 
  Search, BookmarkPlus, Share2, Heart, Headphones 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  category: string;
  plays: number;
  isLiked: boolean;
  isSaved: boolean;
  imageUrl?: string;
}

const MOCK_EPISODES: PodcastEpisode[] = [
  {
    id: '1',
    title: 'Peace Building in East Africa',
    description: 'A deep dive into community-led peace initiatives across the region.',
    duration: '45:30',
    date: '2024-12-01',
    category: 'Peace Stories',
    plays: 1234,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    title: 'Youth Voices for Change',
    description: 'Young leaders share their experiences in conflict resolution.',
    duration: '32:15',
    date: '2024-11-28',
    category: 'Interviews',
    plays: 856,
    isLiked: true,
    isSaved: true,
  },
  {
    id: '3',
    title: 'Weekly Peace Pulse Update',
    description: 'Your weekly roundup of peace metrics and community updates.',
    duration: '18:45',
    date: '2024-11-25',
    category: 'Updates',
    plays: 2341,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '4',
    title: 'Traditional Conflict Resolution Methods',
    description: 'Exploring indigenous approaches to maintaining community harmony.',
    duration: '52:00',
    date: '2024-11-22',
    category: 'Culture',
    plays: 567,
    isLiked: false,
    isSaved: true,
  },
  {
    id: '5',
    title: 'Women in Peacebuilding',
    description: 'Celebrating the role of women in creating lasting peace.',
    duration: '38:20',
    date: '2024-11-20',
    category: 'Peace Stories',
    plays: 1089,
    isLiked: true,
    isSaved: false,
  },
];

const CATEGORIES = ['All', 'Peace Stories', 'Interviews', 'Updates', 'Culture'];

const PodcastLibrary = () => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>(MOCK_EPISODES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch = episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         episode.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || episode.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const togglePlay = (id: string) => {
    setCurrentlyPlaying(currentlyPlaying === id ? null : id);
  };

  const toggleLike = (id: string) => {
    setEpisodes(prev => prev.map(ep => 
      ep.id === id ? { ...ep, isLiked: !ep.isLiked } : ep
    ));
  };

  const toggleSave = (id: string) => {
    setEpisodes(prev => prev.map(ep => 
      ep.id === id ? { ...ep, isSaved: !ep.isSaved } : ep
    ));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Podcast className="w-5 h-5 text-primary" />
          Podcast & Recording Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search episodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Episodes</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <EpisodeList 
              episodes={filteredEpisodes}
              currentlyPlaying={currentlyPlaying}
              onTogglePlay={togglePlay}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <EpisodeList 
              episodes={filteredEpisodes.filter(ep => ep.isSaved)}
              currentlyPlaying={currentlyPlaying}
              onTogglePlay={togglePlay}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="liked" className="mt-4">
            <EpisodeList 
              episodes={filteredEpisodes.filter(ep => ep.isLiked)}
              currentlyPlaying={currentlyPlaying}
              onTogglePlay={togglePlay}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface EpisodeListProps {
  episodes: PodcastEpisode[];
  currentlyPlaying: string | null;
  onTogglePlay: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  formatDate: (date: string) => string;
}

const EpisodeList = ({ 
  episodes, 
  currentlyPlaying, 
  onTogglePlay, 
  onToggleLike, 
  onToggleSave,
  formatDate 
}: EpisodeListProps) => {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Podcast className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No episodes found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 pr-4">
        {episodes.map((episode, index) => (
          <motion.div
            key={episode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-lg border transition-all hover:shadow-md ${
              currentlyPlaying === episode.id ? 'bg-primary/5 border-primary' : 'bg-card'
            }`}
          >
            <div className="flex gap-4">
              {/* Play Button */}
              <Button
                variant={currentlyPlaying === episode.id ? "default" : "outline"}
                size="icon"
                className="shrink-0 h-12 w-12 rounded-full"
                onClick={() => onTogglePlay(episode.id)}
              >
                {currentlyPlaying === episode.id ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-foreground line-clamp-1">
                      {episode.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {episode.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {episode.category}
                  </Badge>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {episode.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(episode.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    {episode.plays.toLocaleString()} plays
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={episode.isLiked ? 'text-red-500' : ''}
                    onClick={() => onToggleLike(episode.id)}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${episode.isLiked ? 'fill-current' : ''}`} />
                    Like
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={episode.isSaved ? 'text-primary' : ''}
                    onClick={() => onToggleSave(episode.id)}
                  >
                    <BookmarkPlus className={`w-4 h-4 mr-1 ${episode.isSaved ? 'fill-current' : ''}`} />
                    Save
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PodcastLibrary;
