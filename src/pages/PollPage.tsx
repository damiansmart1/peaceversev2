import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import PollCard from '@/components/polls/PollCard';
import { usePollById } from '@/hooks/usePolls';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PollPage = () => {
  const { id = '' } = useParams();
  const { data: poll, isLoading, error } = usePollById(id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto max-w-2xl px-4 pt-24 pb-16 space-y-4">
        <Button asChild variant="ghost" size="sm"><Link to="/proposals"><ArrowLeft className="h-4 w-4 mr-1" />All polls & proposals</Link></Button>
        {isLoading ? (
          <div className="h-80 animate-pulse rounded-2xl bg-muted/60" />
        ) : error || !poll ? (
          <div className="rounded-2xl border p-8 text-center space-y-2">
            <h1 className="text-lg font-semibold">This poll isn't available</h1>
            <p className="text-sm text-muted-foreground">It may have been removed, or it's limited to invited members. Try signing in.</p>
            <Button asChild><Link to="/proposals">Browse polls</Link></Button>
          </div>
        ) : (
          <PollCard poll={poll} showFullResults />
        )}
      </main>
    </div>
  );
};

export default PollPage;
