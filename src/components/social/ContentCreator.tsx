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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Upload, Image, Video, Music, X, Save, Send, Eye, 
  Lock, Globe, Users, Shield, AlertTriangle, CheckCircle,
  FileText, Sparkles, Camera, Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'peace', label: 'Peace Stories', icon: '🕊️' },
  { value: 'community', label: 'Community', icon: '🤝' },
  { value: 'culture', label: 'Culture & Heritage', icon: '🎭' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'youth', label: 'Youth Voices', icon: '🌟' },
  { value: 'environment', label: 'Environment', icon: '🌍' },
  { value: 'general', label: 'General', icon: '💬' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this post' },
  { value: 'followers', label: 'Followers Only', icon: Users, description: 'Only your followers can see' },
  { value: 'private', label: 'Private', icon: Lock, description: 'Only you can see this' },
];

interface ContentCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editContent?: any;
}

export const ContentCreator = ({ open, onOpenChange, editContent }: ContentCreatorProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState(editContent?.title || '');
  const [description, setDescription] = useState(editContent?.description || '');
  const [category, setCategory] = useState(editContent?.category || 'general');
  const [visibility, setVisibility] = useState('public');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(editContent?.file_url || null);
  const [fileType, setFileType] = useState<string>(editContent?.file_type || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraft, setIsDraft] = useState(false);
  const [contentWarning, setContentWarning] = useState(false);
  const [warningType, setWarningType] = useState('');
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('general');
    setVisibility('public');
    setFile(null);
    setFilePreview(null);
    setFileType('');
    setUploadProgress(0);
    setIsDraft(false);
    setContentWarning(false);
    setWarningType('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }

    // Validate file type
    const validTypes = ['image/', 'video/', 'audio/'];
    if (!validTypes.some(type => selectedFile.type.startsWith(type))) {
      toast.error('Invalid file type. Please upload an image, video, or audio file.');
      return;
    }

    setFile(selectedFile);
    setFileType(selectedFile.type);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!title.trim()) throw new Error('Title is required');

      let fileUrl = editContent?.file_url || '';

      // Upload file if new one selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        // Simulated progress (Supabase doesn't provide real progress)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('content')
          .upload(fileName, file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('content')
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
      }

      // Create or update content
      const contentData = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        file_url: fileUrl || 'placeholder',
        file_type: fileType || 'text/plain',
        approval_status: isDraft ? 'draft' : 'pending',
      };

      if (editContent?.id) {
        const { error } = await supabase
          .from('content')
          .update(contentData)
          .eq('id', editContent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content')
          .insert(contentData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social-profile'] });
      queryClient.invalidateQueries({ queryKey: ['my-content'] });
      toast.success(isDraft ? 'Saved as draft!' : 'Content submitted for review!');
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload content');
      setUploadProgress(0);
    },
  });

  const handleSubmit = (asDraft: boolean = false) => {
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }

    // Show safety check for new posts
    if (!editContent && !asDraft) {
      setShowSafetyCheck(true);
      return;
    }

    setIsDraft(asDraft);
    uploadMutation.mutate();
  };

  const confirmSubmit = () => {
    setShowSafetyCheck(false);
    uploadMutation.mutate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editContent ? 'Edit Content' : 'Create New Post'}
            </DialogTitle>
            <DialogDescription>
              Share your story with the community. All content is reviewed for safety.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                "hover:border-primary hover:bg-primary/5",
                filePreview ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <AnimatePresence mode="wait">
                {filePreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative"
                  >
                    {fileType.startsWith('image') && (
                      <img src={filePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    )}
                    {fileType.startsWith('video') && (
                      <video src={filePreview} className="max-h-64 mx-auto rounded-lg" controls />
                    )}
                    {fileType.startsWith('audio') && (
                      <div className="p-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                        <Music className="h-16 w-16 mx-auto text-primary mb-4" />
                        <audio src={filePreview} className="w-full" controls />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFilePreview(null);
                        setFileType('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-full">
                        <Image className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="p-3 bg-purple-500/10 rounded-full">
                        <Video className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-full">
                        <Music className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Click to upload media</p>
                      <p className="text-sm text-muted-foreground">
                        Images, videos, or audio (max 50MB)
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a title..."
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell your story..."
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/2000</p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Visibility */}
            <div className="space-y-3">
              <Label>Visibility</Label>
              <div className="grid gap-2">
                {VISIBILITY_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    onClick={() => setVisibility(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      visibility === option.value 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <option.icon className={cn(
                      "h-5 w-5",
                      visibility === option.value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    {visibility === option.value && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content Warning Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Content Warning</p>
                  <p className="text-xs text-muted-foreground">
                    Add a warning if your content may be sensitive
                  </p>
                </div>
              </div>
              <Switch checked={contentWarning} onCheckedChange={setContentWarning} />
            </div>

            {contentWarning && (
              <Select value={warningType} onValueChange={setWarningType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warning type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sensitive">Sensitive Content</SelectItem>
                  <SelectItem value="violence">Violence/Conflict</SelectItem>
                  <SelectItem value="distressing">Potentially Distressing</SelectItem>
                  <SelectItem value="mature">Mature Themes</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Safety Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">Safety First</p>
                <p className="text-blue-700 dark:text-blue-300">
                  All content is reviewed before publishing to ensure community safety. 
                  Personal information is protected according to our privacy policy.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSubmit(true)}
              disabled={uploadMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSubmit(false)}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>Uploading...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {editContent ? 'Update' : 'Publish'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Safety Check Dialog */}
      <Dialog open={showSafetyCheck} onOpenChange={setShowSafetyCheck}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Content Safety Check
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Before publishing, please confirm:
            </p>
            <ul className="space-y-3">
              {[
                'My content does not contain personal identifying information of others',
                'My content does not promote violence or hate',
                'My content is original or I have permission to share it',
                'My content complies with community guidelines'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSafetyCheck(false)}>
              Go Back
            </Button>
            <Button onClick={confirmSubmit}>
              I Confirm & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
