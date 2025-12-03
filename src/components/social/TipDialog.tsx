import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTipContent } from '@/hooks/useSocialNetwork';
import { DollarSign, Heart, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: any;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1550 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 153 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rate: 15.5 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.5 },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', rate: 3750 },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', rate: 2500 },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', rate: 1280 },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', rate: 56 },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA', rate: 610 },
];

const getTipAmounts = (currency: typeof CURRENCIES[0]) => [
  { amount: Math.round(1 * currency.rate), label: `${currency.symbol}${Math.round(1 * currency.rate)}`, icon: Heart, usd: 1 },
  { amount: Math.round(5 * currency.rate), label: `${currency.symbol}${Math.round(5 * currency.rate)}`, icon: Sparkles, usd: 5 },
  { amount: Math.round(10 * currency.rate), label: `${currency.symbol}${Math.round(10 * currency.rate)}`, icon: Zap, usd: 10 },
  { amount: Math.round(25 * currency.rate), label: `${currency.symbol}${Math.round(25 * currency.rate)}`, icon: DollarSign, usd: 25 },
];

export const TipDialog = ({ open, onOpenChange, content }: TipDialogProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const tipMutation = useTipContent();

  const tipAmounts = getTipAmounts(selectedCurrency);

  const handleCurrencyChange = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    setSelectedCurrency(currency);
    setCustomAmount('');
  };

  const handleTip = () => {
    const localAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!localAmount || localAmount <= 0 || !content) return;

    // Convert to USD for storage
    const usdAmount = localAmount / selectedCurrency.rate;

    tipMutation.mutate({
      contentId: content.id,
      creatorId: content.user_id,
      amount: usdAmount,
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

  const finalLocalAmount = customAmount ? parseFloat(customAmount) : selectedAmount * selectedCurrency.rate;
  const finalUsdAmount = finalLocalAmount / selectedCurrency.rate;

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
          {/* Currency Selector */}
          <div className="space-y-2">
            <Label>Select Currency</Label>
            <Select value={selectedCurrency.code} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <span className="flex items-center gap-2">
                      <span className="font-mono">{currency.symbol}</span>
                      <span>{currency.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {tipAmounts.map(({ amount, label, icon: Icon, usd }) => (
              <Button
                key={usd}
                variant={selectedAmount === usd && !customAmount ? "default" : "outline"}
                onClick={() => {
                  setSelectedAmount(usd);
                  setCustomAmount('');
                }}
                className={cn(
                  "flex flex-col h-auto py-3",
                  selectedAmount === usd && !customAmount && "ring-2 ring-primary"
                )}
              >
                <Icon className="h-4 w-4 mb-1" />
                <span className="font-bold text-xs">{label}</span>
              </Button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label>Custom Amount ({selectedCurrency.code})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {selectedCurrency.symbol}
              </span>
              <Input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-10"
                min="0"
                step="1"
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
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tip Amount</span>
              <span className="font-bold text-lg">
                {selectedCurrency.symbol}{finalLocalAmount?.toFixed(selectedCurrency.rate > 100 ? 0 : 2) || '0'}
              </span>
            </div>
            {selectedCurrency.code !== 'USD' && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Equivalent</span>
                <span className="text-muted-foreground">≈ ${finalUsdAmount?.toFixed(2) || '0.00'} USD</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleTip}
            disabled={!finalLocalAmount || finalLocalAmount <= 0 || tipMutation.isPending}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {tipMutation.isPending ? 'Sending...' : `Send ${selectedCurrency.symbol}${finalLocalAmount?.toFixed(selectedCurrency.rate > 100 ? 0 : 2) || '0'} Tip`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
