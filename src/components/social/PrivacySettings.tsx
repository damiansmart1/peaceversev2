import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Shield, Lock, Eye, EyeOff, Users, Globe, Bell, 
  Download, Trash2, UserX, MessageCircle, Heart,
  AlertTriangle, CheckCircle, Info, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PrivacySetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: 'visibility' | 'interactions' | 'notifications' | 'data';
}

const PRIVACY_SETTINGS: PrivacySetting[] = [
  { id: 'public_profile', label: 'Public Profile', description: 'Allow anyone to view your profile', icon: Globe, category: 'visibility' },
  { id: 'show_activity', label: 'Show Activity Status', description: 'Let others see when you\'re online', icon: Eye, category: 'visibility' },
  { id: 'searchable', label: 'Searchable Profile', description: 'Appear in search results', icon: Users, category: 'visibility' },
  { id: 'allow_messages', label: 'Allow Direct Messages', description: 'Let others send you private messages', icon: MessageCircle, category: 'interactions' },
  { id: 'allow_follows', label: 'Allow Follows', description: 'Let others follow your profile', icon: Users, category: 'interactions' },
  { id: 'show_likes', label: 'Show Liked Content', description: 'Display content you\'ve liked on your profile', icon: Heart, category: 'interactions' },
  { id: 'notify_follows', label: 'New Follower Notifications', description: 'Get notified when someone follows you', icon: Bell, category: 'notifications' },
  { id: 'notify_messages', label: 'Message Notifications', description: 'Get notified for new messages', icon: Bell, category: 'notifications' },
  { id: 'notify_likes', label: 'Like Notifications', description: 'Get notified when someone likes your content', icon: Bell, category: 'notifications' },
];

export const PrivacySettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<Record<string, boolean>>({
    public_profile: true,
    show_activity: true,
    searchable: true,
    allow_messages: true,
    allow_follows: true,
    show_likes: false,
    notify_follows: true,
    notify_messages: true,
    notify_likes: true,
  });

  const [exportingData, setExportingData] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSettingChange = (id: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [id]: value }));
    toast.success('Setting updated');
  };

  const exportData = async () => {
    if (!user?.id) return;
    
    setExportingData(true);
    try {
      // Fetch all user data
      const [profileRes, contentRes, messagesRes, followsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('content').select('*').eq('user_id', user.id),
        supabase.from('direct_messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from('user_follows').select('*').or(`follower_id.eq.${user.id},following_id.eq.${user.id}`),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profileRes.data,
        content: contentRes.data,
        messages: messagesRes.data,
        follows: followsRes.data,
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `peaceverse-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExportingData(false);
    }
  };

  const deleteAccount = async () => {
    if (!user?.id) return;
    
    try {
      // Delete user content
      await supabase.from('content').delete().eq('user_id', user.id);
      await supabase.from('direct_messages').delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      await supabase.from('user_follows').delete().or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);
      await supabase.from('likes').delete().eq('user_id', user.id);
      await supabase.from('comments').delete().eq('user_id', user.id);
      await supabase.from('chatroom_members').delete().eq('user_id', user.id);
      
      // Sign out
      await supabase.auth.signOut();
      
      toast.success('Account deleted successfully');
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const renderSettingGroup = (category: string, title: string, description: string) => {
    const categorySettings = PRIVACY_SETTINGS.filter(s => s.category === category);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categorySettings.map((setting, index) => (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <setting.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor={setting.id} className="font-medium cursor-pointer">
                    {setting.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
              </div>
              <Switch
                id={setting.id}
                checked={settings[setting.id]}
                onCheckedChange={(value) => handleSettingChange(setting.id, value)}
              />
            </motion.div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Privacy & Safety</h2>
          <p className="text-muted-foreground">Manage your data and privacy settings</p>
        </div>
      </div>

      {/* Safety Tips */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Safety Tips</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• Never share personal information in public posts</li>
                <li>• Be cautious when accepting messages from strangers</li>
                <li>• Report suspicious or harmful content immediately</li>
                <li>• Regularly review your privacy settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings Groups */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderSettingGroup('visibility', 'Profile Visibility', 'Control who can see your profile and activity')}
        {renderSettingGroup('interactions', 'Interactions', 'Manage how others can interact with you')}
      </div>

      {renderSettingGroup('notifications', 'Notification Preferences', 'Choose what notifications you receive')}

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Data
          </CardTitle>
          <CardDescription>Download or delete your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Export Your Data</p>
                <p className="text-xs text-muted-foreground">
                  Download a copy of all your data including posts, messages, and profile info
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={exportData}
              disabled={exportingData}
            >
              {exportingData ? 'Exporting...' : 'Export'}
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
            </div>
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Account Permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your data will be permanently deleted including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All posts and content</li>
                      <li>All messages and conversations</li>
                      <li>All followers and following relationships</li>
                      <li>All earnings and wallet balance</li>
                      <li>Your profile and account information</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={deleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Blocked Users
          </CardTitle>
          <CardDescription>Manage users you've blocked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You haven't blocked anyone yet</p>
            <p className="text-sm mt-1">
              Blocked users cannot see your profile or message you
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function for date formatting
const format = (date: Date, formatStr: string) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
