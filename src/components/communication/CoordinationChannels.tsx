import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Send, 
  Hash, 
  Users, 
  AlertCircle,
  Pin,
  MoreVertical,
  Shield,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  useChannels, 
  useChannelMessages, 
  useSendMessage, 
  useCreateChannel,
  AlertSeverityLevel 
} from '@/hooks/useCommunication';
import { useAuth } from '@/contexts/AuthContext';

const priorityColors: Record<AlertSeverityLevel, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

const priorityLabels: Record<AlertSeverityLevel, string> = {
  green: 'Normal',
  yellow: 'Elevated',
  orange: 'High',
  red: 'Critical',
};

const CoordinationChannels: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messagePriority, setMessagePriority] = useState<AlertSeverityLevel>('green');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelType, setNewChannelType] = useState('coordination');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const { data: messages, isLoading: messagesLoading } = useChannelMessages(selectedChannel || undefined);
  const sendMessage = useSendMessage();
  const createChannel = useCreateChannel();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;
    
    await sendMessage.mutateAsync({
      channelId: selectedChannel,
      content: newMessage,
      priority: messagePriority,
    });
    
    setNewMessage('');
    setMessagePriority('green');
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    
    await createChannel.mutateAsync({
      name: newChannelName,
      description: newChannelDescription,
      channel_type: newChannelType as any,
    });
    
    setNewChannelName('');
    setNewChannelDescription('');
    setIsCreateOpen(false);
  };

  const selectedChannelData = channels?.find(c => c.id === selectedChannel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-400px)] min-h-[500px]">
      {/* Channels List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Channels
            </CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Channel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Channel Name</Label>
                    <Input
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="e.g., Horn of Africa Coordination"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newChannelDescription}
                      onChange={(e) => setNewChannelDescription(e.target.value)}
                      placeholder="Channel purpose and scope..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Channel Type</Label>
                    <Select value={newChannelType} onValueChange={setNewChannelType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coordination">Coordination</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="field_report">Field Reporting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateChannel} className="w-full">
                    Create Channel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {channelsLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : channels?.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No channels yet</p>
                <p className="text-xs">Create one to get started</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {channels?.map((channel) => (
                  <motion.div
                    key={channel.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2 h-auto py-3"
                      onClick={() => setSelectedChannel(channel.id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {channel.is_emergency ? (
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        ) : (
                          <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="text-left truncate">
                          <p className="font-medium truncate">{channel.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {channel.channel_type}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="lg:col-span-3 flex flex-col">
        {selectedChannel ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedChannelData?.is_emergency ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Hash className="h-5 w-5" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{selectedChannelData?.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {selectedChannelData?.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedChannelData?.allowed_roles?.length || 0} roles
                  </Badge>
                  {selectedChannelData?.country_scope && selectedChannelData.country_scope.length > 0 && (
                    <Badge variant="outline">
                      <Globe className="h-3 w-3 mr-1" />
                      {selectedChannelData.country_scope.length} countries
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <AnimatePresence>
                  {messagesLoading ? (
                    <div className="text-center text-muted-foreground py-8">
                      Loading messages...
                    </div>
                  ) : messages?.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex gap-3 ${
                            message.sender_id === user?.id ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs">
                              {message.sender_id?.slice(0, 2).toUpperCase() || 'UN'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[70%] ${
                            message.sender_id === user?.id ? 'text-right' : ''
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {message.sender_id === user?.id ? 'You' : 'User'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(message.created_at), 'HH:mm')}
                              </span>
                              {message.priority !== 'green' && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${priorityColors[message.priority]} text-white border-0`}
                                >
                                  {priorityLabels[message.priority]}
                                </Badge>
                              )}
                              {message.is_pinned && (
                                <Pin className="h-3 w-3 text-primary" />
                              )}
                            </div>
                            <div className={`rounded-lg p-3 ${
                              message.sender_id === user?.id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Select value={messagePriority} onValueChange={(v) => setMessagePriority(v as AlertSeverityLevel)}>
                    <SelectTrigger className="w-32">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${priorityColors[messagePriority]}`} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(priorityLabels) as AlertSeverityLevel[]).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${priorityColors[priority]}`} />
                            {priorityLabels[priority]}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">Priority Level</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="font-semibold text-lg mb-1">Select a Channel</h3>
              <p className="text-sm">Choose a coordination channel to start communicating</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CoordinationChannels;
