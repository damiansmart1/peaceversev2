import { useState } from 'react';
import { useUserWallet, useCreatorEarnings, useSocialProfile } from '@/hooks/useSocialNetwork';
import { useAuth } from '@/contexts/AuthContext';
import { WithdrawDialog } from './WithdrawDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DollarSign, TrendingUp, Eye, Heart, Users, Award, 
  Wallet, ArrowUpRight, ArrowDownRight, Clock, Gift,
  Star, Zap, Crown, Target, Trophy
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CREATOR_TIERS = [
  { name: 'Starter', minEarnings: 0, color: 'bg-slate-500', icon: Star, perks: ['Basic analytics', 'Tips enabled'] },
  { name: 'Bronze', minEarnings: 50, color: 'bg-amber-600', icon: Award, perks: ['Priority support', 'Custom profile badge', 'Bonus 5% on tips'] },
  { name: 'Silver', minEarnings: 200, color: 'bg-slate-400', icon: Trophy, perks: ['Featured creator status', 'Bonus 10% on tips', 'Early access features'] },
  { name: 'Gold', minEarnings: 500, color: 'bg-yellow-500', icon: Crown, perks: ['Verification badge', 'Bonus 15% on tips', 'Revenue sharing'] },
  { name: 'Platinum', minEarnings: 1000, color: 'bg-purple-500', icon: Zap, perks: ['Top creator status', 'Bonus 20% on tips', 'Direct brand partnerships'] },
];

export const CreatorDashboard = () => {
  const { user } = useAuth();
  const { data: wallet, isLoading: loadingWallet } = useUserWallet();
  const { data: earnings, isLoading: loadingEarnings } = useCreatorEarnings();
  const { data: profile } = useSocialProfile();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  // Mock chart data - in real app this would come from aggregated earnings
  const chartData = [
    { name: 'Mon', earnings: 12 },
    { name: 'Tue', earnings: 19 },
    { name: 'Wed', earnings: 8 },
    { name: 'Thu', earnings: 25 },
    { name: 'Fri', earnings: 32 },
    { name: 'Sat', earnings: 45 },
    { name: 'Sun', earnings: 28 },
  ];

  const currentTier = CREATOR_TIERS.reduce((acc, tier) => {
    if ((wallet?.total_earned || 0) >= tier.minEarnings) return tier;
    return acc;
  }, CREATOR_TIERS[0]);

  const nextTier = CREATOR_TIERS.find(t => t.minEarnings > (wallet?.total_earned || 0));
  const progressToNextTier = nextTier 
    ? ((wallet?.total_earned || 0) / nextTier.minEarnings) * 100 
    : 100;

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'tip': return DollarSign;
      case 'view_bonus': return Eye;
      case 'engagement_bonus': return Heart;
      case 'challenge_reward': return Trophy;
      default: return Gift;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'tip': return 'text-green-500 bg-green-500/10';
      case 'view_bonus': return 'text-blue-500 bg-blue-500/10';
      case 'engagement_bonus': return 'text-pink-500 bg-pink-500/10';
      case 'challenge_reward': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-purple-500 bg-purple-500/10';
    }
  };

  if (loadingWallet || loadingEarnings) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Creator Tier Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn("overflow-hidden", currentTier.color)}>
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <currentTier.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Creator Tier</p>
                  <h2 className="text-2xl font-bold">{currentTier.name} Creator</h2>
                </div>
              </div>
              {nextTier && (
                <div className="text-right">
                  <p className="text-sm opacity-80">Next: {nextTier.name}</p>
                  <p className="font-semibold">${(nextTier.minEarnings - (wallet?.total_earned || 0)).toFixed(2)} to go</p>
                </div>
              )}
            </div>
            {nextTier && (
              <div className="mt-4">
                <Progress value={progressToNextTier} className="h-2 bg-white/20" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Wallet className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold">${wallet?.balance?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">${wallet?.total_earned?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Followers</p>
                  <p className="text-2xl font-bold">{profile?.followersCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{profile?.total_views || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings This Week</CardTitle>
          <CardDescription>Your daily earnings breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#earningsGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tier Perks & Recent Earnings */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Tier Perks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Your Perks
            </CardTitle>
            <CardDescription>Benefits at {currentTier.name} tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {currentTier.perks.map((perk, index) => (
                <motion.li
                  key={perk}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{perk}</span>
                </motion.li>
              ))}
            </ul>
            {nextTier && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Unlock at {nextTier.name}:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {nextTier.perks.map(perk => (
                    <li key={perk} className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Earnings
            </CardTitle>
            <CardDescription>Your latest income</CardDescription>
          </CardHeader>
          <CardContent>
            {earnings?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No earnings yet</p>
                <p className="text-sm mt-1">Start creating content to earn!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {earnings?.slice(0, 5).map((earning, index) => {
                  const Icon = getSourceIcon(earning.source);
                  return (
                    <motion.div
                      key={earning.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className={cn("p-2 rounded-lg", getSourceColor(earning.source))}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">{earning.source.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(earning.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <span className="font-bold text-green-500">
                        +${earning.amount.toFixed(2)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>Transfer your earnings to your bank via Paystack or mobile money</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Available for withdrawal</p>
              <p className="text-3xl font-bold">${wallet?.balance?.toFixed(2) || '0.00'}</p>
            </div>
            <Button 
              disabled={(wallet?.balance || 0) < 10}
              onClick={() => setWithdrawDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              Withdraw via Paystack
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Minimum withdrawal: $10.00 USD. Processing via Paystack takes 24-48 hours.
          </p>
        </CardContent>
      </Card>

      <WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        walletBalance={wallet?.balance || 0}
      />
    </div>
  );
};
