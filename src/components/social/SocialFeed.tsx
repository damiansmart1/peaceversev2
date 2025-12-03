import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Play, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TipDialog } from './TipDialog';
import { cn } from '@/lib/utils';

interface SocialFeedProps {
  userId?: string;
  showAll?: boolean;
}

export const SocialFeed = ({ userId, showAll = true }: SocialFeedProps) => {
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['social-feed', userId],
    queryFn: async () => {
      let query = supabase
        .from('content')
        .select('*')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: content } = await query;
      if (!content || content.length === 0) return [];

      const userIds = [...new Set(content.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_creator, creator_tier')
        .in('id', userIds);

      return content.map(c => ({
        ...c,
        profile: profiles?.find(p => p.id === c.user_id)
      }));
    },
  });

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
      await supabase.from('likes').delete().eq('content_id', postId).eq('user_id', user.id);
    } else {
      newLiked.add(postId);
      await supabase.from('likes').insert({ content_id: postId, user_id: user.id });
    }
    setLikedPosts(newLiked);
  };

  const handleSave = (postId: string) => {
    const newSaved = new Set(savedPosts);
    if (newSaved.has(postId)) {
      newSaved.delete(postId);
    } else {
      newSaved.add(postId);
    }
    setSavedPosts(newSaved);
  };

  const handleTip = (content: any) => {
    setSelectedContent(content);
    setTipDialogOpen(true);
  };

  const getCreatorBadge = (tier: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      starter: { label: 'Creator', className: 'bg-muted text-muted-foreground' },
      bronze: { label: 'Bronze Creator', className: 'bg-amber-100 text-amber-800' },
      silver: { label: 'Silver Creator', className: 'bg-slate-200 text-slate-800' },
      gold: { label: 'Gold Creator', className: 'bg-yellow-100 text-yellow-800' },
      platinum: { label: 'Platinum Creator', className: 'bg-purple-100 text-purple-800' },
    };
    return badges[tier] || badges.starter;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={post.profile?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {post.profile?.display_name?.[0] || post.profile?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {post.profile?.display_name || post.profile?.username || 'Anonymous'}
                      </span>
                      {post.profile?.is_creator && (
                        <Badge className={cn("text-xs", getCreatorBadge(post.profile.creator_tier).className)}>
                          {getCreatorBadge(post.profile.creator_tier).label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </CardHeader>

                <CardContent className="p-0">
                  {post.file_type?.startsWith('image') && (
                    <div className="relative aspect-square bg-muted">
                      <img
                        src={post.file_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {post.file_type?.startsWith('video') && (
                    <div className="relative aspect-video bg-black">
                      <video
                        src={post.file_url}
                        className="w-full h-full object-contain"
                        controls
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 rounded-full p-4">
                          <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {post.file_type?.startsWith('audio') && (
                    <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
                      <audio src={post.file_url} controls className="w-full" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                    {post.description && (
                      <p className="text-muted-foreground line-clamp-3">{post.description}</p>
                    )}
                    <Badge variant="secondary" className="mt-3">
                      {post.category}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="border-t p-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={cn(likedPosts.has(post.id) && "text-red-500")}
                      >
                        <Heart className={cn("h-5 w-5 mr-1", likedPosts.has(post.id) && "fill-current")} />
                        {post.like_count + (likedPosts.has(post.id) ? 1 : 0)}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-5 w-5 mr-1" />
                        Comment
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-5 w-5 mr-1" />
                        {post.share_count}
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      {post.profile?.is_creator && user?.id !== post.user_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTip(post)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Tip
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave(post.id)}
                        className={cn(savedPosts.has(post.id) && "text-primary")}
                      >
                        <Bookmark className={cn("h-5 w-5", savedPosts.has(post.id) && "fill-current")} />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <TipDialog
        open={tipDialogOpen}
        onOpenChange={setTipDialogOpen}
        content={selectedContent}
      />
    </>
  );
};
