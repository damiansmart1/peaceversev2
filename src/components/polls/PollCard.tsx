import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Poll, useUserPollResponse, useSubmitPollVote, usePollResults, usePollEligibility } from '@/hooks/usePolls';
import { ReadAloudButton, HiddenResultsNotice, OutcomePanel, DownloadResultsButton } from './PollExtras';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BarChart3, Users, Clock, Share2, MessageSquare, CheckCircle2, Vote, Star,
  ThumbsUp, ThumbsDown, TrendingUp, Lock, Sparkles, Zap, Crown, ShieldCheck, ListOrdered, UserCheck, EyeOff,
  GripVertical, ChevronUp, ChevronDown, PencilLine,
} from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import LearningMaterials from '@/components/participation/LearningMaterials';
import TranslatableText from '@/components/TranslatableText';
import OptionImage from '@/components/polls/OptionImage';
import SharePopup from '@/components/SharePopup';
import PollBanner from './PollBanner';

interface PollCardProps {
  poll: Poll;
  showFullResults?: boolean;
  compact?: boolean;
}

const LETTERS = 'ABCDEFGHIJ';

export const PollCard = ({ poll: rawPoll, showFullResults = false, compact = false }: PollCardProps) => {
  const { user } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const { data: sealedCounts, isLoading: loadingCounts } = usePollResults(rawPoll);
  const { data: eligible, isLoading: loadingEligible } = usePollEligibility(rawPoll);
  const sealed = rawPoll.results_visibility === 'after_close';
  const resultsHidden = sealed && !loadingCounts && !sealedCounts;
  const poll = useMemo<Poll>(() => (sealed && sealedCounts
    ? { ...rawPoll, options: rawPoll.options.map((o, i) => ({ ...o, votes: sealedCounts[i] || 0 })) }
    : rawPoll), [rawPoll, sealed, sealedCounts]);
  const restricted = !!poll.eligibility && poll.eligibility !== 'everyone';
  const isEligible = !restricted || eligible === true;
  const canManage = !!user && (user.id === poll.created_by || !!isAdmin);
  const { data: userResponse, isLoading: loadingResponse } = useUserPollResponse(poll.id);
  const submitVote = useSubmitPollVote();

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [ratingValue, setRatingValue] = useState<number>(3);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showComment, setShowComment] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [celebrateMsg, setCelebrateMsg] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingVote, setPendingVote] = useState<{ selectedOptions: number[]; ratingValue: number } | null>(null);

  const hasVoted = !!userResponse;
  const isPollEnded = poll.ends_at ? isPast(new Date(poll.ends_at)) : false;
  const isPollActive = poll.is_active && !isPollEnded && new Date(poll.starts_at) <= new Date();
  const canVote = !!user && !hasVoted && isPollActive && !user.is_anonymous && isEligible && !loadingEligible;
  const showResults = hasVoted || showFullResults || !isPollActive
    || (poll.results_visibility !== 'after_vote' && !sealed && !!poll.settings?.show_results_before_vote);

  const totalVotes = useMemo(() => poll.options.reduce((s, o) => s + (o.votes || 0), 0), [poll.options]);

  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(false), 2800);
    return () => clearTimeout(t);
  }, [celebrate]);

  const handleOptionSelect = (index: number) => {
    if (poll.poll_type === 'single_choice' || poll.poll_type === 'yes_no') {
      setSelectedOptions([index]);
    } else {
      const max = poll.settings?.max_selections || poll.options.length;
      if (selectedOptions.includes(index)) setSelectedOptions((p) => p.filter((i) => i !== index));
      else if (selectedOptions.length < max) setSelectedOptions((p) => [...p, index]);
      else toast.info(poll.poll_type === 'ranked' ? `You can rank your top ${max}` : `You can pick up to ${max} options`);
    }
  };

  const handleSubmit = () => {
    if (!canVote) return;
    const onSuccess = () => {
      setCelebrateMsg(pickCelebrationMessage(poll.settings?.thank_you_message));
      setCelebrate(true);
    };
    if (poll.poll_type === 'rating') {
      submitVote.mutate(
        { pollId: poll.id, selectedOptions: [ratingValue - 1], ratingValue, comment: showComment ? comment : undefined, isAnonymous },
        { onSuccess },
      );
    } else {
      if (selectedOptions.length === 0) {
        toast.error('Please select at least one option');
        return;
      }
      submitVote.mutate(
        { pollId: poll.id, selectedOptions, comment: showComment ? comment : undefined, isAnonymous },
        { onSuccess },
      );
    }
  };

  const [shareOpen, setShareOpen] = useState(false);
  const handleShare = () => setShareOpen(true);

  const typeMeta = {
    yes_no: { icon: ThumbsUp, label: 'Yes / No' },
    rating: { icon: Star, label: 'Rating' },
    multiple_choice: { icon: CheckCircle2, label: 'Pick many' },
    single_choice: { icon: Vote, label: 'Pick one' },
    ranked: { icon: ListOrdered, label: `Rank top ${poll.settings?.max_selections || poll.options.length}` },
  }[poll.poll_type] || { icon: Vote, label: 'Poll' };
  const TypeIcon = typeMeta.icon;

  const step = hasVoted ? 3 : selectedOptions.length > 0 || poll.poll_type === 'rating' ? 2 : 1;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl',
        'shadow-[0_10px_40px_-20px_hsl(var(--primary)/0.45)] hover:shadow-[0_20px_60px_-24px_hsl(var(--primary)/0.6)] transition-shadow',
        poll.is_featured && 'border-accent/60',
      )}
    >
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/20 blur-3xl opacity-60 group-hover:opacity-90 transition-opacity" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-accent/20 blur-3xl opacity-40" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-accent to-secondary" />

      <Celebration show={celebrate} message={celebrateMsg} />
      <SharePopup open={shareOpen} onOpenChange={setShareOpen} kind="poll" title={poll.title} path={`/polls/${poll.id}`} />

      <div className={cn('relative space-y-5 p-5 sm:p-6', compact && 'p-4 space-y-4')}>
        <PollBanner path={poll.banner_path} alt={poll.title} />
        {/* Header */}
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {isPollActive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3 w-3" /> Closed
              </span>
            )}
            <span className="rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[11px] font-medium capitalize text-foreground/80">
              {poll.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
              <TypeIcon className="h-3 w-3" /> {typeMeta.label}
            </span>
            {restricted && (
              <span className="inline-flex items-center gap-1 rounded-full border border-secondary/60 bg-secondary/15 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                <UserCheck className="h-3 w-3" /> Members only
              </span>
            )}
            {sealed && isPollActive && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
                <EyeOff className="h-3 w-3" /> Sealed results
              </span>
            )}
            {poll.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                <Sparkles className="h-3 w-3" /> Featured
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 font-display text-lg sm:text-xl font-semibold leading-snug break-words text-foreground">
              <TranslatableText text={poll.title} />
            </h3>
            <ReadAloudButton poll={poll} />
          </div>
          {poll.description && !compact && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              <TranslatableText text={poll.description} />
            </p>
          )}

          {/* Pulse stats */}
          <div className="grid grid-cols-3 gap-2">
            <Stat icon={Users} value={poll.total_participants || 0} label="voices" />
            <Stat icon={BarChart3} value={totalVotes} label="votes" />
            <Stat
              icon={Clock}
              value={poll.ends_at ? formatDistanceToNow(new Date(poll.ends_at)) : '∞'}
              label={poll.ends_at ? (isPollEnded ? 'ago' : 'left') : 'open'}
            />
          </div>
        </header>

        <LearningMaterials kind="poll" id={poll.id} title={poll.title} description={poll.description || ''} proposalId={poll.proposal_id} />

        {/* Journey steps */}
        {isPollActive && user && !user.is_anonymous && (
          <ol className="flex items-center gap-2 text-[11px] font-medium" aria-label="Voting progress">
            {['Learn', 'Choose', 'Counted'].map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] transition-colors',
                    step > i ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
                  )}
                >
                  {step > i + 1 || (hasVoted && i === 2) ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn('truncate', step > i ? 'text-foreground' : 'text-muted-foreground')}>{s}</span>
                {i < 2 && <span className={cn('h-px flex-1', step > i + 1 ? 'bg-primary' : 'bg-border')} />}
              </li>
            ))}
          </ol>
        )}

        <AnimatePresence mode="wait">
          {showResults && !canVote ? (
            resultsHidden
              ? <HiddenResultsNotice key="sealed" poll={poll} hasVoted={hasVoted} />
              : <PollResults key="results" poll={poll} userResponse={userResponse} totalVotes={totalVotes} />
          ) : (
            <PollVoting
              key="voting"
              poll={poll}
              selectedOptions={selectedOptions}
              ratingValue={ratingValue}
              onOptionSelect={handleOptionSelect}
              onRatingChange={setRatingValue}
              onReorder={setSelectedOptions}
              canVote={canVote}
              isLoading={loadingResponse}
            />
          )}
        </AnimatePresence>

        {canVote && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2">
              <div className="flex items-center gap-2">
                <Switch id={`anonymous-${poll.id}`} checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                <Label htmlFor={`anonymous-${poll.id}`} className="flex cursor-pointer items-center gap-1 text-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Hide my name
                </Label>
              </div>
              {poll.settings?.require_comment !== false && (
                <Button variant="ghost" size="sm" onClick={() => setShowComment(!showComment)}>
                  <MessageSquare className="mr-1 h-4 w-4" />
                  {showComment ? 'Hide' : 'Add'} comment
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showComment && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Textarea
                    placeholder="Why did you choose this? Your reasoning helps decision-makers."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="bg-background/60"
                  />
                  <p className="mt-1 text-right text-[11px] text-muted-foreground">{comment.length}/500</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleSubmit}
                disabled={submitVote.isPending || (poll.poll_type !== 'rating' && selectedOptions.length === 0)}
                className="relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30"
              >
                <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent animate-[shimmer_2.2s_infinite]" />
                <Zap className="mr-2 h-4 w-4" />
                {submitVote.isPending ? 'Casting your voice…' : 'Cast my vote'}
              </Button>
            </motion.div>
            <p className="text-center text-[11px] text-muted-foreground">
              Join {poll.total_participants || 0} {poll.total_participants === 1 ? 'person' : 'people'} shaping this decision
            </p>
          </div>
        )}

        {user && !user.is_anonymous && restricted && !loadingEligible && !isEligible && isPollActive && !hasVoted && (
          <div className="rounded-xl border border-dashed border-secondary/60 bg-secondary/10 p-3 text-center text-sm text-foreground">
            This poll is open to invited members only{poll.eligibility === 'domain' && poll.eligible_domains?.length ? ` (${poll.eligible_domains.map(d => '@' + d).join(', ')} emails)` : ''}.
          </div>
        )}

        <OutcomePanel poll={poll} canManage={canManage && (!isPollActive || !!poll.outcome_text)} />

        {!user && (
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-center text-sm text-foreground">
            Sign in to add your voice to this poll
          </div>
        )}
        {user?.is_anonymous && (
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-center text-sm text-foreground">
            Create an account to vote in polls
          </div>
        )}

        <footer className="flex items-center justify-between border-t border-border/50 pt-3">
          <span className="text-xs text-muted-foreground">Started {formatDistanceToNow(new Date(poll.created_at))} ago</span>
          <div className="flex items-center gap-1">
            {showResults && !resultsHidden && totalVotes > 0 && <DownloadResultsButton poll={poll} counts={poll.options.map(o => o.votes || 0)} />}
            <Button variant="ghost" size="sm" onClick={handleShare} className="rounded-full">
              <Share2 className="mr-1 h-4 w-4" /> Invite
            </Button>
          </div>
        </footer>
      </div>
    </motion.article>
  );
};

const Stat = ({ icon: Icon, value, label }: { icon: any; value: string | number; label: string }) => (
  <div className="rounded-xl border border-border/50 bg-background/40 px-2 py-2 text-center">
    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="truncate">{value}</span>
    </div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);

const FUN_MESSAGES = [
  '🎉 Your voice is counted!',
  '🌍 Democracy just got a little louder!',
  '🙌 Boom! Your vote is in.',
  '✨ You just shaped the future.',
  '🕊️ One more voice for peace!',
  '🚀 Vote launched — thank you!',
];
export const pickCelebrationMessage = (custom?: string | null) =>
  custom?.trim() || FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)];

const Celebration = ({ show, message }: { show: boolean; message: string }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {Array.from({ length: 28 }).map((_, i) => {
          const angle = (i / 28) * Math.PI * 2;
          const dist = 110 + (i % 4) * 25;
          return (
            <motion.span
              key={i}
              className={cn('absolute rounded-full', i % 2 ? 'h-2 w-2' : 'h-3 w-1.5 rounded-sm', ['bg-primary', 'bg-accent', 'bg-secondary', 'bg-gold'][i % 4])}
              initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
              animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 30, scale: [0, 1.4, 0], rotate: 360 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            />
          );
        })}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -6 }}
          animate={{ scale: [0.4, 1.12, 1], opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-4 max-w-xs rounded-2xl bg-primary px-5 py-4 text-center font-semibold text-primary-foreground shadow-2xl"
        >
          <Sparkles className="mx-auto mb-1 h-5 w-5" />
          <span className="break-words">{message}</span>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const PollResults = ({ poll, userResponse, totalVotes }: { poll: Poll; userResponse: any; totalVotes: number }) => {
  const maxVotes = Math.max(...poll.options.map((o) => o.votes || 0));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
      {poll.poll_type === 'rating' ? (
        <RatingResults poll={poll} totalVotes={totalVotes} />
      ) : (
        poll.options.map((option, index) => {
          const pct = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const mine = userResponse?.selected_options?.includes(index);
          const leading = option.votes === maxVotes && option.votes > 0;
          return (
            <div
              key={index}
              className={cn(
                'relative overflow-hidden rounded-xl border bg-background/40 px-3 py-3',
                mine ? 'border-primary' : 'border-border/60',
              )}
            >
              <motion.div
                aria-hidden
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'absolute inset-y-0 left-0',
                  leading ? 'bg-gradient-to-r from-primary/35 to-accent/30' : 'bg-primary/12',
                )}
              />
              <div className="relative flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background/80 text-[11px] font-bold text-foreground">
                    {leading ? <Crown className="h-3.5 w-3.5 text-accent" /> : LETTERS[index]}
                  </span>
                  <OptionImage path={option.image_path} alt={option.text} className="h-10 w-16" />
                  <span className={cn('break-words', mine && 'font-semibold text-primary')}>
                    <TranslatableText text={option.text} />
                  </span>
                  {mine && (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">You</span>
                  )}
                </span>
                <span className="shrink-0 text-right">
                  <span className="font-display text-base font-bold text-foreground">{pct.toFixed(0)}%</span>
                  <span className="ml-1 text-[11px] text-muted-foreground">{option.votes}{poll.poll_type === 'ranked' ? ' pts' : ''}</span>
                </span>
              </div>
            </div>
          );
        })
      )}

      {userResponse && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 p-3 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          You're part of this decision{userResponse.is_anonymous ? ' — your name is hidden' : ''}.
        </div>
      )}
    </motion.div>
  );
};

const RatingResults = ({ poll, totalVotes }: { poll: Poll; totalVotes: number }) => {
  const scale = poll.settings?.rating_scale || 5;
  const avg = totalVotes > 0 ? poll.options.reduce((s, o, i) => s + o.votes * (i + 1), 0) / totalVotes : 0;
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-5 text-center">
      <div className="font-display text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {avg.toFixed(1)}
      </div>
      <div className="mt-2 flex justify-center gap-1">
        {Array.from({ length: scale }).map((_, i) => (
          <Star key={i} className={cn('h-6 w-6', i < Math.round(avg) ? 'fill-accent text-accent' : 'text-muted-foreground/30')} />
        ))}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Based on {totalVotes} ratings</p>
    </div>
  );
};

const PollVoting = ({
  poll, selectedOptions, ratingValue, onOptionSelect, onRatingChange, canVote, isLoading, onReorder,
}: {
  poll: Poll;
  selectedOptions: number[];
  ratingValue: number;
  onOptionSelect: (index: number) => void;
  onRatingChange: (value: number) => void;
  canVote: boolean;
  isLoading: boolean;
  onReorder?: (order: number[]) => void;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/60" />)}
      </div>
    );
  }

  if (poll.poll_type === 'rating') {
    const scale = poll.settings?.rating_scale || 5;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 rounded-2xl border border-border/60 bg-background/40 py-5">
        <div className="flex justify-center gap-1.5 sm:gap-2" role="radiogroup" aria-label="Rating">
          {Array.from({ length: scale }).map((_, i) => (
            <motion.button
              key={i}
              type="button"
              role="radio"
              aria-checked={ratingValue === i + 1}
              aria-label={`${i + 1} of ${scale}`}
              whileHover={{ scale: 1.2, rotate: -8 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => canVote && onRatingChange(i + 1)}
              disabled={!canVote}
            >
              <Star className={cn('h-9 w-9 transition-colors', i < ratingValue ? 'fill-accent text-accent drop-shadow-[0_0_8px_hsl(var(--accent)/0.6)]' : 'text-muted-foreground/30')} />
            </motion.button>
          ))}
        </div>
        <p className="text-center text-sm font-medium text-foreground">{ratingValue} / {scale}</p>
      </motion.div>
    );
  }

  if (poll.poll_type === 'yes_no') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3">
        {poll.options.map((option, index) => {
          const sel = selectedOptions.includes(index);
          const Icon = index === 0 ? ThumbsUp : ThumbsDown;
          return (
            <motion.button
              key={index}
              type="button"
              aria-pressed={sel}
              whileHover={canVote ? { y: -2 } : undefined}
              whileTap={canVote ? { scale: 0.95 } : undefined}
              onClick={() => canVote && onOptionSelect(index)}
              disabled={!canVote}
              className={cn(
                'flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 text-base font-semibold transition-all disabled:opacity-60',
                sel
                  ? index === 0
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'border-destructive bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30'
                  : 'border-border/70 bg-background/40 text-foreground hover:border-primary/50',
              )}
            >
              <motion.span animate={sel ? { scale: [1, 1.35, 1], rotate: [0, -12, 0] } : {}} transition={{ duration: 0.4 }}>
                <Icon className="h-7 w-7" />
              </motion.span>
              <TranslatableText text={option.text} />
            </motion.button>
          );
        })}
      </motion.div>
    );
  }

  const isRanked = poll.poll_type === 'ranked';
  const isMultiple = poll.poll_type === 'multiple_choice' || isRanked;
  const max = poll.settings?.max_selections || poll.options.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
      {isMultiple && (
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {isRanked ? `Tap in order of preference · ${selectedOptions.length} of ${max} ranked` : `Picked ${selectedOptions.length} of ${max}`}
        </p>
      )}
      {poll.options.map((option, index) => {
        const sel = selectedOptions.includes(index);
        return (
          <motion.button
            key={index}
            type="button"
            role={isMultiple ? 'checkbox' : 'radio'}
            aria-checked={sel}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={canVote ? { x: 4 } : undefined}
            whileTap={canVote ? { scale: 0.98 } : undefined}
            onClick={() => canVote && onOptionSelect(index)}
            disabled={!canVote}
            className={cn(
              'relative flex w-full items-center gap-3 overflow-hidden rounded-xl border-2 p-3 text-left transition-all',
              sel
                ? 'border-primary bg-primary/10 shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]'
                : 'border-border/60 bg-background/40 hover:border-primary/40',
              !canVote && 'cursor-not-allowed opacity-60',
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors',
                sel ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {isRanked ? (
                sel ? selectedOptions.indexOf(index) + 1 : LETTERS[index]
              ) : isMultiple ? (
                <Checkbox checked={sel} className="pointer-events-none border-current" />
              ) : sel ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                LETTERS[index]
              )}
            </span>
            <OptionImage path={option.image_path} alt={option.text} className="h-16 w-24 sm:h-20 sm:w-36" />
            <span className="flex-1 break-words text-sm font-medium text-foreground">
              <TranslatableText text={option.text} />
            </span>
            {sel && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-primary">
                <TrendingUp className="h-4 w-4" />
              </motion.span>
            )}
          </motion.button>
        );
      })}
      {isRanked && selectedOptions.length > 1 && canVote && onReorder && (
        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-primary">
            <GripVertical className="h-3.5 w-3.5" /> Drag to arrange your ranking
          </p>
          <Reorder.Group axis="y" values={selectedOptions} onReorder={onReorder} className="space-y-1.5">
            {selectedOptions.map((optIndex, pos) => (
              <Reorder.Item
                key={optIndex}
                value={optIndex}
                whileDrag={{ scale: 1.03, boxShadow: '0 10px 30px hsl(var(--primary) / 0.25)' }}
                className="flex cursor-grab touch-none items-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-2 active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">{pos + 1}</span>
                <span className="flex-1 truncate text-sm">{poll.options[optIndex]?.text}</span>
                <button
                  type="button" aria-label="Move up" disabled={pos === 0}
                  onClick={() => { const n = [...selectedOptions]; [n[pos - 1], n[pos]] = [n[pos], n[pos - 1]]; onReorder(n); }}
                  className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                ><ChevronUp className="h-4 w-4" /></button>
                <button
                  type="button" aria-label="Move down" disabled={pos === selectedOptions.length - 1}
                  onClick={() => { const n = [...selectedOptions]; [n[pos + 1], n[pos]] = [n[pos], n[pos + 1]]; onReorder(n); }}
                  className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                ><ChevronDown className="h-4 w-4" /></button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </motion.div>
  );
};

export default PollCard;
