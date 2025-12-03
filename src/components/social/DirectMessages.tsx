import { useState, useEffect, useRef } from 'react';
import { useConversations, useDirectMessages, useSendDirectMessage } from '@/hooks/useSocialNetwork';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-typed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, ArrowLeft, Search, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const DirectMessages = () => {
  const { user } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: loadingConversations, refetch } = useConversations();
  const { data: messages, isLoading: loadingMessages } = useDirectMessages(selectedPartner || '');
  const sendMessage = useSendDirectMessage();

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('direct-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedPartner) return;

    sendMessage.mutate({
      receiverId: selectedPartner,
      content: newMessage.trim()
    });
    setNewMessage('');
  };

  const filteredConversations = conversations?.filter(conv =>
    conv.partner?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.partner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations?.find(c => c.partnerId === selectedPartner);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className={cn("md:col-span-1", selectedPartner && "hidden md:block")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[480px]">
            {loadingConversations ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start chatting with someone!</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations?.map((conv) => (
                  <motion.button
                    key={conv.partnerId}
                    onClick={() => setSelectedPartner(conv.partnerId)}
                    className={cn(
                      "w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left",
                      selectedPartner === conv.partnerId && "bg-muted"
                    )}
                    whileHover={{ x: 4 }}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conv.partner?.avatar_url} />
                        <AvatarFallback>
                          {conv.partner?.display_name?.[0] || conv.partner?.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conv.partner?.display_name || conv.partner?.username || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage?.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.lastMessage?.created_at), { addSuffix: false })}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className={cn("md:col-span-2", !selectedPartner && "hidden md:flex md:items-center md:justify-center")}>
        {!selectedPartner ? (
          <div className="text-center text-muted-foreground p-8">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose someone to start chatting with</p>
          </div>
        ) : (
          <>
            <CardHeader className="border-b p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedPartner(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation?.partner?.avatar_url} />
                  <AvatarFallback>
                    {selectedConversation?.partner?.display_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {selectedConversation?.partner?.display_name || selectedConversation?.partner?.username}
                  </p>
                  <p className="text-sm text-muted-foreground">Active now</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[480px]">
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={cn("flex", i % 2 === 0 && "justify-end")}>
                        <div className="h-10 w-48 bg-muted rounded-xl animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="space-y-4">
                      {messages?.map((msg, index) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex",
                            msg.sender_id === user?.id && "justify-end"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2",
                              msg.sender_id === user?.id
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            <p>{msg.content}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </AnimatePresence>
                )}
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!newMessage.trim() || sendMessage.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};
