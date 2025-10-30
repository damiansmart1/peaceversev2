import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Share, Play, Pause, Volume2 } from "lucide-react";
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

  const renderMediaPlayer = (item: ContentItem) => {
    if (item.file_type === 'video') {
      return (
        <video
          controls
          className="w-full max-h-96 object-contain rounded-lg"
        >
          <source src={item.file_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (item.file_type === 'image') {
      return (
        <img
          src={item.file_url}
          alt={item.title}
          className="w-full max-h-96 object-contain rounded-lg"
        />
      );
    } else if (item.file_type === 'audio') {
      return (
        <div className="bg-muted/30 p-6 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <Volume2 className="w-6 h-6" />
            <span className="font-medium">{item.title}</span>
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
    return <div className="text-center py-8">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      {content.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No content yet.</p>
          <p className="text-muted-foreground">Be the first to share something!</p>
        </div>
      ) : (
        content.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {item.description && (
                    <SafeHTML 
                      html={item.description}
                      className="text-muted-foreground mt-1 prose-content"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {renderMediaPlayer(item)}

              {/* Action buttons */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(item.id)}
                  className={item.user_liked ? "text-red-500" : ""}
                >
                  <Heart className={`w-4 h-4 mr-2 ${item.user_liked ? 'fill-current' : ''}`} />
                  {item.like_count}
                </Button>

                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {item.comments.length}
                </Button>

                <ShareDialog audioUrl={item.file_url}>
                  <Button variant="ghost" size="sm">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </ShareDialog>
              </div>

              {/* Comments section */}
              <div className="space-y-3">
                {item.comments.map((comment) => (
                  <div key={comment.id} className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm">{comment.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}

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
                      if (e.key === 'Enter') {
                        handleComment(item.id);
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleComment(item.id)}
                    disabled={!commentTexts[item.id]?.trim()}
                  >
                    Post
                  </Button>
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