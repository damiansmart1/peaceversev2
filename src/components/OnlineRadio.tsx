import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
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
  Settings
} from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  description: string;
  isLive: boolean;
  listeners: number;
  category: string;
}

const OnlineRadio = () => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [liveListeners, setLiveListeners] = useState(247);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const radioStations: RadioStation[] = [
    {
      id: '1',
      name: 'Peace Radio',
      description: 'Youth voices for peace and unity across Kenya',
      isLive: true,
      listeners: 1247,
      category: 'Peace Building'
    },
    {
      id: '2', 
      name: 'Community Stories FM',
      description: 'Sharing stories that build bridges in communities',
      isLive: true,
      listeners: 832,
      category: 'Community'
    },
    {
      id: '3',
      name: 'Unity Voices',
      description: 'Promoting dialogue and understanding',
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
  }, []);

  useEffect(() => {
    // Simulate live listener count updates
    const interval = setInterval(() => {
      setLiveListeners(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
      // Simulate radio stream (in real implementation, you'd connect to actual audio stream)
      setIsPlaying(true);
      toast({
        title: "Now Playing",
        description: `Tuned into ${currentStation.name} - ${currentStation.description}`,
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // In real implementation, send this to server for live broadcast
          console.log('Audio chunk available:', event.data);
        }
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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingTime(0);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
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
              Peace Community Radio
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            Connecting voices across Kenya for peace and unity
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
                  <span>{currentStation.listeners.toLocaleString()} listeners</span>
                </div>
                <Badge variant={currentStation.isLive ? "default" : "secondary"}>
                  {currentStation.isLive ? "LIVE" : "OFFLINE"}
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
              disabled={!currentStation?.isLive}
            >
              {isPlaying ? (
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
              <h4 className="font-semibold mb-2">Share Your Voice</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Join the conversation and share your thoughts with the community
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
                  Start Broadcasting
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <MicOff className="h-4 w-4" />
                    Stop Broadcasting
                  </Button>
                  <div className="flex items-center gap-2 text-destructive">
                    <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm font-mono">
                      LIVE {formatTime(recordingTime)}
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
              Like
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              Comment
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Stations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Available Stations
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
                        {station.isLive ? "LIVE" : "OFFLINE"}
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
        onLoadStart={() => console.log('Audio loading started')}
        onError={(e) => {
          console.error('Audio error:', e);
          toast({
            title: "Playback Error",
            description: "Unable to stream audio. Please try again.",
            variant: "destructive"
          });
        }}
      />
    </div>
  );
};

export default OnlineRadio;