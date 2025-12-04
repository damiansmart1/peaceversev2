import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowUser, useUnfollowUser, useIsFollowing } from '@/hooks/useSocialNetwork';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, UserMinus, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UserSearchProps {
  onSelectUser?: (userId: string) => void;
}

export const UserSearch = ({ onSelectUser }: UserSearchProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_creator, creator_tier, is_verified')
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .neq('id', user?.id || '')
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2,
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setIsOpen(value.length >= 2);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="shadow-lg border-2">
              <CardContent className="p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((profile) => (
                      <UserSearchResult
                        key={profile.id}
                        profile={profile}
                        onSelect={() => {
                          onSelectUser?.(profile.id);
                          clearSearch();
                        }}
                      />
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No users found for "{searchQuery}"
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface UserSearchResultProps {
  profile: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_creator: boolean | null;
    creator_tier: string | null;
    is_verified: boolean | null;
  };
  onSelect?: () => void;
}

const UserSearchResult = ({ profile, onSelect }: UserSearchResultProps) => {
  const { user } = useAuth();
  const { data: isFollowing, isLoading: checkingFollow } = useIsFollowing(profile.id);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    if (isFollowing) {
      unfollowMutation.mutate(profile.id);
    } else {
      followMutation.mutate(profile.id);
    }
  };

  const isPending = followMutation.isPending || unfollowMutation.isPending || checkingFollow;

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {profile.display_name?.[0] || profile.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {profile.display_name || profile.username || 'User'}
            </span>
            {profile.is_verified && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Verified
              </Badge>
            )}
            {profile.is_creator && (
              <Badge variant="outline" className="text-xs">
                Creator
              </Badge>
            )}
          </div>
          {profile.username && (
            <span className="text-sm text-muted-foreground">@{profile.username}</span>
          )}
        </div>
      </div>
      
      {user && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={handleFollowToggle}
          disabled={isPending}
          className={cn(
            "min-w-[90px]",
            isFollowing && "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFollowing ? (
            <>
              <UserMinus className="h-4 w-4 mr-1" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-1" />
              Follow
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default UserSearch;
