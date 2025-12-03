import { useState } from 'react';
import { useSocialProfile, useIsFollowing, useFollowUser, useUnfollowUser } from '@/hooks/useSocialNetwork';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, UserMinus, MessageCircle, Settings, Share2, 
  Grid3X3, Bookmark, Heart, Award, CheckCircle2, MapPin,
  Link as LinkIcon, Calendar, ExternalLink, Globe, Twitter, Instagram
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SocialFeed } from './SocialFeed';
import { ProfileEditor } from './ProfileEditor';
import { toast } from 'sonner';

interface UserProfileProps {
  userId?: string;
}

export const UserProfile = ({ userId }: UserProfileProps) => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useSocialProfile(userId);
  const { data: isFollowing } = useIsFollowing(userId || '');
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const isOwnProfile = !userId || userId === user?.id;

  const handleFollowToggle = () => {
    if (!userId) return;
    if (isFollowing) {
      unfollowUser.mutate(userId);
    } else {
      followUser.mutate(userId);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${profile?.id || user?.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied to clipboard!');
  };

  const handleMessage = () => {
    toast.info('Opening direct messages...');
    // This would navigate to messages with this user pre-selected
  };

  const getCreatorTierBadge = (tier: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      starter: { label: 'Creator', className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100' },
      bronze: { label: 'Bronze Creator', className: 'bg-amber-100 text-amber-800' },
      silver: { label: 'Silver Creator', className: 'bg-slate-200 text-slate-800' },
      gold: { label: 'Gold Creator', className: 'bg-yellow-100 text-yellow-800' },
      platinum: { label: 'Platinum Creator', className: 'bg-purple-100 text-purple-800' },
    };
    return badges[tier] || badges.starter;
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Profile not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                  {profile.display_name?.[0] || profile.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold">
                  {profile.display_name || profile.username || 'Anonymous User'}
                </h1>
                {profile.is_creator && (
                  <Badge className={cn("text-xs", getCreatorTierBadge(profile.creator_tier).className)}>
                    <Award className="h-3 w-3 mr-1" />
                    {getCreatorTierBadge(profile.creator_tier).label}
                  </Badge>
                )}
              </div>

              {profile.username && (
                <p className="text-muted-foreground mb-3">@{profile.username}</p>
              )}

              {profile.bio && (
                <p className="text-sm mb-4 max-w-lg">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-6 mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold">{profile.content?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{profile.followersCount}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{profile.followingCount}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
                {profile.peace_points > 0 && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary">{profile.peace_points}</p>
                    <p className="text-sm text-muted-foreground">Peace Points</p>
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                {profile.user_type && (
                  <span className="flex items-center gap-1">
                    <Badge variant="outline">{profile.user_type}</Badge>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
                </span>
              </div>

              {/* Social Links */}
              {profile.social_links && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {profile.social_links.website && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {profile.social_links.twitter && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`https://twitter.com/${profile.social_links.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {profile.social_links.instagram && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {isOwnProfile ? (
                  <>
                    <Button variant="outline" onClick={() => setShowProfileEditor(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      variant={isFollowing ? "outline" : "default"}
                      disabled={followUser.isPending || unfollowUser.isPending}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleMessage}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Liked
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {profile.content?.length === 0 ? (
            <Card className="p-12 text-center">
              <Grid3X3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isOwnProfile ? "Share your first post!" : "This user hasn't posted anything yet."}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {profile.content?.map((item: any) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
                >
                  {item.file_type?.startsWith('image') ? (
                    <img
                      src={item.file_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : item.file_type?.startsWith('video') ? (
                    <video
                      src={item.file_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                    <span className="flex items-center gap-1">
                      <Heart className="h-5 w-5" />
                      {item.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-5 w-5" />
                      0
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">Liked posts</p>
            <p className="text-sm text-muted-foreground mt-1">
              Posts you've liked will appear here
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <Card className="p-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">Saved posts</p>
            <p className="text-sm text-muted-foreground mt-1">
              Posts you've saved will appear here
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Editor Dialog */}
      {profile && (
        <ProfileEditor 
          profile={profile} 
          open={showProfileEditor} 
          onOpenChange={setShowProfileEditor} 
        />
      )}
    </div>
  );
};
