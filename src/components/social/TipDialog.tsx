import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTipContent } from '@/hooks/useSocialNetwork';
import { DollarSign, Heart, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: any;
}

const tipAmounts = [
  { amount: 1, label: '$1', icon: Heart },
  { amount: 5, label: '$5', icon: Sparkles },
  { amount: 10, label: '$10', icon: Zap },
  { amount: 25, label: '$25', icon: DollarSign },
];

export const TipDialog = ({ open, onOpenChange, content }: TipDialogProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const tipMutation = useTipContent();

  const handleTip = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount <= 0 || !content) return;

    tipMutation.mutate({
      contentId: content.id,
      creatorId: content.user_id,
      amount,
      message: message || undefined
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setSelectedAmount(5);
        setCustomAmount('');
        setMessage('');
      }
    });
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Support this Creator
          </DialogTitle>
          <DialogDescription>
            Show your appreciation with a tip. 100% goes directly to the creator.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {tipAmounts.map(({ amount, label, icon: Icon }) => (
              <Button
                key={amount}
                variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={cn(
                  "flex flex-col h-auto py-4",
                  selectedAmount === amount && !customAmount && "ring-2 ring-primary"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="font-bold">{label}</span>
              </Button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label>Custom Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                }}
                className="pl-7"
                min="0.50"
                step="0.50"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Add a message (optional)</Label>
            <Textarea
              placeholder="Say something nice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tip Amount</span>
              <span className="font-bold text-lg">${finalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <Button
            onClick={handleTip}
            disabled={!finalAmount || finalAmount <= 0 || tipMutation.isPending}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {tipMutation.isPending ? 'Sending...' : `Send $${finalAmount?.toFixed(2) || '0.00'} Tip`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
