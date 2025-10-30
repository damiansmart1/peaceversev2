import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Share, Volume2, Eye, Sparkles, User } from "lucide-react";
import ShareDialog from "@/components/ShareDialog";
import SafeHTML from "@/components/SafeHTML";
import { formatDistanceToNow } from "date-fns";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  view_count: number;
  like_count: number;
  created_at: string;
  user_id: string;
  comments: Comment[];
  user_liked: boolean;
}

interface Comment {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
}

const ContentFeed = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
    
    // Set up real-time subscription for new content
    const channel = supabase
      .channel('content-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'content' },
        () => fetchContent()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        () => fetchContent()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'likes' },
        () => fetchContent()
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'likes' },
        () => fetchContent()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch content with comments and like status
      const { data: contentData, error } = await supabase
        .from('content')
        .select(`
          *,
          comments:comments(id, text, created_at, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each content item, check if current user liked it
      const contentWithLikes = await Promise.all(
        (contentData || []).map(async (item) => {
          let user_liked = false;
          
          if (user) {
            const { data: likeData } = await supabase
              .from('likes')
              .select('id')
              .eq('content_id', item.id)
              .eq('user_id', user.id)
              .single();
            
            user_liked = !!likeData;
          }

          return {
            ...item,
            user_liked,
            comments: item.comments || []
          };
        })
      );

      setContent(contentWithLikes);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like content",
        variant: "destructive",
      });
      return;
    }

    const contentItem = content.find(item => item.id === contentId);
    if (!contentItem) return;

    try {
      if (contentItem.user_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('content_id', contentId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({ content_id: contentId, user_id: user.id });
      }

      // Update local state
      setContent(prev => prev.map(item => 
        item.id === contentId 
          ? { 
              ...item, 
              user_liked: !item.user_liked,
              like_count: item.user_liked ? item.like_count - 1 : item.like_count + 1
            }
          : item
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (contentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    const commentText = commentTexts[contentId]?.trim();
    if (!commentText) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content_id: contentId,
          user_id: user.id,
          text: commentText
        });

      if (error) throw error;

      // Clear comment input
      setCommentTexts(prev => ({ ...prev, [contentId]: '' }));
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-primary/10 text-primary border-primary/20';
      case 'image': return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'audio': return 'bg-secondary/30 text-secondary-foreground border-secondary/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const renderMediaPlayer = (item: ContentItem) => {
    if (item.file_type === 'video') {
      return (
        <div className="relative group overflow-hidden rounded-xl">
          <video
            controls
            className="w-full aspect-video object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            poster=""
          >
            <source src={item.file_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      );
    } else if (item.file_type === 'image') {
      return (
        <div className="relative group overflow-hidden rounded-xl">
          <img
            src={item.file_url}
            alt={item.title}
            className="w-full aspect-video object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      );
    } else if (item.file_type === 'audio') {
      return (
        <div className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 p-8 rounded-xl border border-border/50 backdrop-blur-sm">
          <div className="absolute top-4 right-4">
            <Sparkles className="w-6 h-6 text-primary/40 animate-pulse" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Volume2 className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">Audio Story</p>
            </div>
          </div>
          <audio controls className="w-full">
            <source src={item.file_url} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading inspiring stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {content.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No Stories Yet</h3>
          <p className="text-muted-foreground text-lg mb-4">Be the first to share your voice!</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Share your story, inspire others, and be part of building peace in our community.
          </p>
        </div>
      ) : (
        content.map((item, index) => (
          <Card 
            key={item.id} 
            className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-[var(--shadow-elevated)] animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-0">
              {/* Header with user info */}
              <div className="p-6 pb-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">Peace Storyteller</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                        <span className="text-muted-foreground/50">•</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {item.view_count}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={getCategoryColor(item.file_type)}>
                    {item.file_type.charAt(0).toUpperCase() + item.file_type.slice(1)}
                  </Badge>
                </div>

                {/* Title and description */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xl text-foreground leading-tight hover-scale cursor-default">
                    {item.title}
                  </h3>
                  {item.description && (
                    <SafeHTML 
                      html={item.description}
                      className="text-muted-foreground leading-relaxed prose-content"
                    />
                  )}
                </div>
              </div>

              {/* Media content */}
              <div className="px-6 pb-4">
                {renderMediaPlayer(item)}
              </div>

              {/* Engagement metrics bar */}
              <div className="px-6 py-4 bg-muted/30 backdrop-blur-sm border-y border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Heart className={`w-4 h-4 ${item.like_count > 0 ? 'text-red-500' : ''}`} />
                      <span className="font-medium">{item.like_count}</span>
                      <span className="hidden sm:inline">
                        {item.like_count === 1 ? 'like' : 'likes'}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-medium">{item.comments.length}</span>
                      <span className="hidden sm:inline">
                        {item.comments.length === 1 ? 'comment' : 'comments'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 py-3 flex items-center gap-2 border-b border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(item.id)}
                  className={`flex-1 transition-colors ${
                    item.user_liked 
                      ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' 
                      : 'hover:bg-primary/5'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 transition-transform hover:scale-110 ${item.user_liked ? 'fill-current' : ''}`} />
                  {item.user_liked ? 'Liked' : 'Like'}
                </Button>

                <Button variant="ghost" size="sm" className="flex-1 hover:bg-accent/10">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comment
                </Button>

                <ShareDialog audioUrl={item.file_url}>
                  <Button variant="ghost" size="sm" className="flex-1 hover:bg-secondary/20">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </ShareDialog>
              </div>

              {/* Comments section */}
              <div className="px-6 py-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
                {item.comments.length > 0 && (
                  <div className="space-y-3">
                    {item.comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/30 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 ring-1 ring-border/50">
                            <AvatarFallback className="bg-muted text-xs">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground mb-1">Community Member</p>
                            <p className="text-sm text-foreground/90 leading-relaxed">{comment.text}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment */}
                <div className="flex gap-2 pt-2">
                  <Avatar className="h-9 w-9 ring-1 ring-border/50">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Share your thoughts..."
                      value={commentTexts[item.id] || ''}
                      onChange={(e) => setCommentTexts(prev => ({ 
                        ...prev, 
                        [item.id]: e.target.value 
                      }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment(item.id);
                        }
                      }}
                      className="flex-1 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    />
                    <Button 
                      size="sm"
                      onClick={() => handleComment(item.id)}
                      disabled={!commentTexts[item.id]?.trim()}
                      className="px-6"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ContentFeed;