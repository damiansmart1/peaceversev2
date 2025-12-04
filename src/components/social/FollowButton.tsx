import { useAuth } from '@/contexts/AuthContext';
import { useIsFollowing, useFollowUser, useUnfollowUser } from '@/hooks/useSocialNetwork';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FollowButtonProps {
  userId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showIcon?: boolean;
  className?: string;
}

export const FollowButton = ({ 
  userId, 
  size = 'sm', 
  variant = 'default',
  showIcon = true,
  className 
}: FollowButtonProps) => {
  const { user } = useAuth();
  const { data: isFollowing, isLoading: checkingFollow } = useIsFollowing(userId);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Don't show follow button for own profile
  if (!user || user.id === userId) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to follow users');
      return;
    }
    
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const isPending = followMutation.isPending || unfollowMutation.isPending || checkingFollow;

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        isFollowing && "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          {showIcon && <UserMinus className="h-4 w-4 mr-1" />}
          Following
        </>
      ) : (
        <>
          {showIcon && <UserPlus className="h-4 w-4 mr-1" />}
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
