import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  goal: number;
  label: string;
  variant?: 'default' | 'success' | 'warning';
  showPercentage?: boolean;
}

export default function ProgressBar({
  current,
  goal,
  label,
  variant = 'default',
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <Card className={isComplete ? 'border-success' : ''}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isComplete ? (
                <Trophy className="w-4 h-4 text-success" />
              ) : (
                <Star className="w-4 h-4 text-primary" />
              )}
              <span className="font-medium">{label}</span>
            </div>
            {showPercentage && (
              <span className="text-sm text-muted-foreground">
                {current}/{goal}
              </span>
            )}
          </div>
          <Progress value={percentage} className="h-2" />
          {isComplete && (
            <p className="text-sm text-success font-medium">Completed! 🎉</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
