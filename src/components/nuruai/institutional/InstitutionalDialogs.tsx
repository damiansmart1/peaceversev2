import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell, Settings, BellRing, BellOff, Check, Clock, AlertTriangle,
  MessageSquareText, FileText, Building2, Shield, Globe, Eye,
  Mail, Volume2, Smartphone, Monitor, Palette, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// ── Notifications Dialog ──────────────────────────────────────────
interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unansweredCount: number;
  questions: any[];
  responses: any[];
}

export const NotificationsDialog = ({ open, onOpenChange, unansweredCount, questions, responses }: NotificationsDialogProps) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  // Generate notifications from data
  const notifications = useMemo(() => {
    const notifs: { id: string; type: string; title: string; message: string; time: string; read: boolean; priority: string; icon: typeof Bell }[] = [];

    // Unanswered questions as notifications
    questions?.filter((q: any) => {
      const hasResponse = responses?.some((r: any) => r.question_id === q.id);
      return !hasResponse && q.is_public;
    }).slice(0, 8).forEach((q: any, i: number) => {
      notifs.push({
        id: q.id,
        type: 'civic_question',
        title: 'New Civic Question',
        message: q.question_text?.slice(0, 100) + '...',
        time: q.created_at,
        read: i > 2,
        priority: (q.upvote_count || 0) > 10 ? 'high' : 'normal',
        icon: MessageSquareText,
      });
    });

    // Recent responses as notifications
    responses?.slice(0, 3).forEach((r: any) => {
      notifs.push({
        id: `resp-${r.id}`,
        type: 'response_published',
        title: 'Response Published',
        message: `${r.institution_name}: ${r.response_text?.slice(0, 80)}...`,
        time: r.created_at,
        read: true,
        priority: 'normal',
        icon: Check,
      });
    });

    // System notifications
    notifs.push({
      id: 'sys-1',
      type: 'system',
      title: 'Response Rate Update',
      message: 'Your institutional response rate has improved by 5% this month.',
      time: new Date().toISOString(),
      read: false,
      priority: 'normal',
      icon: Building2,
    });

    return notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [questions, responses]);

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.priority === 'high';
    return true;
  });

  const priorityStyles: Record<string, string> = {
    high: 'border-l-4 border-l-destructive bg-destructive/5',
    normal: 'border-l-4 border-l-transparent',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary" />
            Notifications
            {unansweredCount > 0 && (
              <Badge variant="destructive" className="text-[9px] px-1.5">{unansweredCount} pending</Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            Track civic questions, responses, and system alerts
          </DialogDescription>
        </DialogHeader>

        {/* Filter Tabs */}
        <div className="flex gap-1.5">
          {(['all', 'unread', 'urgent'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-[10px] capitalize"
              onClick={() => setFilter(f)}
            >
              {f === 'all' && <Bell className="h-3 w-3 mr-1" />}
              {f === 'unread' && <Eye className="h-3 w-3 mr-1" />}
              {f === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {f} ({f === 'all' ? notifications.length : f === 'unread' ? notifications.filter(n => !n.read).length : notifications.filter(n => n.priority === 'high').length})
            </Button>
          ))}
        </div>

        <ScrollArea className="max-h-[400px]">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <BellOff className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No notifications to display</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map(n => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer ${priorityStyles[n.priority]} ${!n.read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg shrink-0 ${!n.read ? 'bg-primary/10' : 'bg-muted/30'}`}>
                      <n.icon className={`h-3 w-3 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-[11px] font-medium ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                        {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.success('All notifications marked as read')}>
            <Check className="h-3 w-3 mr-1" /> Mark All Read
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Settings Dialog ──────────────────────────────────────────────
interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    urgentAlertsOnly: false,
    autoPublishResponses: false,
    requireApproval: true,
    publicProfile: true,
    institutionName: 'Your Institution',
    defaultLanguage: 'en',
    responseTemplate: '',
    darkMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Portal Settings
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            Configure notifications, response workflows, and institutional preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-8">
            <TabsTrigger value="notifications" className="text-[10px] gap-1"><Bell className="h-3 w-3" /> Alerts</TabsTrigger>
            <TabsTrigger value="workflow" className="text-[10px] gap-1"><Shield className="h-3 w-3" /> Workflow</TabsTrigger>
            <TabsTrigger value="profile" className="text-[10px] gap-1"><Building2 className="h-3 w-3" /> Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-4 space-y-4">
            {[
              { key: 'emailNotifications' as const, icon: Mail, label: 'Email Notifications', desc: 'Receive email alerts for new civic questions' },
              { key: 'pushNotifications' as const, icon: Smartphone, label: 'Push Notifications', desc: 'Browser push alerts for urgent matters' },
              { key: 'urgentAlertsOnly' as const, icon: AlertTriangle, label: 'Urgent Alerts Only', desc: 'Only notify for high-priority questions (10+ upvotes)' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-card/30">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <item.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key] as boolean}
                  onCheckedChange={() => toggleSetting(item.key)}
                />
              </div>
            ))}

            <div className="p-3 rounded-lg border border-border/20 bg-card/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">Notification Digest</p>
                  <p className="text-[9px] text-muted-foreground">Frequency of notification summaries</p>
                </div>
              </div>
              <Select defaultValue="daily">
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime" className="text-xs">Real-time</SelectItem>
                  <SelectItem value="hourly" className="text-xs">Hourly digest</SelectItem>
                  <SelectItem value="daily" className="text-xs">Daily digest</SelectItem>
                  <SelectItem value="weekly" className="text-xs">Weekly digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="mt-4 space-y-4">
            {[
              { key: 'autoPublishResponses' as const, icon: Check, label: 'Auto-Publish Responses', desc: 'Immediately publish responses without review' },
              { key: 'requireApproval' as const, icon: Lock, label: 'Require Approval', desc: 'Responses require secondary approval before publishing' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-card/30">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <item.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key] as boolean}
                  onCheckedChange={() => toggleSetting(item.key)}
                />
              </div>
            ))}

            <div className="p-3 rounded-lg border border-border/20 bg-card/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">Default Response Language</p>
                  <p className="text-[9px] text-muted-foreground">Language used for templates and auto-responses</p>
                </div>
              </div>
              <Select value={settings.defaultLanguage} onValueChange={v => setSettings(s => ({ ...s, defaultLanguage: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en" className="text-xs">English</SelectItem>
                  <SelectItem value="fr" className="text-xs">Français</SelectItem>
                  <SelectItem value="sw" className="text-xs">Kiswahili</SelectItem>
                  <SelectItem value="ar" className="text-xs">العربية</SelectItem>
                  <SelectItem value="pt" className="text-xs">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="p-3 rounded-lg border border-border/20 bg-card/30">
              <label className="text-[11px] font-medium text-muted-foreground">Institution Name</label>
              <Input
                className="h-8 text-xs mt-1.5"
                value={settings.institutionName}
                onChange={e => setSettings(s => ({ ...s, institutionName: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-card/30">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">Public Profile</p>
                  <p className="text-[9px] text-muted-foreground">Allow citizens to see your institution's profile</p>
                </div>
              </div>
              <Switch
                checked={settings.publicProfile}
                onCheckedChange={() => toggleSetting('publicProfile')}
              />
            </div>

            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-medium">Verification Status</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-200">✓ Verified Institution</Badge>
                <span className="text-[9px] text-muted-foreground">Verified on Feb 15, 2026</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="text-xs gap-1.5" onClick={handleSave}>
            <Check className="h-3 w-3" /> Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
