import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Flag, Copy, Repeat2, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TipDialog } from './TipDialog';
import { FeedComments } from './FeedComments';
import { ReportContentDialog } from './ReportContentDialog';
import { EmojiReactions } from './EmojiReactions';
import { FollowButton } from './FollowButton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SocialFeedProps {
  userId?: string;
  showAll?: boolean;
}

export const SocialFeed = ({ userId, showAll = true }: SocialFeedProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportContent, setReportContent] = useState<any>(null);
  const [postReactions, setPostReactions] = useState<Record<string, Record<string, { count: number; hasReacted: boolean }>>>({});

  // Fetch posts with likes and comments count
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
      const contentIds = content.map(c => c.id);

      // Fetch profiles, likes count, and comments count in parallel
      const [profilesRes, likesRes, commentsRes, userLikesRes] = await Promise.all([
        supabase.from('profiles').select('id, username, display_name, avatar_url, is_creator, creator_tier').in('id', userIds),
        supabase.from('likes').select('content_id').in('content_id', contentIds),
        supabase.from('comments').select('content_id').in('content_id', contentIds),
        user?.id ? supabase.from('likes').select('content_id').eq('user_id', user.id).in('content_id', contentIds) : Promise.resolve({ data: [] })
      ]);

      const likesCount = contentIds.reduce((acc, id) => {
        acc[id] = likesRes.data?.filter(l => l.content_id === id).length || 0;
        return acc;
      }, {} as Record<string, number>);

      const commentsCount = contentIds.reduce((acc, id) => {
        acc[id] = commentsRes.data?.filter(c => c.content_id === id).length || 0;
        return acc;
      }, {} as Record<string, number>);

      const userLikedPosts = new Set(userLikesRes.data?.map(l => l.content_id) || []);

      return content.map(c => ({
        ...c,
        profile: profilesRes.data?.find(p => p.id === c.user_id),
        likesCount: likesCount[c.id] || 0,
        commentsCount: commentsCount[c.id] || 0,
        isLiked: userLikedPosts.has(c.id)
      }));
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      if (isLiked) {
        await supabase.from('likes').delete().eq('content_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert({ content_id: postId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    onError: () => toast.error('Failed to update like'),
  });

  const repostMutation = useMutation({
    mutationFn: async (content: any) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('content').insert({
        user_id: user.id,
        title: `Repost: ${content.title}`,
        description: content.description,
        category: content.category,
        file_url: content.file_url,
        file_type: content.file_type,
        approval_status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      toast.success('Reposted! Content submitted for review.');
    },
    onError: () => toast.error('Failed to repost'),
  });

  const shareMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Use RPC function to atomically increment share count
      const { error } = await supabase.rpc('increment_share_count', { content_id: postId });
      if (error) {
        // Fallback: fetch and update manually
        const { data } = await supabase
          .from('content')
          .select('share_count')
          .eq('id', postId)
          .single();
        if (data) {
          await supabase
            .from('content')
            .update({ share_count: (data.share_count || 0) + 1 })
            .eq('id', postId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });

  const handleLike = (post: any) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    likeMutation.mutate({ postId: post.id, isLiked: post.isLiked });
  };

  const handleShare = (post: any) => {
    const url = `${window.location.origin}/content/${post.id}`;
    navigator.clipboard.writeText(url);
    shareMutation.mutate(post.id);
    toast.success('Link copied to clipboard!');
  };

  const handleReport = (post: any) => {
    if (!user) {
      toast.error('Please login to report content');
      return;
    }
    setReportContent(post);
    setReportDialogOpen(true);
  };

  const handleRepost = (post: any) => {
    if (!user) {
      toast.error('Please login to repost');
      return;
    }
    repostMutation.mutate(post);
  };

  const handleSave = (postId: string) => {
    const newSaved = new Set(savedPosts);
    if (newSaved.has(postId)) {
      newSaved.delete(postId);
      toast.success('Removed from saved');
    } else {
      newSaved.add(postId);
      toast.success('Saved to collection');
    }
    setSavedPosts(newSaved);
  };

  const handleTip = (content: any) => {
    if (!user) {
      toast.error('Please login to tip creators');
      return;
    }
    setSelectedContent(content);
    setTipDialogOpen(true);
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const handlePostReaction = (postId: string, emoji: string) => {
    if (!user) {
      toast.error('Please login to react');
      return;
    }
    
    setPostReactions(prev => {
      const postEmojis = prev[postId] || {};
      const current = postEmojis[emoji] || { count: 0, hasReacted: false };
      
      return {
        ...prev,
        [postId]: {
          ...postEmojis,
          [emoji]: {
            count: current.hasReacted ? current.count - 1 : current.count + 1,
            hasReacted: !current.hasReacted
          }
        }
      };
    });
  };

  const getPostReactions = (postId: string) => {
    const reactions = postReactions[postId] || {};
    return Object.entries(reactions).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      hasReacted: data.hasReacted
    }));
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
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={post.profile?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {post.profile?.display_name?.[0] || post.profile?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">
                        {post.profile?.display_name || post.profile?.username || 'Anonymous'}
                      </span>
                      {post.profile?.is_creator && (
                        <Badge className={cn("text-xs shrink-0", getCreatorBadge(post.profile.creator_tier).className)}>
                          {getCreatorBadge(post.profile.creator_tier).label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                      {post.profile?.username && (
                        <span className="text-sm text-muted-foreground">@{post.profile.username}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <FollowButton userId={post.user_id} size="sm" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShare(post)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRepost(post)}>
                          <Repeat2 className="h-4 w-4 mr-2" />
                          Repost
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleReport(post)} className="text-destructive">
                          <Flag className="h-4 w-4 mr-2" />
                          Report Content
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {post.file_type?.startsWith('image') && (
                    <div className="relative w-full max-h-[300px] sm:max-h-[350px] md:max-h-[400px] overflow-hidden bg-muted">
                      <img
                        src={post.file_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  {post.file_type?.startsWith('video') && (
                    <div className="relative w-full max-h-[300px] sm:max-h-[350px] md:max-h-[400px] bg-black">
                      <video
                        src={post.file_url}
                        className="w-full h-full object-contain"
                        controls
                        preload="metadata"
                        playsInline
                        controlsList="nodownload"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}
                  {post.file_type?.startsWith('audio') && (
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
                      <audio 
                        src={post.file_url} 
                        controls 
                        className="w-full" 
                        preload="metadata"
                      />
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2">{post.title}</h3>
                    {post.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">{post.description}</p>
                    )}
                    <Badge variant="secondary" className="mt-2 sm:mt-3 text-xs">
                      {post.category}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="border-t p-2 sm:p-3 flex-col gap-2">
                  <div className="flex items-center justify-between w-full flex-wrap gap-1">
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post)}
                        className={cn("h-8 px-2 sm:px-3", post.isLiked && "text-red-500")}
                        disabled={likeMutation.isPending}
                      >
                        <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", post.isLiked && "fill-current")} />
                        <span className="ml-1 text-xs sm:text-sm">{post.likesCount}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleComments(post.id)}
                        className={cn("h-8 px-2 sm:px-3", expandedComments.has(post.id) && "text-primary")}
                      >
                        <MessageCircle className={cn("h-4 w-4 sm:h-5 sm:w-5", expandedComments.has(post.id) && "fill-current")} />
                        <span className="ml-1 text-xs sm:text-sm">{post.commentsCount}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRepost(post)}
                        disabled={repostMutation.isPending}
                        className="h-8 px-2 sm:px-3"
                      >
                        <Repeat2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="ml-1 text-xs sm:text-sm hidden sm:inline">Repost</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleShare(post)}
                        className="h-8 px-2 sm:px-3"
                      >
                        <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="ml-1 text-xs sm:text-sm hidden sm:inline">{post.share_count || 0}</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {/* Emoji Reactions */}
                      <EmojiReactions
                        reactions={getPostReactions(post.id)}
                        onReact={(emoji) => handlePostReaction(post.id, emoji)}
                        size="sm"
                      />
                      {post.profile?.is_creator && user?.id !== post.user_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTip(post)}
                          className="h-8 px-2 sm:px-3 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          <DollarSign className="h-4 w-4" />
                          <span className="ml-1 text-xs sm:text-sm hidden sm:inline">Tip</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave(post.id)}
                        className={cn("h-8 w-8", savedPosts.has(post.id) && "text-primary")}
                      >
                        <Bookmark className={cn("h-4 w-4 sm:h-5 sm:w-5", savedPosts.has(post.id) && "fill-current")} />
                      </Button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <FeedComments 
                    contentId={post.id} 
                    isExpanded={expandedComments.has(post.id)} 
                  />
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

      {reportContent && (
        <ReportContentDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          contentId={reportContent.id}
          contentTitle={reportContent.title}
        />
      )}
    </>
  );
};
