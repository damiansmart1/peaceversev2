import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Copy, 
  MessageCircle, 
  Instagram, 
  Twitter, 
  Mail,
  Video,
  ExternalLink
} from "lucide-react";

interface ShareDialogProps {
  audioUrl: string;
  children: React.ReactNode;
}

const ShareDialog = ({ audioUrl, children }: ShareDialogProps) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Convert blob URL to shareable file
  const prepareForSharing = async () => {
    setIsUploading(true);
    try {
      // Get the audio blob from the URL
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      // Create a temporary URL that can be shared
      const tempUrl = URL.createObjectURL(blob);
      setShareUrl(tempUrl);
      
      toast({
        title: "Ready to Share",
        description: "Your recording is ready to be shared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare recording for sharing",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || audioUrl);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'peace-story.wav';
    link.click();
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Listen to my Story for Peace');
    const body = encodeURIComponent('I recorded a story about peace and wanted to share it with you. This is part of the PeaceVerse community initiative.');
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent('Listen to my story for peace! 🕊️ This is part of the PeaceVerse community initiative.');
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent('Just shared my story for peace! 🕊️ Join the PeaceVerse community #PeaceVerse #StoriesForPeace');
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const sharePlatformInstructions = (platform: string) => {
    toast({
      title: `Share on ${platform}`,
      description: "Download the audio file and upload it to your story or post",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Share Your Story
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Prepare for sharing */}
          {!shareUrl && (
            <Button 
              onClick={prepareForSharing} 
              disabled={isUploading}
              className="w-full"
              variant="default"
            >
              {isUploading ? "Preparing..." : "Prepare for Sharing"}
            </Button>
          )}

          {/* Share URL Input */}
          {shareUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Link</label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Download Option */}
          <div className="space-y-3">
            <h4 className="font-medium">Download & Share</h4>
            <Button 
              variant="outline" 
              onClick={downloadAudio}
              className="w-full justify-start"
            >
              <Upload className="w-4 h-4 mr-2" />
              Download Audio File
            </Button>
          </div>

          {/* Quick Share Options */}
          <div className="space-y-3">
            <h4 className="font-medium">Quick Share</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={shareViaWhatsApp}
                className="justify-start"
              >
                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
              
              <Button 
                variant="outline" 
                onClick={shareViaTwitter}
                className="justify-start"
              >
                <Twitter className="w-4 h-4 mr-2 text-blue-500" />
                X (Twitter)
              </Button>
              
              <Button 
                variant="outline" 
                onClick={shareViaEmail}
                className="justify-start"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                className="justify-start"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Social Media Instructions */}
          <div className="space-y-3">
            <h4 className="font-medium">Social Media</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => sharePlatformInstructions('Instagram')}
                className="justify-start"
              >
                <Instagram className="w-4 h-4 mr-2 text-pink-500" />
                Instagram
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => sharePlatformInstructions('TikTok')}
                className="justify-start"
              >
                <Video className="w-4 h-4 mr-2" />
                TikTok
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              For Instagram and TikTok: Download the audio file and add it to your story or video content.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;