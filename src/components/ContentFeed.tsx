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
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
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

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Volume2 className="w-5 h-5" />;
      case 'image': return <Eye className="w-5 h-5" />;
      case 'audio': return <Volume2 className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getThumbnail = (item: ContentItem) => {
    if (item.file_type === 'image') {
      return (
        <img
          src={item.file_url}
          alt={item.title}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      );
    }
    
    return (
      <div className={`w-full h-full flex items-center justify-center ${
        item.file_type === 'video' ? 'bg-gradient-to-br from-primary/20 to-primary/5' :
        item.file_type === 'audio' ? 'bg-gradient-to-br from-accent/20 to-accent/5' :
        'bg-gradient-to-br from-muted to-muted/50'
      }`}>
        <div className="text-center space-y-2">
          {getMediaIcon(item.file_type)}
          <p className="text-xs font-medium capitalize">{item.file_type}</p>
        </div>
      </div>
    );
  };

  const getExcerpt = (html: string, maxLength: number = 150) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const renderFullContent = (item: ContentItem) => {
    if (item.file_type === 'video') {
      return (
        <div className="relative group overflow-hidden rounded-xl bg-muted/20">
          <video
            controls
            className="w-full max-h-[600px] object-contain rounded-xl"
            preload="metadata"
          >
            <source src={item.file_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (item.file_type === 'image') {
      return (
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={item.file_url}
            alt={item.title}
            className="w-full max-h-[600px] object-contain rounded-xl bg-muted/20"
            loading="lazy"
          />
        </div>
      );
    } else if (item.file_type === 'audio') {
      return (
        <div className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 p-8 rounded-xl border border-border/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Volume2 className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">Audio Story</p>
            </div>
          </div>
          <audio controls className="w-full" preload="metadata">
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
    <div className="space-y-4">
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
        content.map((item, index) => {
          const isExpanded = expandedContent === item.id;
          
          return (
            <Card 
              key={item.id} 
              className="overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-0">
                <div className={`grid ${isExpanded ? 'grid-cols-1' : 'md:grid-cols-[200px_1fr]'} gap-0`}>
                  {/* Thumbnail/Media Preview */}
                  {!isExpanded && (
                    <div 
                      className="relative h-48 md:h-auto overflow-hidden bg-muted/30 cursor-pointer group"
                      onClick={() => setExpandedContent(item.id)}
                    >
                      {getThumbnail(item)}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="secondary" className="shadow-lg">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Story
                        </Button>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`absolute top-3 right-3 ${getCategoryColor(item.file_type)}`}
                      >
                        {item.file_type}
                      </Badge>
                    </div>
                  )}

                  {/* Content Preview/Full */}
                  <div className="p-5 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 ring-1 ring-primary/10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">Peace Storyteller</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.view_count}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <Badge variant="outline" className={getCategoryColor(item.file_type)}>
                          {item.file_type}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 
                      className="font-bold text-lg text-foreground leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2"
                      onClick={() => setExpandedContent(isExpanded ? null : item.id)}
                    >
                      {item.title}
                    </h3>

                    {/* Description Preview or Full */}
                    {item.description && (
                      <div className={isExpanded ? '' : 'line-clamp-2'}>
                        <SafeHTML 
                          html={isExpanded ? item.description : getExcerpt(item.description)}
                          className="text-sm text-muted-foreground leading-relaxed prose-content"
                        />
                      </div>
                    )}

                    {/* Full Media (when expanded) */}
                    {isExpanded && (
                      <div className="pt-2">
                        {renderFullContent(item)}
                      </div>
                    )}

                    {/* Engagement Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button
                          onClick={() => handleLike(item.id)}
                          className={`flex items-center gap-1.5 hover:text-primary transition-colors ${
                            item.user_liked ? 'text-red-500' : ''
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${item.user_liked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{item.like_count}</span>
                        </button>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{item.comments.length}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ShareDialog audioUrl={item.file_url}>
                          <Button variant="ghost" size="sm" className="h-8">
                            <Share className="w-4 h-4" />
                          </Button>
                        </ShareDialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setExpandedContent(isExpanded ? null : item.id)}
                          className="h-8 text-primary hover:text-primary"
                        >
                          {isExpanded ? 'Show Less' : 'Read More'}
                        </Button>
                      </div>
                    </div>

                    {/* Comments Section (only when expanded) */}
                    {isExpanded && (
                      <div className="pt-4 space-y-3 border-t border-border/50">
                        {item.comments.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Comments ({item.comments.length})</p>
                            {item.comments.map((comment) => (
                              <div 
                                key={comment.id} 
                                className="bg-muted/30 p-3 rounded-lg"
                              >
                                <div className="flex items-start gap-2">
                                  <Avatar className="h-7 w-7 ring-1 ring-border/30">
                                    <AvatarFallback className="bg-muted text-xs">
                                      <User className="w-3 h-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground">Community Member</p>
                                    <p className="text-sm text-foreground/90 mt-1">{comment.text}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add comment */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a comment..."
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
                            className="flex-1 h-9 text-sm"
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleComment(item.id)}
                            disabled={!commentTexts[item.id]?.trim()}
                            className="h-9"
                          >
                            Post
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default ContentFeed;