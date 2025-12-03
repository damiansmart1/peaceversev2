import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { 
  Poll, 
  useUserPollResponse, 
  useSubmitPollVote 
} from '@/hooks/usePolls';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, Users, Clock, Share2, MessageSquare, 
  CheckCircle2, Vote, Star, ThumbsUp, ThumbsDown,
  TrendingUp, Calendar, Eye, Lock
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PollCardProps {
  poll: Poll;
  showFullResults?: boolean;
  compact?: boolean;
}

export const PollCard = ({ poll, showFullResults = false, compact = false }: PollCardProps) => {
  const { user } = useAuth();
  const { data: userResponse, isLoading: loadingResponse } = useUserPollResponse(poll.id);
  const submitVote = useSubmitPollVote();
  
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [ratingValue, setRatingValue] = useState<number>(3);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const hasVoted = !!userResponse;
  const isPollEnded = poll.ends_at ? isPast(new Date(poll.ends_at)) : false;
  const isPollActive = poll.is_active && !isPollEnded;
  const canVote = user && !hasVoted && isPollActive && !user.is_anonymous;
  const showResults = hasVoted || showFullResults || !isPollActive || poll.settings?.show_results_before_vote;

  const totalVotes = useMemo(() => {
    return poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  }, [poll.options]);

  const handleOptionSelect = (index: number) => {
    if (poll.poll_type === 'single_choice' || poll.poll_type === 'yes_no') {
      setSelectedOptions([index]);
    } else {
      const maxSelections = poll.settings?.max_selections || poll.options.length;
      if (selectedOptions.includes(index)) {
        setSelectedOptions(prev => prev.filter(i => i !== index));
      } else if (selectedOptions.length < maxSelections) {
        setSelectedOptions(prev => [...prev, index]);
      }
    }
  };

  const handleSubmit = () => {
    if (!canVote) return;

    if (poll.poll_type === 'rating') {
      submitVote.mutate({
        pollId: poll.id,
        selectedOptions: [ratingValue - 1],
        ratingValue,
        comment: showComment ? comment : undefined,
        isAnonymous,
      });
    } else {
      if (selectedOptions.length === 0) {
        toast.error('Please select at least one option');
        return;
      }
      submitVote.mutate({
        pollId: poll.id,
        selectedOptions,
        comment: showComment ? comment : undefined,
        isAnonymous,
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/proposals?poll=${poll.id}`;
    await navigator.clipboard.writeText(url);
    toast.success('Poll link copied to clipboard!');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      governance: 'bg-blue-500/10 text-blue-600',
      community: 'bg-green-500/10 text-green-600',
      safety: 'bg-red-500/10 text-red-600',
      environment: 'bg-emerald-500/10 text-emerald-600',
      education: 'bg-purple-500/10 text-purple-600',
      health: 'bg-pink-500/10 text-pink-600',
      general: 'bg-gray-500/10 text-gray-600',
    };
    return colors[category] || colors.general;
  };

  const getPollTypeIcon = () => {
    switch (poll.poll_type) {
      case 'yes_no': return <ThumbsUp className="w-4 h-4" />;
      case 'rating': return <Star className="w-4 h-4" />;
      case 'multiple_choice': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Vote className="w-4 h-4" />;
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg",
      poll.is_featured && "ring-2 ring-primary/20",
      compact && "p-4"
    )}>
      <CardHeader className={cn("space-y-3", compact && "p-0 pb-3")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={getCategoryColor(poll.category)}>
                {poll.category}
              </Badge>
              {poll.is_featured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {!isPollActive && (
                <Badge variant="secondary" className="bg-muted">
                  <Lock className="w-3 h-3 mr-1" />
                  Closed
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold leading-tight">{poll.title}</h3>
            {poll.description && !compact && (
              <p className="text-sm text-muted-foreground line-clamp-2">{poll.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {getPollTypeIcon()}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {poll.total_participants} voters
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {totalVotes} votes
          </span>
          {poll.ends_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {isPollEnded 
                ? `Ended ${formatDistanceToNow(new Date(poll.ends_at))} ago`
                : `Ends ${formatDistanceToNow(new Date(poll.ends_at))}`
              }
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "p-0")}>
        <AnimatePresence mode="wait">
          {showResults ? (
            <PollResults 
              poll={poll} 
              userResponse={userResponse} 
              totalVotes={totalVotes} 
            />
          ) : (
            <PollVoting
              poll={poll}
              selectedOptions={selectedOptions}
              ratingValue={ratingValue}
              onOptionSelect={handleOptionSelect}
              onRatingChange={setRatingValue}
              canVote={canVote}
              isLoading={loadingResponse}
            />
          )}
        </AnimatePresence>

        {canVote && !showResults && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id={`anonymous-${poll.id}`}
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor={`anonymous-${poll.id}`} className="text-sm cursor-pointer">
                  Vote anonymously
                </Label>
              </div>
              {poll.settings?.require_comment !== false && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComment(!showComment)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {showComment ? 'Hide' : 'Add'} comment
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showComment && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Textarea
                    placeholder="Share your thoughts (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    maxLength={500}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleSubmit}
              disabled={submitVote.isPending || (poll.poll_type !== 'rating' && selectedOptions.length === 0)}
              className="w-full"
            >
              {submitVote.isPending ? 'Submitting...' : 'Submit Vote'}
            </Button>
          </div>
        )}

        {!user && (
          <p className="text-sm text-center text-muted-foreground py-2">
            Sign in to vote in this poll
          </p>
        )}

        {user?.is_anonymous && (
          <p className="text-sm text-center text-muted-foreground py-2">
            Create an account to vote in polls
          </p>
        )}
      </CardContent>

      <CardFooter className={cn("flex justify-between pt-4", compact && "p-0 pt-3")}>
        <span className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(poll.created_at))} ago
        </span>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
};

// Sub-component for displaying results
const PollResults = ({ 
  poll, 
  userResponse, 
  totalVotes 
}: { 
  poll: Poll; 
  userResponse: any; 
  totalVotes: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {poll.poll_type === 'rating' ? (
        <RatingResults poll={poll} totalVotes={totalVotes} />
      ) : (
        poll.options.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isUserChoice = userResponse?.selected_options?.includes(index);
          const isWinning = option.votes === Math.max(...poll.options.map(o => o.votes)) && option.votes > 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span className={cn(
                  "flex items-center gap-2",
                  isUserChoice && "font-medium text-primary",
                  isWinning && "text-green-600"
                )}>
                  {isWinning && <TrendingUp className="w-3 h-3" />}
                  {option.text}
                  {isUserChoice && (
                    <Badge variant="outline" className="text-xs">Your vote</Badge>
                  )}
                </span>
                <span className="text-muted-foreground font-mono">
                  {option.votes} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={percentage} 
                  className="h-3"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    "absolute inset-0 h-3 rounded-full",
                    isWinning ? "bg-green-500/20" : "bg-primary/10"
                  )}
                />
              </div>
            </motion.div>
          );
        })
      )}

      {userResponse && (
        <p className="text-sm text-center text-muted-foreground pt-2">
          <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-500" />
          Thank you for voting!
          {userResponse.is_anonymous && ' (voted anonymously)'}
        </p>
      )}
    </motion.div>
  );
};

// Rating results visualization
const RatingResults = ({ poll, totalVotes }: { poll: Poll; totalVotes: number }) => {
  const scale = poll.settings?.rating_scale || 5;
  const avgRating = totalVotes > 0 
    ? poll.options.reduce((sum, opt, idx) => sum + (opt.votes * (idx + 1)), 0) / totalVotes
    : 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold text-primary">{avgRating.toFixed(1)}</div>
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: scale }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-6 h-6",
                i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Based on {totalVotes} ratings
        </p>
      </div>
    </div>
  );
};

// Sub-component for voting interface
const PollVoting = ({
  poll,
  selectedOptions,
  ratingValue,
  onOptionSelect,
  onRatingChange,
  canVote,
  isLoading,
}: {
  poll: Poll;
  selectedOptions: number[];
  ratingValue: number;
  onOptionSelect: (index: number) => void;
  onRatingChange: (value: number) => void;
  canVote: boolean;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <div className="py-4 text-center text-muted-foreground">Loading...</div>;
  }

  if (poll.poll_type === 'rating') {
    const scale = poll.settings?.rating_scale || 5;
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-center gap-2">
          {Array.from({ length: scale }).map((_, i) => (
            <button
              key={i}
              onClick={() => canVote && onRatingChange(i + 1)}
              disabled={!canVote}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  i < ratingValue 
                    ? "fill-amber-400 text-amber-400" 
                    : "text-muted-foreground/30 hover:text-amber-200"
                )}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {ratingValue} out of {scale}
        </p>
      </div>
    );
  }

  if (poll.poll_type === 'yes_no') {
    return (
      <div className="grid grid-cols-2 gap-3 py-2">
        {poll.options.map((option, index) => (
          <Button
            key={index}
            variant={selectedOptions.includes(index) ? 'default' : 'outline'}
            onClick={() => canVote && onOptionSelect(index)}
            disabled={!canVote}
            className={cn(
              "h-16 text-lg",
              index === 0 && "hover:bg-green-500 hover:text-white",
              index === 1 && "hover:bg-red-500 hover:text-white",
              selectedOptions.includes(index) && index === 0 && "bg-green-500 text-white",
              selectedOptions.includes(index) && index === 1 && "bg-red-500 text-white"
            )}
          >
            {index === 0 ? <ThumbsUp className="w-5 h-5 mr-2" /> : <ThumbsDown className="w-5 h-5 mr-2" />}
            {option.text}
          </Button>
        ))}
      </div>
    );
  }

  // Single or multiple choice
  const isMultiple = poll.poll_type === 'multiple_choice';

  return (
    <div className="space-y-2">
      {poll.options.map((option, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => canVote && onOptionSelect(index)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
            selectedOptions.includes(index) 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            !canVote && "cursor-not-allowed opacity-60"
          )}
        >
          {isMultiple ? (
            <Checkbox
              checked={selectedOptions.includes(index)}
              disabled={!canVote}
              className="pointer-events-none"
            />
          ) : (
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
              selectedOptions.includes(index) 
                ? "border-primary bg-primary" 
                : "border-muted-foreground/30"
            )}>
              {selectedOptions.includes(index) && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          )}
          <span className="flex-1">{option.text}</span>
        </motion.div>
      ))}
      {isMultiple && poll.settings?.max_selections && (
        <p className="text-xs text-muted-foreground">
          Select up to {poll.settings.max_selections} options
        </p>
      )}
    </div>
  );
};

export default PollCard;
