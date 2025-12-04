import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Heart, ThumbsUp, Laugh, Flame, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  content: string;
  created_at: string;
  reactions: Record<string, number>;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

const REACTION_EMOJIS = [
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '👍', icon: ThumbsUp, label: 'Like' },
  { emoji: '😂', icon: Laugh, label: 'Laugh' },
  { emoji: '🔥', icon: Flame, label: 'Fire' },
  { emoji: '⭐', icon: Star, label: 'Star' },
];

const RadioLiveChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [onlineCount, setOnlineCount] = useState(Math.floor(Math.random() * 50) + 10);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Simulated initial messages
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        user_id: 'system',
        username: 'Peace Radio',
        content: 'Welcome to Peace Radio Live Chat! 🎵',
        created_at: new Date().toISOString(),
        reactions: { '❤️': 5, '🔥': 3 }
      },
      {
        id: '2',
        user_id: 'user1',
        username: 'PeaceLover',
        content: 'Love this station! Great vibes today',
        created_at: new Date().toISOString(),
        reactions: { '👍': 2 }
      },
    ];
    setMessages(initialMessages);

    // Simulate online count changes
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      user_id: user.id,
      username: user.user_metadata?.first_name || 'Anonymous',
      avatar_url: user.user_metadata?.avatar_url,
      content: newMessage,
      created_at: new Date().toISOString(),
      reactions: {}
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsLoading(false);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newReactions = { ...msg.reactions };
        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));
  };

  const sendFloatingReaction = (emoji: string) => {
    const id = Date.now().toString();
    const x = Math.random() * 80 + 10;
    setFloatingReactions(prev => [...prev, { id, emoji, x }]);
    
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  return (
    <Card className="h-[500px] flex flex-col relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
            Live Chat
          </CardTitle>
          <Badge variant="secondary" className="animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            {onlineCount} online
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-3 relative" ref={chatContainerRef}>
        {/* Floating Reactions */}
        <AnimatePresence>
          {floatingReactions.map(reaction => (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 1, y: 0, x: `${reaction.x}%` }}
              animate={{ opacity: 0, y: -200 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute bottom-20 text-3xl pointer-events-none z-10"
              style={{ left: `${reaction.x}%` }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Quick Reactions Bar */}
        <div className="flex gap-1 mb-3 justify-center">
          {REACTION_EMOJIS.map(({ emoji, label }) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="text-lg hover:scale-125 transition-transform"
              onClick={() => sendFloatingReaction(emoji)}
              title={label}
            >
              {emoji}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-3">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2 group"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {message.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm text-primary">
                      {message.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground break-words">{message.content}</p>
                  
                  {/* Message Reactions */}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {Object.entries(message.reactions).map(([emoji, count]) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => addReaction(message.id, emoji)}
                      >
                        {emoji} {count}
                      </Button>
                    ))}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {REACTION_EMOJIS.slice(0, 3).map(({ emoji }) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-xs"
                          onClick={() => addReaction(message.id, emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 mt-3 pt-3 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={user ? "Say something..." : "Sign in to chat"}
            disabled={!user || isLoading}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!user || isLoading || !newMessage.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RadioLiveChat;
