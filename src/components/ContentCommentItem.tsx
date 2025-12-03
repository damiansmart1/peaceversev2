import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentActions from "./CommentActions";
import {
  useContentCommentLikes,
  useUserContentCommentLike,
  useToggleContentCommentLike,
  useReportContentComment,
} from "@/hooks/useCommentActions";

interface ContentCommentItemProps {
  comment: {
    id: string;
    text: string;
    created_at: string;
    user_id: string;
  };
}

const ContentCommentItem = ({ comment }: ContentCommentItemProps) => {
  const { data: likes } = useContentCommentLikes(comment.id);
  const { data: userLike } = useUserContentCommentLike(comment.id);
  const toggleLike = useToggleContentCommentLike();
  const reportComment = useReportContentComment();

  const handleToggleLike = () => {
    toggleLike.mutate({ commentId: comment.id, isLiked: !!userLike });
  };

  const handleReport = (reason: string, details?: string) => {
    reportComment.mutate({ commentId: comment.id, reason, details });
  };

  return (
    <div id={`comment-${comment.id}`} className="bg-muted/30 p-3 rounded-lg">
      <div className="flex items-start gap-2">
        <Avatar className="h-7 w-7 ring-1 ring-border/30">
          <AvatarFallback className="bg-muted text-xs">
            <User className="w-3 h-3" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">Community Member</p>
          <p className="text-sm text-foreground/90 mt-1">{comment.text}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
            <CommentActions
              commentId={comment.id}
              commentText={comment.text}
              likeCount={likes?.length || 0}
              isLiked={!!userLike}
              onToggleLike={handleToggleLike}
              onReport={handleReport}
              isLikeLoading={toggleLike.isPending}
              isReportLoading={reportComment.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCommentItem;