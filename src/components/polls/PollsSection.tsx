import { useState } from 'react';
import { usePolls, useFeaturedPolls } from '@/hooks/usePolls';
import { PollCard } from './PollCard';
import { CreatePollDialog } from './CreatePollDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, Clock, Vote, Search,
  Filter, Sparkles, Users, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'governance', label: 'Governance' },
  { value: 'community', label: 'Community' },
  { value: 'safety', label: 'Safety' },
  { value: 'environment', label: 'Environment' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'general', label: 'General' },
];

export const PollsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'ending'>('recent');
  
  const { data: polls, isLoading } = usePolls(selectedCategory);
  const { data: featuredPolls } = useFeaturedPolls();

  // Filter and sort polls
  const filteredPolls = (polls || [])
    .filter(poll => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        poll.title.toLowerCase().includes(query) ||
        poll.description?.toLowerCase().includes(query) ||
        poll.category.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.total_participants - a.total_participants;
        case 'ending':
          if (!a.ends_at && !b.ends_at) return 0;
          if (!a.ends_at) return 1;
          if (!b.ends_at) return -1;
          return new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime();
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const activePolls = filteredPolls.filter(p => p.is_active && (!p.ends_at || new Date(p.ends_at) > new Date()));
  const closedPolls = filteredPolls.filter(p => !p.is_active || (p.ends_at && new Date(p.ends_at) <= new Date()));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Vote className="w-6 h-6 text-primary" />
            Community Polls
          </h2>
          <p className="text-muted-foreground mt-1">
            Voice your opinion and see what the community thinks
          </p>
        </div>
        <CreatePollDialog />
      </div>

      {/* Featured Polls */}
      {featuredPolls && featuredPolls.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Featured Polls</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPolls.map((poll) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PollCard poll={poll} compact />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Vote className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{polls?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Polls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePolls.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {polls?.reduce((sum, p) => sum + p.total_participants, 0) || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Votes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {polls?.reduce((sum, p) => sum + p.total_votes, 0) || 0}
                </p>
                <p className="text-xs text-muted-foreground">Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="ending">Ending Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Polls List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Active ({activePolls.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="gap-2">
            <Clock className="w-4 h-4" />
            Closed ({closedPolls.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <PollsLoadingSkeleton />
          ) : activePolls.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {activePolls.map((poll, index) => (
                  <motion.div
                    key={poll.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PollCard poll={poll} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState 
              title="No active polls"
              description="Be the first to create a poll and engage the community!"
            />
          )}
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          {closedPolls.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {closedPolls.map((poll, index) => (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PollCard poll={poll} showFullResults />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No closed polls"
              description="Completed polls will appear here"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PollsLoadingSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <Card className="p-12 text-center">
    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <Vote className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    <CreatePollDialog />
  </Card>
);

export default PollsSection;
