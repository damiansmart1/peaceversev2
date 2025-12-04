import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslationContext } from '@/components/TranslationProvider';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, MessageCircle, Users, User, Wallet, TrendingUp, 
  Plus, Sparkles, DollarSign, Settings, Shield, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SocialFeed } from './SocialFeed';
import { DirectMessages } from './DirectMessages';
import { Chatrooms } from './Chatrooms';
import { UserProfile } from './UserProfile';
import { CreatorDashboard } from './CreatorDashboard';
import { ContentManager } from './ContentManager';
import { PrivacySettings } from './PrivacySettings';
import { ContentCreator } from './ContentCreator';
import { UserSearch } from './UserSearch';
import { QuickPostCreator } from './QuickPostCreator';
import { Link } from 'react-router-dom';

export const SocialHub = () => {
  const { user, isAnonymous } = useAuth();
  const { t } = useTranslationContext();
  const { data: profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState('feed');
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Extract first name from display_name or email
  const getFirstName = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ')[0];
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  const firstName = getFirstName();

  if (!user || isAnonymous) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
          <p className="text-muted-foreground mb-6">
            Sign up to connect with others, share content, join chatrooms, and earn money as a creator!
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild><Link to="/auth">Sign Up</Link></Button>
            <Button variant="outline" asChild><Link to="/auth">Log In</Link></Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Welcome back, <span className="text-primary">{firstName}</span>! 👋
                </h2>
                <p className="text-muted-foreground">Connect, share, and earn with our community</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
                  <Settings className="h-4 w-4 mr-2" />Settings
                </Button>
                <Button size="sm" onClick={() => setShowContentCreator(true)}>
                  <Plus className="h-4 w-4 mr-2" />Create Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 mb-6 h-auto p-1">
          <TabsTrigger value="feed" className="flex flex-col md:flex-row items-center gap-1 py-2">
            <Home className="h-4 w-4" /><span className="text-xs md:text-sm">Feed</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex flex-col md:flex-row items-center gap-1 py-2">
            <MessageCircle className="h-4 w-4" /><span className="text-xs md:text-sm">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="chatrooms" className="flex flex-col md:flex-row items-center gap-1 py-2">
            <Users className="h-4 w-4" /><span className="text-xs md:text-sm">Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex flex-col md:flex-row items-center gap-1 py-2">
            <User className="h-4 w-4" /><span className="text-xs md:text-sm">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex flex-col md:flex-row items-center gap-1 py-2">
            <FileText className="h-4 w-4" /><span className="text-xs md:text-sm">Content</span>
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex flex-col md:flex-row items-center gap-1 py-2">
            <Wallet className="h-4 w-4" /><span className="text-xs md:text-sm">Earnings</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col md:flex-row items-center gap-1 py-2">
            <Shield className="h-4 w-4" /><span className="text-xs md:text-sm">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* Quick Post Creator */}
              <QuickPostCreator onOpenFullCreator={() => setShowContentCreator(true)} />
              
              {/* Social Feed */}
              <SocialFeed showAll />
            </div>
            <div className="space-y-6">
              {/* User Search */}
              <Card>
                <div className="p-4 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Find People
                  </h3>
                </div>
                <div className="p-4">
                  <UserSearch 
                    onSelectUser={(userId) => {
                      setSelectedUserId(userId);
                      setActiveTab('profile');
                    }}
                  />
                </div>
              </Card>
              
              {/* Trending */}
              <Card>
                <div className="p-4 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trending
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {['#PeaceBuilding', '#CommunityUnity', '#YouthVoices'].map((tag) => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{tag}</span>
                      <Badge variant="secondary" className="text-xs">{Math.floor(Math.random() * 500) + 50} posts</Badge>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Earn Money Card */}
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <div className="p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Earn Money
                  </h3>
                </div>
                <div className="p-4 pt-0">
                  <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => setShowContentCreator(true)}>
                    Start Creating
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="messages"><DirectMessages /></TabsContent>
        <TabsContent value="chatrooms"><Chatrooms /></TabsContent>
        <TabsContent value="profile">
          <UserProfile userId={selectedUserId || undefined} />
        </TabsContent>
        <TabsContent value="content"><ContentManager /></TabsContent>
        <TabsContent value="earnings"><CreatorDashboard /></TabsContent>
        <TabsContent value="settings"><PrivacySettings /></TabsContent>
      </Tabs>

      <ContentCreator open={showContentCreator} onOpenChange={setShowContentCreator} />
    </div>
  );
};
