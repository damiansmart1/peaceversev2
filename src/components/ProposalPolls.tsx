import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useProposalPolls, useUserPollResponse, useSubmitPollResponse } from '@/hooks/useProposalPolls';
import { BarChart3, Users } from 'lucide-react';

interface ProposalPollsProps {
  proposalId: string;
}

const ProposalPolls = ({ proposalId }: ProposalPollsProps) => {
  const { data: polls, isLoading } = useProposalPolls(proposalId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading polls...</div>;
  }

  if (!polls || polls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Polls & Surveys</h3>
      </div>
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
};

const PollCard = ({ poll }: { poll: any }) => {
  const [displayAnonymous, setDisplayAnonymous] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { data: userResponse } = useUserPollResponse(poll.id);
  const submitResponse = useSubmitPollResponse();

  const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
  const hasVoted = !!userResponse;

  const handleSubmit = () => {
    if (selectedOption === null) return;
    submitResponse.mutate({
      pollId: poll.id,
      optionIndex: selectedOption,
      displayAnonymous,
    });
  };

  const isPollActive = poll.is_active && (!poll.ends_at || new Date(poll.ends_at) > new Date());

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h4 className="text-lg font-medium mb-1">{poll.question}</h4>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {totalVotes} {totalVotes === 1 ? 'response' : 'responses'}
          </span>
          {!isPollActive && <span className="text-amber-600">Poll ended</span>}
        </div>
      </div>

      {!hasVoted && isPollActive ? (
        <div className="space-y-4">
          <RadioGroup value={selectedOption?.toString()} onValueChange={(val) => setSelectedOption(parseInt(val))}>
            {poll.options.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${poll.id}-${index}`} />
                <Label htmlFor={`option-${poll.id}-${index}`} className="cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center gap-2">
            <Switch
              id={`anonymous-${poll.id}`}
              checked={displayAnonymous}
              onCheckedChange={setDisplayAnonymous}
            />
            <Label htmlFor={`anonymous-${poll.id}`} className="text-sm cursor-pointer">
              Vote anonymously
            </Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedOption === null || submitResponse.isPending}
            className="w-full"
          >
            Submit Response
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {poll.options.map((option: any, index: number) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            const isUserChoice = userResponse?.option_index === index;

            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={isUserChoice ? 'font-medium text-primary' : ''}>
                    {option.text} {isUserChoice && '(Your choice)'}
                  </span>
                  <span className="text-muted-foreground">
                    {option.votes} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
          {hasVoted && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Thank you for participating!
              {userResponse?.display_anonymous && ' (voted anonymously)'}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProposalPolls;
