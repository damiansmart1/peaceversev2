import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePoll, usePolls, Poll } from '@/hooks/usePolls';
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
import MaterialEditor from '@/components/participation/MaterialEditor';
import { saveParticipationMaterials } from '@/hooks/useParticipationMaterials';
import { type MaterialDraft, parseDomains, parseInviteEmails } from '@/lib/participation';
import { useProposals } from '@/hooks/useProposals';
import { supabase } from '@/lib/supabase-typed';
import { OPTION_IMAGE_BUCKET } from '@/components/polls/OptionImage';
import { ImagePlus } from 'lucide-react';
import { useTranslationContext } from '@/components/TranslationProvider';

const POLL_TYPES = [
  { value: 'single_choice', label: 'Single Choice', icon: Vote, description: 'Voters select one option' },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: CheckCircle2, description: 'Voters can select multiple options' },
  { value: 'yes_no', label: 'Yes / No', icon: ThumbsUp, description: 'Simple yes or no question' },
  { value: 'rating', label: 'Rating Scale', icon: Star, description: 'Star rating from 1 to 5' },
  { value: 'ranked', label: 'Ranked', icon: GripVertical, description: 'Voters rank their favourites in order' },
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
  const { t } = useTranslationContext();
  const { data: proposals = [] } = useProposals();
  const [proposalId, setProposalId] = useState('none');
  const [thankYou, setThankYou] = useState('');
  const [groupChoice, setGroupChoice] = useState('none');
  const [eligibility, setEligibility] = useState<'everyone' | 'domain' | 'invite'>('everyone');
  const [domainsRaw, setDomainsRaw] = useState('');
  const [invitesRaw, setInvitesRaw] = useState('');
  const [resultsVisibility, setResultsVisibility] = useState<'live' | 'after_vote' | 'after_close'>('live');
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const { data: allPolls = [] } = usePolls();
  const existingGroups = Array.from(new Map(allPolls.filter(p => p.group_id).map(p => [p.group_id!, { id: p.group_id!, title: p.group_title || p.title, count: allPolls.filter(q => q.group_id === p.group_id).length }])).values());
  const [materials, setMaterials] = useState<MaterialDraft[]>([]);
  const [savedId, setSavedId] = useState<string>();
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const createPoll = useCreatePoll();
  const [open, setOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [pollType, setPollType] = useState<Poll['poll_type']>('single_choice');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [optionImages, setOptionImages] = useState<(File | undefined)[]>([]);
  const [optionPreviews, setOptionPreviews] = useState<(string | undefined)[]>([]);
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
    setOptionImages([]); setOptionPreviews([]);
    setEndDate(undefined);
    setVisibility('public');
    setShowResultsBeforeVote(false);
    setMaxSelections(3);
    setMaterials([]); setProposalId('none'); setSavedId(undefined); setGroupChoice('none'); setNewGroupTitle(''); setEligibility('everyone'); setDomainsRaw(''); setInvitesRaw(''); setResultsVisibility('live');
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
    setOptionImages(optionImages.filter((_, i) => i !== index));
    setOptionPreviews(optionPreviews.filter((_, i) => i !== index));
  };

  const handleOptionImage = (index: number, file?: File) => {
    if (file) {
      const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      if (!ok) { toast.error('Choose a JPG, PNG or WebP image'); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error('Choose an image smaller than 5 MB'); return; }
    }
    const imgs = [...optionImages]; imgs[index] = file; setOptionImages(imgs);
    const prev = [...optionPreviews]; prev[index] = file ? URL.createObjectURL(file) : undefined; setOptionPreviews(prev);
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

  const handleSubmit = async () => {
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

    let eligibleDomains: string[] = [];
    let inviteEmails: string[] = [];
    try {
      if (eligibility === 'domain') eligibleDomains = parseDomains(domainsRaw);
      if (eligibility === 'invite') { inviteEmails = parseInviteEmails(invitesRaw); if (!inviteEmails.length) throw new Error('Add at least one email to invite'); }
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Check who can vote'); return; }

    setSaving(true);
    const uploaded: string[] = [];
    try {
    let imagePaths: (string | null)[] = [];
    const usesImages = !savedId && (pollType === 'single_choice' || pollType === 'multiple_choice' || pollType === 'ranked');
    if (usesImages && optionImages.some(Boolean)) {
      const kept = options.map((o, i) => ({ o, f: optionImages[i] })).filter(x => x.o.trim());
      for (const { f } of kept) {
        if (!f) { imagePaths.push(null); continue; }
        const ext = f.type === 'image/png' ? 'png' : f.type === 'image/webp' ? 'webp' : 'jpg';
        const path = `${user!.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(OPTION_IMAGE_BUCKET).upload(path, f, { upsert: false, contentType: f.type });
        if (error) throw new Error(`Image upload failed: ${error.message}`);
        uploaded.push(path); imagePaths.push(path);
      }
    }
    const poll = savedId ? { id: savedId } : await createPoll.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      pollType,
      options: pollType === 'rating' 
        ? ['1', '2', '3', '4', '5'] 
        : options.filter(o => o.trim()),
      optionImages: imagePaths,
      settings: {
        show_results_before_vote: showResultsBeforeVote,
        max_selections: pollType === 'multiple_choice' || pollType === 'ranked' ? maxSelections : undefined,
        rating_scale: pollType === 'rating' ? 5 : undefined,
        thank_you_message: thankYou.trim().slice(0, 140) || undefined,
      },
      endsAt: endDate?.toISOString(),
      visibility,
      proposalId: proposalId === 'none' ? undefined : proposalId,
      eligibility, eligibleDomains, inviteEmails, resultsVisibility,
      group: groupChoice === 'none' ? undefined
        : groupChoice === 'new' ? { id: crypto.randomUUID(), title: newGroupTitle.trim() || title.trim(), order: 1 }
        : (() => { const g = existingGroups.find(x => x.id === groupChoice)!; return { id: g.id, title: g.title, order: g.count + 1 }; })(),
    });
        setSavedId(poll.id);
        await saveParticipationMaterials('poll', poll.id, materials);
        resetForm();
        setOpen(false);
    } catch(e) {
      if (uploaded.length && !savedId) await supabase.storage.from(OPTION_IMAGE_BUCKET).remove(uploaded);
      toast.error(e instanceof Error ? e.message : t('participation.error')); }
    finally { setSaving(false); }
  };

  if (!user || user.is_anonymous) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t('participation.createPoll')}
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
                    {(pollType === 'single_choice' || pollType === 'multiple_choice' || pollType === 'ranked') && (
                      optionPreviews[index] ? (
                        <div className="relative h-10 w-10 shrink-0">
                          <img src={optionPreviews[index]} alt={`Option ${index + 1} image`} className="h-10 w-10 rounded-md object-cover" />
                          <button type="button" aria-label={`Remove image for option ${index + 1}`} onClick={() => handleOptionImage(index)} className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary" title="Add an image to this option">
                          <ImagePlus className="h-4 w-4" />
                          <span className="sr-only">Add image to option {index + 1}</span>
                          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { handleOptionImage(index, e.target.files?.[0]); e.target.value = ''; }} />
                        </label>
                      )
                    )}
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

          <div className="space-y-2">
            <Label>Message after voting (optional)</Label>
            <Input
              maxLength={140}
              placeholder="e.g. 🎉 Asante! Your voice just shaped Sauti Stack"
              value={thankYou}
              onChange={(e) => setThankYou(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave empty to show a random fun message.</p>
          </div>

          {/* Multiple choice settings */}
          {(pollType === 'multiple_choice' || pollType === 'ranked') && (
            <div className="space-y-2">
              <Label>{pollType === 'ranked' ? 'How many places to rank' : 'Maximum selections allowed'}</Label>
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

          <div className="space-y-2">
            <Label>{t('participation.proposal')}</Label>
            <Select value={proposalId} onValueChange={setProposalId} disabled={!!savedId}><SelectTrigger className="min-w-0"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">{t('participation.none')}</SelectItem>{proposals.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 min-w-0">
              <Label>Who can vote</Label>
              <Select value={eligibility} onValueChange={(v) => setEligibility(v as typeof eligibility)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Anyone signed in</SelectItem>
                  <SelectItem value="domain">People with a work email</SelectItem>
                  <SelectItem value="invite">Invited people only</SelectItem>
                </SelectContent>
              </Select>
              {eligibility === 'domain' && <Input placeholder="sautistack.africa, partner.org" value={domainsRaw} onChange={e => setDomainsRaw(e.target.value)} maxLength={500} />}
              {eligibility === 'invite' && <Textarea rows={3} placeholder="One email per line or separated by commas" value={invitesRaw} onChange={e => setInvitesRaw(e.target.value)} />}
            </div>
            <div className="space-y-2 min-w-0">
              <Label>When results are shown</Label>
              <Select value={resultsVisibility} onValueChange={(v) => setResultsVisibility(v as typeof resultsVisibility)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live, as votes come in</SelectItem>
                  <SelectItem value="after_vote">After each person votes</SelectItem>
                  <SelectItem value="after_close">Sealed until the poll closes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Sealed results stop early counts from swaying people.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Add to a poll collection</Label>
            <p className="text-xs text-muted-foreground">Group related questions so people answer them together in one poll.</p>
            <Select value={groupChoice} onValueChange={setGroupChoice} disabled={!!savedId}>
              <SelectTrigger className="min-w-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Standalone poll</SelectItem>
                <SelectItem value="new">Start a new collection</SelectItem>
                {existingGroups.map(g => <SelectItem key={g.id} value={g.id}>{g.title} ({g.count})</SelectItem>)}
              </SelectContent>
            </Select>
            {groupChoice === 'new' && <Input placeholder="Collection name, e.g. Sauti Stack brand vote" maxLength={120} value={newGroupTitle} onChange={e => setNewGroupTitle(e.target.value)} />}
          </div>
          <MaterialEditor value={materials} onChange={setMaterials} />
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
            disabled={saving}
          >
            {t(saving ? 'participation.pending' : 'participation.createPoll')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;
