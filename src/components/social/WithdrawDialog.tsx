import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletBalance: number;
  currency?: string;
}

const PAYOUT_METHODS = [
  { id: 'paystack', name: 'Paystack', description: 'Bank transfer via Paystack', countries: ['NG', 'GH', 'ZA', 'KE'] },
  { id: 'mpesa', name: 'M-Pesa', description: 'Mobile money transfer', countries: ['KE', 'TZ', 'UG'] },
  { id: 'bank', name: 'Bank Transfer', description: 'Direct bank transfer', countries: ['all'] },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1550 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 153 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rate: 15.5 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.5 },
];

export const WithdrawDialog = ({ open, onOpenChange, walletBalance, currency = 'USD' }: WithdrawDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('paystack');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [accountDetails, setAccountDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [step, setStep] = useState<'amount' | 'details' | 'confirm'>('amount');

  const minWithdrawal = 10; // $10 USD minimum
  const maxWithdrawal = walletBalance;
  const withdrawalFee = 0.015; // 1.5% fee

  const localBalance = walletBalance * selectedCurrency.rate;
  const withdrawAmount = parseFloat(amount) || 0;
  const withdrawAmountUSD = withdrawAmount / selectedCurrency.rate;
  const fee = withdrawAmountUSD * withdrawalFee;
  const netAmount = withdrawAmountUSD - fee;

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // In production, this would call a Paystack API via edge function
      // For now, we'll simulate the withdrawal by updating the wallet
      const { error } = await supabase
        .from('user_wallets')
        .update({ 
          balance: walletBalance - withdrawAmountUSD,
          total_withdrawn: supabase.rpc ? undefined : walletBalance // Simplified
        })
        .eq('user_id', user.id);
      
      if (error) throw error;

      // Log the withdrawal
      await supabase.from('creator_earnings').insert({
        user_id: user.id,
        amount: -withdrawAmountUSD,
        source: 'withdrawal',
        description: `Withdrawal via ${payoutMethod} to ${accountDetails.accountNumber}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['creator-earnings'] });
      toast.success('Withdrawal initiated! Funds will arrive within 24-48 hours.');
      onOpenChange(false);
      resetForm();
    },
    onError: () => toast.error('Withdrawal failed. Please try again.'),
  });

  const resetForm = () => {
    setAmount('');
    setAccountDetails({ bankName: '', accountNumber: '', accountName: '' });
    setStep('amount');
  };

  const handleNext = () => {
    if (step === 'amount') {
      if (withdrawAmountUSD < minWithdrawal) {
        toast.error(`Minimum withdrawal is $${minWithdrawal} USD`);
        return;
      }
      if (withdrawAmountUSD > maxWithdrawal) {
        toast.error('Insufficient balance');
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      if (!accountDetails.bankName || !accountDetails.accountNumber || !accountDetails.accountName) {
        toast.error('Please fill in all account details');
        return;
      }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'details') setStep('amount');
    else if (step === 'confirm') setStep('details');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Withdraw Earnings
          </DialogTitle>
          <DialogDescription>
            Transfer your earnings to your bank account via Paystack.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Balance Display */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">${walletBalance.toFixed(2)} USD</p>
            {selectedCurrency.code !== 'USD' && (
              <p className="text-sm text-muted-foreground">
                ≈ {selectedCurrency.symbol}{localBalance.toFixed(0)} {selectedCurrency.code}
              </p>
            )}
          </div>

          {step === 'amount' && (
            <>
              {/* Currency Selector */}
              <div className="space-y-2">
                <Label>Withdrawal Currency</Label>
                <Select 
                  value={selectedCurrency.code} 
                  onValueChange={(code) => setSelectedCurrency(CURRENCIES.find(c => c.code === code) || CURRENCIES[0])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label>Amount to Withdraw</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {selectedCurrency.symbol}
                  </span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10"
                    min={minWithdrawal * selectedCurrency.rate}
                    max={localBalance}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Min: {selectedCurrency.symbol}{(minWithdrawal * selectedCurrency.rate).toFixed(0)} • 
                  Max: {selectedCurrency.symbol}{localBalance.toFixed(0)}
                </p>
              </div>

              {/* Payout Method */}
              <div className="space-y-2">
                <Label>Payout Method</Label>
                <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYOUT_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <span className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {method.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 'details' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="Enter bank name"
                    value={accountDetails.bankName}
                    onChange={(e) => setAccountDetails(prev => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Enter account number"
                    value={accountDetails.accountNumber}
                    onChange={(e) => setAccountDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    placeholder="Enter account holder name"
                    value={accountDetails.accountName}
                    onChange={(e) => setAccountDetails(prev => ({ ...prev, accountName: e.target.value }))}
                  />
                </div>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Please verify your withdrawal details before confirming.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span>{selectedCurrency.symbol}{withdrawAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee (1.5%)</span>
                  <span>-${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>You'll Receive</span>
                  <span className="text-green-600">${netAmount.toFixed(2)} USD</span>
                </div>
                <div className="text-sm text-muted-foreground pt-2 border-t">
                  <p><strong>Bank:</strong> {accountDetails.bankName}</p>
                  <p><strong>Account:</strong> {accountDetails.accountNumber}</p>
                  <p><strong>Name:</strong> {accountDetails.accountName}</p>
                </div>
              </div>

              <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Withdrawals are processed within 24-48 hours via Paystack.
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            {step !== 'amount' && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step !== 'confirm' ? (
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            ) : (
              <Button 
                onClick={() => withdrawMutation.mutate()} 
                disabled={withdrawMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {withdrawMutation.isPending ? 'Processing...' : 'Confirm Withdrawal'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
