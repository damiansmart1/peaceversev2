import { useState, useEffect, useRef } from 'react';
import { useChatrooms, useChatroomMembers, useChatroomMessages, useJoinChatroom, useSendChatroomMessage, useCreateChatroom } from '@/hooks/useSocialNetwork';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-typed';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, Send, ArrowLeft, Plus, MapPin, Hash, Globe, Heart, Gamepad2, Music, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: Globe },
  { value: 'general', label: 'General', icon: Hash },
  { value: 'peace', label: 'Peacebuilding', icon: Heart },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'education', label: 'Education', icon: BookOpen },
  { value: 'local', label: 'Local', icon: MapPin },
];

export const Chatrooms = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatrooms, isLoading: loadingRooms, refetch: refetchRooms } = useChatrooms(selectedCategory);
  const { data: members } = useChatroomMembers(selectedRoom || '');
  const { data: messages, refetch: refetchMessages } = useChatroomMessages(selectedRoom || '');
  const joinChatroom = useJoinChatroom();
  const sendMessage = useSendChatroomMessage();
  const createChatroom = useCreateChatroom();

  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    category: 'general',
    location_region: ''
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedRoom) return;

    const channel = supabase
      .channel(`chatroom-${selectedRoom}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatroom_messages',
          filter: `chatroom_id=eq.${selectedRoom}`
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom, refetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = (roomId: string) => {
    joinChatroom.mutate(roomId, {
      onSuccess: () => setSelectedRoom(roomId)
    });
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    sendMessage.mutate({
      chatroomId: selectedRoom,
      content: newMessage.trim()
    });
    setNewMessage('');
  };

  const handleCreateRoom = () => {
    createChatroom.mutate(newRoom, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        setNewRoom({ name: '', description: '', category: 'general', location_region: '' });
        refetchRooms();
      }
    });
  };

  const selectedChatroom = chatrooms?.find(r => r.id === selectedRoom);
  const isMember = members?.some(m => m.user_id === user?.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[700px]">
      {/* Rooms List */}
      <Card className={cn("lg:col-span-1", selectedRoom && "hidden lg:block")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Chatrooms
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Chatroom</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Room Name</Label>
                    <Input
                      placeholder="Give your room a name..."
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="What's this room about?"
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newRoom.category}
                      onValueChange={(value) => setNewRoom({ ...newRoom, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="h-4 w-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location/Region (optional)</Label>
                    <Input
                      placeholder="e.g. Nairobi, Kenya"
                      value={newRoom.location_region}
                      onChange={(e) => setNewRoom({ ...newRoom, location_region: e.target.value })}
                    />
                  </div>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!newRoom.name.trim() || createChatroom.isPending}
                    className="w-full"
                  >
                    {createChatroom.isPending ? 'Creating...' : 'Create Room'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Category Filter */}
          <div className="px-4 pb-3 overflow-x-auto">
            <div className="flex gap-2">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="shrink-0"
                >
                  <cat.icon className="h-3 w-3 mr-1" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-[520px]">
            {loadingRooms ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-4 bg-muted rounded-lg animate-pulse">
                    <div className="h-4 w-32 bg-muted-foreground/20 rounded mb-2" />
                    <div className="h-3 w-48 bg-muted-foreground/20 rounded" />
                  </div>
                ))}
              </div>
            ) : chatrooms?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No chatrooms in this category</p>
                <Button
                  variant="link"
                  onClick={() => setCreateDialogOpen(true)}
                  className="mt-2"
                >
                  Create one!
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {chatrooms?.map((room) => (
                  <motion.button
                    key={room.id}
                    onClick={() => handleJoinRoom(room.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-all hover:shadow-md",
                      selectedRoom === room.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold truncate">{room.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {room.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {room.category}
                      </Badge>
                      {room.location_region && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {room.location_region}
                        </Badge>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className={cn("lg:col-span-3 flex flex-col", !selectedRoom && "hidden lg:flex lg:items-center lg:justify-center")}>
        {!selectedRoom ? (
          <div className="text-center text-muted-foreground p-8">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a chatroom</p>
            <p className="text-sm">Join a community and start chatting!</p>
          </div>
        ) : (
          <>
            <CardHeader className="border-b p-4 shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSelectedRoom(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <CardTitle className="text-lg">{selectedChatroom?.name}</CardTitle>
                  <CardDescription>{selectedChatroom?.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {members?.length || 0} members
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <div className="flex-1 flex overflow-hidden">
              {/* Messages */}
              <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <AnimatePresence>
                    <div className="space-y-4">
                      {messages?.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={msg.profile?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {msg.profile?.display_name?.[0] || msg.profile?.username?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium text-sm">
                                {msg.profile?.display_name || msg.profile?.username || 'Anonymous'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm mt-0.5 break-words">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </AnimatePresence>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t shrink-0">
                  {isMember ? (
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
                  ) : (
                    <Button onClick={() => handleJoinRoom(selectedRoom)} className="w-full">
                      Join Room to Chat
                    </Button>
                  )}
                </div>
              </div>

              {/* Members Sidebar (desktop only) */}
              <div className="hidden xl:block w-48 border-l">
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">Members</h4>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="p-2 space-y-1">
                    {members?.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.profile?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {member.profile?.display_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">
                          {member.profile?.display_name || member.profile?.username || 'Anonymous'}
                        </span>
                        {member.role === 'admin' && (
                          <Badge variant="secondary" className="text-xs ml-auto">
                            Admin
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
