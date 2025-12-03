import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, MessageCircle, Users, User, Wallet, TrendingUp, 
  Bell, Search, Plus, Sparkles, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SocialFeed } from './SocialFeed';
import { DirectMessages } from './DirectMessages';
import { Chatrooms } from './Chatrooms';
import { UserProfile } from './UserProfile';
import { CreatorDashboard } from './CreatorDashboard';
import { Link } from 'react-router-dom';

export const SocialHub = () => {
  const { user, isAnonymous } = useAuth();
  const { t } = useTranslationContext();
  const [activeTab, setActiveTab] = useState('feed');

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
            <Button asChild>
              <Link to="/auth">Sign Up</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth">Log In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Welcome to Peaceverse Social</h2>
                <p className="text-muted-foreground">
                  Connect, share, and earn with our community
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="chatrooms" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Chatrooms</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Earnings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-3">
              <SocialFeed showAll />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trending
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['#PeaceBuilding', '#CommunityUnity', '#YouthVoices', '#SafeSpaces', '#DigitalPeace'].map((tag, i) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                        {tag}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor(Math.random() * 500) + 50} posts
                      </Badge>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Earn Money Card */}
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Earn Money
                  </CardTitle>
                  <CardDescription>
                    Become a creator and monetize your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Receive tips from supporters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Earn from views & engagement
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Win challenge rewards
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={() => setActiveTab('earnings')}
                  >
                    Start Earning
                  </Button>
                </CardContent>
              </Card>

              {/* Suggested Users */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Suggested for You</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Peace Creator {i}</p>
                        <p className="text-xs text-muted-foreground">Suggested for you</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Follow
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <DirectMessages />
        </TabsContent>

        <TabsContent value="chatrooms">
          <Chatrooms />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>

        <TabsContent value="earnings">
          <CreatorDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
