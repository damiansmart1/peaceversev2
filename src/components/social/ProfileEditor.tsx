import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Camera, User, AtSign, FileText, Link as LinkIcon, 
  Twitter, Instagram, Globe, Save, X, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProfileEditorProps {
  profile: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileEditor = ({ profile, open, onOpenChange }: ProfileEditorProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [socialLinks, setSocialLinks] = useState({
    website: profile?.social_links?.website || '',
    twitter: profile?.social_links?.twitter || '',
    instagram: profile?.social_links?.instagram || '',
  });

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      let avatarUrl = profile?.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        // First, try to remove old avatar if it exists
        const oldAvatarPath = profile?.avatar_url?.split('/avatars/')[1];
        if (oldAvatarPath) {
          await supabase.storage.from('avatars').remove([oldAvatarPath]);
        }

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { 
            upsert: true,
            cacheControl: '3600',
            contentType: avatarFile.type
          });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          throw new Error(`Failed to upload avatar: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        // Add cache-busting timestamp
        avatarUrl = `${publicUrl}?t=${Date.now()}`;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
          social_links: socialLinks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information visible to others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={avatarPreview || ''} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {displayName?.[0] || username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={50}
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <AtSign className="h-4 w-4" />
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username"
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground">
              Only letters, numbers, and underscores
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Social Links
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                  placeholder="@username"
                />
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
