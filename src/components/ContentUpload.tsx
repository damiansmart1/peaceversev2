import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Video, Image, Music, Eye, FileEdit } from "lucide-react";
import RichTextEditor from '@/components/RichTextEditor';
import ContentPreview from '@/components/ContentPreview';

const ContentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('general');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [webLinks, setWebLinks] = useState<string[]>(['']);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      // For images, resize and compress; for videos/audio, check size only
      if (selectedFile.type.startsWith('image/')) {
        const { processUploadedImage } = await import('@/lib/imageUtils');
        const processedFile = await processUploadedImage(selectedFile, 2);
        setFile(processedFile);
        toast({
          title: "Image processed",
          description: "Image has been optimized for upload",
        });
      } else {
        // For videos and audio, enforce 100MB limit
        if (selectedFile.size > 100 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Videos/audio must be smaller than 100MB",
            variant: "destructive",
          });
          return;
        }
        setFile(selectedFile);
      }
    } catch (error) {
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    }
  };

  const getFileType = (file: File): string => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'other';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return <Upload className="w-4 h-4" />;
    }
  };

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addWebLink = () => {
    setWebLinks(prev => [...prev, '']);
  };

  const updateWebLink = (index: number, value: string) => {
    setWebLinks(prev => prev.map((link, i) => i === index ? value : link));
  };

  const removeWebLink = (index: number) => {
    setWebLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    console.log('Upload initiated', { hasFile: !!file, title });
    
    if (!file || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file",
        variant: "destructive",
      });
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check', { hasUser: !!user, authError });
    
    if (authError) {
      console.error('Auth error:', authError);
      toast({
        title: "Authentication error",
        description: authError.message,
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload content",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Upload main file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading file to storage', { fileName, fileSize: file.size, fileType: file.type });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file);

      console.log('Storage upload result', { uploadData, uploadError });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);

      // Upload additional attachments
      const uploadedAttachments = [];
      for (const attachment of attachments) {
        const attExt = attachment.name.split('.').pop();
        const attFileName = `${user.id}/attachments/${Date.now()}-${Math.random().toString(36).substring(7)}.${attExt}`;
        
        const { error: attError } = await supabase.storage
          .from('content')
          .upload(attFileName, attachment);

        if (!attError) {
          const { data: { publicUrl: attUrl } } = supabase.storage
            .from('content')
            .getPublicUrl(attFileName);
          
          uploadedAttachments.push({
            type: attachment.type.startsWith('image/') ? 'image' : 
                  attachment.type.startsWith('video/') ? 'video' :
                  attachment.type === 'application/pdf' ? 'pdf' : 'file',
            url: attUrl,
            name: attachment.name
          });
        }
      }

      // Add valid web links
      const validLinks = webLinks.filter(link => link.trim() !== '');
      validLinks.forEach(link => {
        uploadedAttachments.push({
          type: 'link',
          url: link,
          name: link
        });
      });

      // Save content metadata to database
      console.log('Inserting content metadata to database', {
        user_id: user.id,
        title: title.trim(),
        file_url: publicUrl,
        file_type: getFileType(file),
        category: category
      });
      
      const { error: dbError } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          file_url: publicUrl,
          file_type: getFileType(file),
          category: category,
          attachments: uploadedAttachments
        });

      console.log('Database insert result', { dbError });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      toast({
        title: "Upload successful!",
        description: "Your content has been shared with the community",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setCategory('general');
      setAttachments([]);
      setWebLinks(['']);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      const attInput = document.getElementById('attachments-upload') as HTMLInputElement;
      if (attInput) attInput.value = '';

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || error?.error_description || 'There was an error uploading your content';
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Share Your Content
        </CardTitle>
        {!currentUser && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ You must be <a href="/auth" className="underline font-medium">logged in</a> to upload content
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="edit" className="gap-2">
              <FileEdit className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your content a catchy title..."
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="Tell us about your content..."
                minHeight="200px"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Content Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="general">General Content</option>
                <option value="peace_stories">Peace Stories</option>
                <option value="voice_stories">Voice Stories</option>
                <option value="community">Community</option>
                <option value="radio">Radio Content</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Select where this content will appear on the platform
              </p>
            </div>

            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                Main Content File *
              </label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="video/*,image/*,audio/*"
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      {getFileIcon(getFileType(file))}
                      <span className="font-medium">{file.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Click to upload video, image, or audio
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Max file size: 100MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="attachments-upload" className="block text-sm font-medium mb-2">
                Additional Attachments (Images/Videos/PDFs)
              </label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  id="attachments-upload"
                  type="file"
                  onChange={handleAttachmentsChange}
                  accept="image/*,video/*,application/pdf"
                  multiple
                  className="hidden"
                />
                <label htmlFor="attachments-upload" className="cursor-pointer block text-center">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to add attachments
                  </p>
                </label>
                
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm truncate">{att.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(idx)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Web Links & Embedded Links
              </label>
              <div className="space-y-2">
                {webLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={link}
                      onChange={(e) => updateWebLink(idx, e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                    />
                    {webLinks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWebLink(idx)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWebLink}
                  className="w-full"
                >
                  + Add Link
                </Button>
              </div>
            </div>

            <Button
              onClick={handleUpload} 
              disabled={uploading || !file || !title.trim() || !currentUser}
              className="w-full"
            >
              {!currentUser ? "Please login to upload" : uploading ? "Uploading..." : "Share Content"}
            </Button>
          </TabsContent>

          <TabsContent value="preview">
            <ContentPreview
              title={title}
              body={description}
              additionalInfo={
                file && (
                  <div className="flex items-center gap-2">
                    {getFileIcon(getFileType(file))}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getFileType(file)} • {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                )
              }
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentUpload;