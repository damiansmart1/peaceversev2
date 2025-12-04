import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Image, Video, Mic, Send, X, Loader2, Camera 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';

interface QuickPostCreatorProps {
  onOpenFullCreator?: () => void;
}

export const QuickPostCreator = ({ onOpenFullCreator }: QuickPostCreatorProps) => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!content.trim() && !selectedFile) throw new Error('Please add content or media');

      let fileUrl = '';
      let fileType = 'text';

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('content')
          .getPublicUrl(fileName);

        fileUrl = urlData.publicUrl;
        fileType = selectedFile.type;
      }

      // Create content record
      const { error } = await supabase.from('content').insert({
        user_id: user.id,
        title: content.slice(0, 100) || 'Quick Post',
        description: content,
        file_url: fileUrl || 'https://placehold.co/400x300/074F98/ffffff?text=Post',
        file_type: fileType,
        category: 'community',
        approval_status: 'approved', // Quick posts auto-approved
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Post shared successfully!');
      setContent('');
      setSelectedFile(null);
      setFilePreview(null);
      setIsExpanded(false);
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to share post');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    
    setIsExpanded(true);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !selectedFile) {
      toast.error('Please add some content or media');
      return;
    }
    uploadMutation.mutate();
  };

  if (!user) return null;

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {profile?.display_name?.[0] || user.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="What's on your mind? Share your peace story..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (e.target.value) setIsExpanded(true);
              }}
              onFocus={() => setIsExpanded(true)}
              className={`resize-none border-none shadow-none focus-visible:ring-0 p-0 ${
                isExpanded ? 'min-h-[80px]' : 'min-h-[40px]'
              }`}
            />

            {/* File Preview */}
            <AnimatePresence>
              {filePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative rounded-lg overflow-hidden"
                >
                  {selectedFile?.type.startsWith('image/') ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full max-h-[300px] object-cover rounded-lg"
                    />
                  ) : selectedFile?.type.startsWith('video/') ? (
                    <video
                      src={filePreview}
                      className="w-full max-h-[300px] rounded-lg"
                      controls
                    />
                  ) : (
                    <div className="p-4 bg-muted rounded-lg flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      <span>{selectedFile?.name}</span>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between pt-2 border-t"
                >
                  <div className="flex items-center gap-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = 'image/*';
                          fileInputRef.current.click();
                        }
                      }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Image className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = 'video/*';
                          fileInputRef.current.click();
                        }
                      }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = 'audio/*';
                          fileInputRef.current.click();
                        }
                      }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                    {onOpenFullCreator && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onOpenFullCreator}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Camera className="h-5 w-5 mr-1" />
                        <span className="text-xs">More options</span>
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {content.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {content.length}/500
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={uploadMutation.isPending || (!content.trim() && !selectedFile)}
                    >
                      {uploadMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Send className="h-4 w-4 mr-1" />
                      )}
                      Post
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickPostCreator;
