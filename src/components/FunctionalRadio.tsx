import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslationContext } from './TranslationProvider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Radio, 
  Users, 
  Heart,
  MessageCircle,
  Share2,
  Settings,
  Loader2
} from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  description: string;
  isLive: boolean;
  listeners: number;
  category: string;
  streamUrl?: string;
}

const FunctionalRadio = () => {
  const { toast } = useToast();
  const { t } = useTranslationContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [liveListeners, setLiveListeners] = useState(247);
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sample audio chunks for demo (in production, use real audio files)
  const demoAudioChunks = [
    'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmwhBkKa3O/Ddicer3+8++OVRwsTY7Xo3m8uFH'
  ];

  const radioStations: RadioStation[] = [
    {
      id: '1',
      name: t('radio.station.peace'),
      description: t('radio.station.peace.desc'),
      isLive: true,
      listeners: 1247,
      category: 'Peace Building',
      streamUrl: 'https://ice1.somafm.com/groovesalad-256-mp3' // Demo stream
    },
    {
      id: '2', 
      name: t('radio.station.community'),
      description: t('radio.station.community.desc'),
      isLive: true,
      listeners: 832,
      category: 'Community',
      streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3' // Demo stream
    },
    {
      id: '3',
      name: t('radio.station.unity'),
      description: t('radio.station.unity.desc'),
      isLive: false,
      listeners: 0,
      category: 'Dialogue'
    }
  ];

  useEffect(() => {
    // Auto-select first live station
    const firstLiveStation = radioStations.find(station => station.isLive);
    if (firstLiveStation && !currentStation) {
      setCurrentStation(firstLiveStation);
    }
  }, [radioStations]);

  useEffect(() => {
    // Simulate live listener count updates
    const interval = setInterval(() => {
      setLiveListeners(prev => Math.max(100, prev + Math.floor(Math.random() * 10) - 5));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize audio element with proper settings
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
      audioRef.current.crossOrigin = 'anonymous';
      
      // Audio event listeners
      const audio = audioRef.current;
      
      const handleLoadStart = () => setIsLoading(true);
      const handleCanPlay = () => setIsLoading(false);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleError = (e: Event) => {
        console.error('Audio error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "Unable to stream audio. Playing demo content instead.",
          variant: "destructive"
        });
        // Fallback to demo audio
        playDemoAudio();
      };

      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [volume, toast]);

  const playDemoAudio = () => {
    // Create a simple audio context for demo sounds
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 1);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1);
      
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 1000);
    } catch (error) {
      console.error('Demo audio error:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!currentStation) {
      toast({
        title: "No Station Selected",
        description: "Please select a radio station to start listening.",
        variant: "destructive"
      });
      return;
    }

    if (!currentStation.isLive) {
      toast({
        title: "Station Offline",
        description: "This station is currently offline. Please select a live station.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        toast({
          title: "Radio Paused",
          description: `Paused listening to ${currentStation.name}`,
        });
      } else {
        setIsLoading(true);
        
        if (audioRef.current && currentStation.streamUrl) {
          audioRef.current.src = currentStation.streamUrl;
          
          try {
            await audioRef.current.play();
            toast({
              title: "Now Playing",
              description: `Tuned into ${currentStation.name}`,
            });
          } catch (playError) {
            console.error('Play error:', playError);
            // Fallback to demo audio
            playDemoAudio();
            toast({
              title: "Demo Mode",
              description: `Playing demo audio for ${currentStation.name}`,
            });
          }
        } else {
          // Fallback to demo audio if no stream URL
          playDemoAudio();
          toast({
            title: "Demo Mode",
            description: `Playing demo audio for ${currentStation.name}`,
          });
        }
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Toggle play/pause error:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Unable to play audio. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
    }
    if (isMuted && newVolume[0] > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      recordingStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      const recordedChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
          console.log('Recording chunk:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        console.log('Recording completed:', blob.size, 'bytes');
        
        // In real implementation, upload to server for broadcast
        // uploadToServer(blob);
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Live Broadcasting",
        description: "You're now sharing your voice with the community!",
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach(track => track.stop());
        recordingStreamRef.current = null;
      }
      
      setIsRecording(false);
      setRecordingTime(0);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      toast({
        title: "Broadcast Ended",
        description: "Thank you for sharing your voice with the community!",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectStation = (station: RadioStation) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentStation(station);
    setIsPlaying(false);
    toast({
      title: "Station Selected",
      description: `Selected ${station.name}`,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Radio Player */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="h-8 w-8 text-primary animate-pulse" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('radio.title')}
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            {t('radio.subtitle')}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Station Info */}
          {currentStation && (
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {currentStation.name}
              </h3>
              <p className="text-muted-foreground">{currentStation.description}</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{(currentStation.listeners + liveListeners).toLocaleString()} {t('radio.listeners')}</span>
                </div>
                <Badge variant={currentStation.isLive ? "default" : "secondary"}>
                  {currentStation.isLive ? t('radio.status.live') : t('radio.status.offline')}
                </Badge>
              </div>
            </div>
          )}

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={togglePlayPause}
              size="lg"
              className="h-16 w-16 rounded-full"
              disabled={!currentStation?.isLive || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>

            <div className="flex items-center gap-2 min-w-[200px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
              >
                {isMuted || volume[0] === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-8">
                {volume[0]}
              </span>
            </div>
          </div>

          {/* Voice Sharing Controls */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <div className="text-center">
              <h4 className="font-semibold mb-2">{t('radio.share.title')}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {t('radio.share.description')}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  {t('radio.share.start')}
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <MicOff className="h-4 w-4" />
                    {t('radio.share.stop')}
                  </Button>
                  <div className="flex items-center gap-2 text-destructive">
                    <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm font-mono">
                      {t('radio.share.live')} {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-1" />
              {t('common.like')}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              {t('common.comment')}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              {t('common.share')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Stations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('radio.stations.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {radioStations.map((station) => (
              <div
                key={station.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                  currentStation?.id === station.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                }`}
                onClick={() => selectStation(station)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{station.name}</h4>
                      <Badge 
                        variant={station.isLive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {station.isLive ? t('radio.status.live') : t('radio.status.offline')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {station.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{station.category}</span>
                      {station.isLive && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {station.listeners.toLocaleString()} listening
                        </span>
                      )}
                    </div>
                  </div>
                  {currentStation?.id === station.id && (
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for actual playback */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FunctionalRadio;