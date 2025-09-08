import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Share your story for peace",
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Please check microphone permissions",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      toast({
        title: "Recording Complete",
        description: "Your story has been captured",
      });
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-8 max-w-md mx-auto bg-card/80 backdrop-blur-sm border-accent/20 shadow-story">
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-semibold text-card-foreground">Share Your Voice</h3>
        <p className="text-muted-foreground">
          Record your story to inspire peace and understanding
        </p>

        {/* Recording Indicator */}
        <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording ? 'voice-recording animate-pulse-recording' : 'bg-muted'
        }`}>
          <Mic className={`w-12 h-12 ${isRecording ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
        </div>

        {/* Recording Time */}
        {isRecording && (
          <div className="text-2xl font-mono text-voice-recording">
            {formatTime(recordingTime)}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!isRecording ? (
            <Button 
              variant="voice" 
              size="lg" 
              onClick={startRecording}
              className="px-8"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              size="lg" 
              onClick={stopRecording}
              className="px-8"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* Playback Controls */}
        {audioUrl && (
          <div className="space-y-4 pt-4 border-t border-border">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={isPlaying ? pauseRecording : playRecording}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button variant="success" size="sm">
                <Upload className="w-4 h-4" />
                Share Story
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoiceRecorder;