import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWeeklyChallenges, useUserChallengeSubmissions, useSubmitChallenge } from '@/hooks/useGamification';
import { Calendar, Trophy, Users, Upload, CheckCircle2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const WeeklyChallengesSection = () => {
  const { data: challenges, isLoading: challengesLoading } = useWeeklyChallenges();
  const { data: submissions } = useUserChallengeSubmissions();
  const submitChallenge = useSubmitChallenge();

  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionType, setSubmissionType] = useState<'text' | 'audio' | 'video' | 'image'>('text');

  const handleSubmit = () => {
    if (!selectedChallenge) return;

    submitChallenge.mutate({
      challenge_id: selectedChallenge.id,
      submission_type: submissionType,
      submission_text: submissionText
    });

    setSubmissionText('');
    setSelectedChallenge(null);
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'storytelling': return '📖';
      case 'artwork': return '🎨';
      case 'community_activity': return '🤝';
      case 'youth_diplomacy': return '🕊️';
      default: return '🌟';
    }
  };

  const hasSubmitted = (challengeId: string) => {
    return submissions?.some(s => s.challenge_id === challengeId);
  };

  if (challengesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Active Challenges</h3>
        <p className="text-muted-foreground">Check back soon for new peace-building challenges!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Weekly Challenges</h2>
          <p className="text-muted-foreground">Join missions for peace and earn rewards</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {challenges.map((challenge) => {
          const isSubmitted = hasSubmitted(challenge.id);
          const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <Card key={challenge.id} className="p-6 bg-gradient-to-br from-card to-accent/5 border-border/40 shadow-story hover:shadow-elevated transition-all duration-300">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-3xl shadow-peace flex-shrink-0">
                  {getChallengeIcon(challenge.challenge_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-2">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="text-foreground font-medium">{challenge.points_reward} Peace Points</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{daysLeft} days left</span>
                </div>

                {isSubmitted ? (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Submitted - Under Review</span>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full rounded-full shadow-sm"
                        onClick={() => setSelectedChallenge(challenge)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Submit Challenge Entry</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>

                        <div>
                          <Label htmlFor="submission-type">Submission Type</Label>
                          <select
                            id="submission-type"
                            className="w-full mt-1 rounded-lg border border-border bg-background p-2"
                            value={submissionType}
                            onChange={(e) => setSubmissionType(e.target.value as any)}
                          >
                            <option value="text">Text Story</option>
                            <option value="audio">Audio Recording</option>
                            <option value="video">Video</option>
                            <option value="image">Image/Artwork</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="submission">Your Submission</Label>
                          <Textarea
                            id="submission"
                            placeholder="Share your story or describe your contribution..."
                            className="mt-1 min-h-32"
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                          />
                        </div>

                        <Button 
                          className="w-full rounded-full"
                          onClick={handleSubmit}
                          disabled={!submissionText.trim() || submitChallenge.isPending}
                        >
                          Submit Entry
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyChallengesSection;
