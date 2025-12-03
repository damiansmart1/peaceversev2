import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, Edit, Trash2, Eye, EyeOff, Share2, Copy,
  FileText, Image, Video, Music, Clock, CheckCircle, XCircle,
  AlertCircle, Download, Archive, RotateCcw, Heart, MessageCircle,
  BarChart3, TrendingUp, Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ContentCreator } from './ContentCreator';

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FileText, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  pending: { label: 'Pending Review', icon: Clock, color: 'bg-amber-500/10 text-amber-600' },
  approved: { label: 'Published', icon: CheckCircle, color: 'bg-green-500/10 text-green-600' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-500/10 text-red-600' },
  archived: { label: 'Archived', icon: Archive, color: 'bg-muted text-muted-foreground' },
};

export const ContentManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [editContent, setEditContent] = useState<any>(null);
  const [deleteContent, setDeleteContent] = useState<any>(null);
  const [showCreator, setShowCreator] = useState(false);

  const { data: myContent, isLoading } = useQuery({
    queryKey: ['my-content', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-content'] });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      toast.success('Content deleted successfully');
      setDeleteContent(null);
    },
    onError: () => toast.error('Failed to delete content'),
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ contentId, archive }: { contentId: string; archive: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ is_archived: archive })
        .eq('id', contentId);
      if (error) throw error;
    },
    onSuccess: (_, { archive }) => {
      queryClient.invalidateQueries({ queryKey: ['my-content'] });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      toast.success(archive ? 'Content archived' : 'Content restored');
    },
    onError: () => toast.error('Failed to update content'),
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
      queryClient.invalidateQueries({ queryKey: ['my-content'] });
      toast.success('Reposted! Content submitted for review.');
    },
    onError: () => toast.error('Failed to repost'),
  });

  const filteredContent = myContent?.filter(item => {
    if (activeTab === 'all') return !item.is_archived;
    if (activeTab === 'archived') return item.is_archived;
    return item.approval_status === activeTab && !item.is_archived;
  });

  const stats = {
    total: myContent?.filter(c => !c.is_archived).length || 0,
    published: myContent?.filter(c => c.approval_status === 'approved' && !c.is_archived).length || 0,
    pending: myContent?.filter(c => c.approval_status === 'pending').length || 0,
    drafts: myContent?.filter(c => c.approval_status === 'draft').length || 0,
    totalViews: myContent?.reduce((sum, c) => sum + (c.view_count || 0), 0) || 0,
    totalLikes: myContent?.reduce((sum, c) => sum + (c.like_count || 0), 0) || 0,
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image')) return Image;
    if (fileType?.startsWith('video')) return Video;
    if (fileType?.startsWith('audio')) return Music;
    return FileText;
  };

  const copyShareLink = (contentId: string) => {
    const url = `${window.location.origin}/content/${contentId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Posts', value: stats.total, icon: FileText, color: 'text-primary' },
          { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500' },
          { label: 'Drafts', value: stats.drafts, icon: Edit, color: 'text-blue-500' },
          { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-purple-500' },
          { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'text-pink-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="approved">Published</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowCreator(true)}>
            Create New Post
          </Button>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {filteredContent?.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No content found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === 'all' ? "Start creating your first post!" : `No ${activeTab} content yet.`}
              </p>
              {activeTab === 'all' && (
                <Button className="mt-4" onClick={() => setShowCreator(true)}>
                  Create Post
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredContent?.map((content, index) => {
                  const FileIcon = getFileIcon(content.file_type);
                  const status = STATUS_CONFIG[content.approval_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  
                  return (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={cn(
                        "overflow-hidden hover:shadow-md transition-shadow",
                        content.is_archived && "opacity-60"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Thumbnail */}
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {content.file_type?.startsWith('image') ? (
                                <img 
                                  src={content.file_url} 
                                  alt={content.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : content.file_type?.startsWith('video') ? (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                  <Video className="h-8 w-8 text-purple-500" />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                  <FileIcon className="h-8 w-8 text-primary" />
                                </div>
                              )}
                            </div>

                            {/* Content Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="font-semibold truncate">{content.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {content.description || 'No description'}
                                  </p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setEditContent(content);
                                      setShowCreator(true);
                                    }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => copyShareLink(content.id)}>
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => repostMutation.mutate(content)}>
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Repost
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => archiveMutation.mutate({ 
                                      contentId: content.id, 
                                      archive: !content.is_archived 
                                    })}>
                                      {content.is_archived ? (
                                        <>
                                          <RotateCcw className="h-4 w-4 mr-2" />
                                          Restore
                                        </>
                                      ) : (
                                        <>
                                          <Archive className="h-4 w-4 mr-2" />
                                          Archive
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => setDeleteContent(content)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {/* Meta Info */}
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <Badge className={cn("text-xs", status.color)}>
                                  <status.icon className="h-3 w-3 mr-1" />
                                  {status.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {content.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
                                </span>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {content.view_count || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {content.like_count || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Share2 className="h-4 w-4" />
                                  {content.share_count || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Content Creator Dialog */}
      <ContentCreator 
        open={showCreator} 
        onOpenChange={(open) => {
          setShowCreator(open);
          if (!open) setEditContent(null);
        }}
        editContent={editContent}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteContent} onOpenChange={() => setDeleteContent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your content
              and remove all associated data including likes and comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteContent && deleteMutation.mutate(deleteContent.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
