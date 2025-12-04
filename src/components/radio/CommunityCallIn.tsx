import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, PhoneCall, PhoneOff, Mic, MicOff, 
  Hand, Clock, Users, MessageSquare, CheckCircle2, XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CallRequest {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  topic: string;
  status: 'pending' | 'approved' | 'live' | 'completed' | 'rejected';
  requestedAt: string;
  queuePosition?: number;
}

const CommunityCallIn = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [isInQueue, setIsInQueue] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callRequests, setCallRequests] = useState<CallRequest[]>([
    {
      id: '1',
      userId: 'user1',
      username: 'PeaceAdvocate',
      topic: 'Community Reconciliation Success Story',
      status: 'live',
      requestedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'user2',
      username: 'YouthLeader',
      topic: 'Youth Peace Initiative Updates',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      queuePosition: 1,
    },
    {
      id: '3',
      userId: 'user3',
      username: 'CommunityElder',
      topic: 'Traditional Conflict Resolution',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      queuePosition: 2,
    },
  ]);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for live calls
  useEffect(() => {
    if (isLive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const requestCallIn = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to request a call-in",
        variant: "destructive"
      });
      return;
    }

    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your call-in",
        variant: "destructive"
      });
      return;
    }

    const newRequest: CallRequest = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.user_metadata?.first_name || 'Anonymous',
      avatar: user.user_metadata?.avatar_url,
      topic: topic,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      queuePosition: callRequests.filter(r => r.status === 'pending').length + 1,
    };

    setCallRequests(prev => [...prev, newRequest]);
    setIsInQueue(true);
    setTopic('');
    setMessage('');

    toast({
      title: "Request submitted!",
      description: `You are #${newRequest.queuePosition} in the queue`,
    });
  };

  const cancelRequest = () => {
    setCallRequests(prev => prev.filter(r => r.userId !== user?.id || r.status !== 'pending'));
    setIsInQueue(false);
    toast({
      title: "Request cancelled",
      description: "You have left the call-in queue",
    });
  };

  const endCall = () => {
    setIsLive(false);
    setIsMuted(false);
    toast({
      title: "Call ended",
      description: `Thanks for sharing! Call duration: ${formatDuration(callDuration)}`,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const currentLiveCaller = callRequests.find(r => r.status === 'live');
  const pendingQueue = callRequests.filter(r => r.status === 'pending');
  const userRequest = callRequests.find(r => r.userId === user?.id && r.status === 'pending');

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Call-in Request Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Request to Call In
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLive ? (
            // Live Call Interface
            <div className="text-center space-y-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <PhoneCall className="w-12 h-12 text-green-500" />
              </motion.div>
              
              <div>
                <Badge variant="default" className="bg-green-500 animate-pulse">
                  LIVE ON AIR
                </Badge>
                <p className="text-2xl font-bold mt-2">{formatDuration(callDuration)}</p>
                <p className="text-muted-foreground">You're live! Share your story.</p>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endCall}
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              </div>
            </div>
          ) : isInQueue ? (
            // In Queue View
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-20 h-20 mx-auto rounded-full border-4 border-primary border-t-transparent"
              />
              
              <div>
                <p className="text-xl font-medium">You're in the queue!</p>
                <p className="text-muted-foreground">
                  Position: #{userRequest?.queuePosition || '?'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Topic: {userRequest?.topic}
                </p>
              </div>

              <Button variant="outline" onClick={cancelRequest}>
                <XCircle className="w-4 h-4 mr-2" />
                Leave Queue
              </Button>
            </div>
          ) : (
            // Request Form
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  What would you like to talk about?
                </label>
                <Input
                  placeholder="Enter your topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Additional message (optional)
                </label>
                <Textarea
                  placeholder="Share some context about your topic..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={requestCallIn}
                disabled={!user}
              >
                <Hand className="w-4 h-4 mr-2" />
                {user ? "Request to Call In" : "Sign in to Call In"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Our host will review your request and bring you on air
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Queue Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Call-in Queue
            </CardTitle>
            <Badge variant="outline">
              {pendingQueue.length} waiting
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Currently Live */}
          {currentLiveCaller && (
            <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500">NOW LIVE</Badge>
                <span className="text-sm text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  On air
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={currentLiveCaller.avatar} />
                  <AvatarFallback>
                    {currentLiveCaller.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentLiveCaller.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentLiveCaller.topic}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Queue */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              <AnimatePresence>
                {pendingQueue.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      #{request.queuePosition}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.avatar} />
                      <AvatarFallback>
                        {request.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {request.username}
                        {request.userId === user?.id && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {request.topic}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {pendingQueue.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No callers in queue</p>
                  <p className="text-sm">Be the first to call in!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityCallIn;
