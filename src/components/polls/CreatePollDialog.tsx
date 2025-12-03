import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePoll, Poll } from '@/hooks/usePolls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Plus, X, Calendar as CalendarIcon, Vote, 
  Star, CheckCircle2, ThumbsUp, Trash2, GripVertical,
  Sparkles, Eye, Lock, Globe
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { toast } from 'sonner';

const POLL_TYPES = [
  { value: 'single_choice', label: 'Single Choice', icon: Vote, description: 'Voters select one option' },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: CheckCircle2, description: 'Voters can select multiple options' },
  { value: 'yes_no', label: 'Yes / No', icon: ThumbsUp, description: 'Simple yes or no question' },
  { value: 'rating', label: 'Rating Scale', icon: Star, description: 'Star rating from 1 to 5' },
];

const CATEGORIES = [
  { value: 'governance', label: 'Governance' },
  { value: 'community', label: 'Community' },
  { value: 'safety', label: 'Safety' },
  { value: 'environment', label: 'Environment' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'general', label: 'General' },
];

const QUICK_DURATIONS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
];

export const CreatePollDialog = () => {
  const { user } = useAuth();
  const createPoll = useCreatePoll();
  const [open, setOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [pollType, setPollType] = useState<Poll['poll_type']>('single_choice');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [visibility, setVisibility] = useState('public');
  
  // Settings
  const [showResultsBeforeVote, setShowResultsBeforeVote] = useState(false);
  const [maxSelections, setMaxSelections] = useState<number>(3);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('general');
    setPollType('single_choice');
    setOptions(['', '']);
    setEndDate(undefined);
    setVisibility('public');
    setShowResultsBeforeVote(false);
    setMaxSelections(3);
  };

  const handleAddOption = () => {
    if (options.length >= 10) {
      toast.error('Maximum 10 options allowed');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handlePollTypeChange = (type: Poll['poll_type']) => {
    setPollType(type);
    if (type === 'yes_no') {
      setOptions(['Yes', 'No']);
    } else if (type === 'rating') {
      setOptions(['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']);
    } else if (options.length < 2 || (options[0] === 'Yes' && options[1] === 'No')) {
      setOptions(['', '']);
    }
  };

  const handleQuickDuration = (days: number) => {
    setEndDate(addDays(new Date(), days));
  };

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a poll title');
      return;
    }

    if (pollType !== 'rating' && pollType !== 'yes_no') {
      const filledOptions = options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        toast.error('Please add at least 2 options');
        return;
      }
    }

    createPoll.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      pollType,
      options: pollType === 'rating' 
        ? ['1', '2', '3', '4', '5'] 
        : options.filter(o => o.trim()),
      settings: {
        show_results_before_vote: showResultsBeforeVote,
        max_selections: pollType === 'multiple_choice' ? maxSelections : undefined,
        rating_scale: pollType === 'rating' ? 5 : undefined,
      },
      endsAt: endDate?.toISOString(),
      visibility,
    }, {
      onSuccess: () => {
        resetForm();
        setOpen(false);
      },
    });
  };

  if (!user || user.is_anonymous) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create a New Poll
          </DialogTitle>
          <DialogDescription>
            Engage your community by creating a poll. Get instant feedback on important topics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Poll Type Selection */}
          <div className="space-y-3">
            <Label>Poll Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {POLL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handlePollTypeChange(type.value as Poll['poll_type'])}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                    pollType === type.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <type.icon className={cn(
                    "w-5 h-5 mt-0.5",
                    pollType === type.value ? "text-primary" : "text-muted-foreground"
                  )} />
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="poll-title">Question / Title *</Label>
              <Input
                id="poll-title"
                placeholder="What would you like to ask?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">{title.length}/200</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="poll-description">Description (optional)</Label>
              <Textarea
                id="poll-description"
                placeholder="Add context or details about your poll..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={500}
              />
            </div>
          </div>

          {/* Options (not for rating type) */}
          {pollType !== 'rating' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                {pollType !== 'yes_no' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    disabled={options.length >= 10}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                )}
              </div>
              <AnimatePresence mode="popLayout">
                {options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      disabled={pollType === 'yes_no'}
                      maxLength={100}
                    />
                    {pollType !== 'yes_no' && options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Multiple choice settings */}
          {pollType === 'multiple_choice' && (
            <div className="space-y-2">
              <Label>Maximum selections allowed</Label>
              <Select
                value={maxSelections.toString()}
                onValueChange={(v) => setMaxSelections(parseInt(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} options
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category & Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Public
                    </span>
                  </SelectItem>
                  <SelectItem value="unlisted">
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Unlisted
                    </span>
                  </SelectItem>
                  <SelectItem value="private">
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Private
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-3">
            <Label>Poll Duration</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_DURATIONS.map((dur) => (
                <Button
                  key={dur.days}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDuration(dur.days)}
                  className={cn(
                    endDate && 
                    Math.abs((endDate.getTime() - addDays(new Date(), dur.days).getTime()) / (1000 * 60 * 60 * 24)) < 0.5
                      && "bg-primary/10 border-primary"
                  )}
                >
                  {dur.label}
                </Button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Custom date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {endDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEndDate(undefined)}
                >
                  <X className="w-4 h-4 mr-1" />
                  No end date
                </Button>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <Label className="text-base">Advanced Settings</Label>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Show results before voting</div>
                <div className="text-xs text-muted-foreground">
                  Let users see current results before they vote
                </div>
              </div>
              <Switch
                checked={showResultsBeforeVote}
                onCheckedChange={setShowResultsBeforeVote}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createPoll.isPending}
          >
            {createPoll.isPending ? 'Creating...' : 'Create Poll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;
